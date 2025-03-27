import { useState, useEffect, useRef } from 'react';
import { useLatest } from './use-latest';
import {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionConstructor,
  UseSpeechRecognitionOptions,
  SpeechRecognitionHookResult,
} from '../types/speech-recognition';
import { logger } from '../lib/logger';

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}): SpeechRecognitionHookResult => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [waveform, setWaveform] = useState<number[]>(Array(50).fill(0)); // 파형 초기값

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const onResultLatest = useLatest(options.onResult);
  const onFinalResultLatest = useLatest(options.onFinalResult);
  const onErrorLatest = useLatest(options.onError);

  // 파형 데이터 업데이트 함수
  const updateWaveform = () => {
    if (!analyserRef.current || !isListening) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);

    // 데이터를 정규화하여 0-1 사이의 값으로 변환
    const normalizedData = Array.from(dataArray).map((val) => (val - 128) / 128);

    // 표시할 데이터 포인트 수를 50개로 제한
    const downsampled: number[] = [];
    const step = Math.floor(normalizedData.length / 50) || 1;
    for (let i = 0; i < normalizedData.length; i += step) {
      if (downsampled.length < 50) {
        downsampled.push(Math.abs(normalizedData[i]));
      }
    }

    setWaveform(downsampled);
    requestAnimationFrame(updateWaveform);
  };

  // 오디오 컨텍스트 및 분석기 설정
  const setupAudioAnalyser = async () => {
    try {
      logger.speech.debug('오디오 분석기 설정 시작');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 256;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      logger.speech.debug('오디오 분석기 설정 완료');
      requestAnimationFrame(updateWaveform);
    } catch (err) {
      logger.speech.error('오디오 분석기 설정 오류:', err);
      setError('오디오 접근 권한이 필요합니다.');
    }
  };

  // 오디오 분석기 정리
  const cleanupAudioAnalyser = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      logger.speech.debug('오디오 컨텍스트 정리됨');
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      logger.speech.debug('미디어 스트림 정리됨');
    }

    analyserRef.current = null;
  };

  useEffect(() => {
    logger.speech.info('음성 인식 초기화 시작');
    // 브라우저 SpeechRecognition API 확인
    const SpeechRecognitionAPI = (window.SpeechRecognition || (window as any).webkitSpeechRecognition) as
      | SpeechRecognitionConstructor
      | undefined;

    if (!SpeechRecognitionAPI) {
      const errorMsg = '이 브라우저는 음성 인식을 지원하지 않습니다.';
      logger.speech.error(errorMsg);
      setError(errorMsg);
      return;
    }

    // SpeechRecognition 인스턴스 생성
    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;

    if (recognition) {
      recognition.continuous = options.continuous ?? true;
      recognition.interimResults = options.interimResults ?? true;
      recognition.lang = options.lang ?? 'ko-KR';
      logger.speech.debug(`음성 인식 설정: 언어=${recognition.lang}, 연속=${recognition.continuous}`);

      // 음성 인식 결과 처리
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscriptValue = '';
        let finalTranscriptValue = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscriptValue += transcript + ' ';
            logger.speech.info('최종 음성 인식 결과:', transcript);
            onFinalResultLatest.current?.(transcript);
          } else {
            interimTranscriptValue += transcript;
            logger.speech.debug('임시 음성 인식 결과:', transcript);
          }
        }

        setTranscript(interimTranscriptValue);
        onResultLatest.current?.(interimTranscriptValue, false);

        if (finalTranscriptValue) {
          setFinalTranscript((prev) => {
            const updated = prev + finalTranscriptValue;
            return updated;
          });
          onResultLatest.current?.(finalTranscriptValue, true);
        }
      };

      // 오류 처리
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMessage = `음성 인식 오류: ${event.error}`;
        logger.speech.error(errorMessage);
        setError(errorMessage);
        setIsListening(false);
        onErrorLatest.current?.(errorMessage);
        cleanupAudioAnalyser();
      };

      // 음성 인식 시작/종료 이벤트
      recognition.onstart = () => {
        logger.speech.info('음성 인식 시작됨');
        setIsListening(true);
        setError(null);
        setupAudioAnalyser();
      };

      recognition.onend = () => {
        logger.speech.info('음성 인식 종료됨');
        setIsListening(false);
        cleanupAudioAnalyser();
      };

      logger.speech.info('음성 인식 초기화 완료');
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (recognitionRef.current) {
        logger.speech.info('음성 인식 정리');
        recognitionRef.current.abort();
      }
      cleanupAudioAnalyser();
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      const errorMsg = '음성 인식을 초기화할 수 없습니다.';
      logger.speech.error(errorMsg);
      setError(errorMsg);
      return;
    }

    logger.speech.info('음성 인식 시작 요청');
    setTranscript('');
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    logger.speech.info('음성 인식 중지 요청');
    recognitionRef.current.stop();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const resetTranscript = () => {
    logger.speech.info('음성 인식 결과 초기화');
    setTranscript('');
    setFinalTranscript('');
  };

  return {
    transcript,
    interimTranscript: transcript,
    finalTranscript,
    isListening,
    error,
    waveform,
    resetTranscript,
    startListening,
    stopListening,
    toggleListening,
  };
};
