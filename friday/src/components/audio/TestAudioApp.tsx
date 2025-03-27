'use client';

import { useState, useRef, useEffect } from 'react';
import {
  RecorderState,
  startAudioStream,
  stopAudioStream,
  getSupportedAudioMimeType,
  setupAudioVisualizer,
  getVisualizationData,
  startVisualizationLoop,
  stopVisualizationLoop,
  cleanupAudioContext,
} from '@friday/lib/audio';

export function TestAudioApp() {
  // 상태
  const [recordingState, setRecordingState] = useState<RecorderState>('inactive');
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);

  // 레퍼런스
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 시각화 관련 레퍼런스
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationIdRef = useRef<number | null>(null);

  // 녹음 상태 계산
  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';

  // 캔버스 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  // 녹음 시작
  const startRecording = async () => {
    try {
      // 기존 데이터 초기화
      audioChunksRef.current = [];
      setRecordingTime(0);

      // 오디오 스트림 시작
      const stream = await startAudioStream();
      audioStreamRef.current = stream;

      // 미디어 레코더 설정
      const mimeType = getSupportedAudioMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      // 데이터 수집 이벤트 설정
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 녹음 시작
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecordingState('recording');

      // 녹음 시간 타이머 시작
      timerRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);

      // 시각화 시작
      startVisualizer(stream);
    } catch (error) {
      console.error('녹음 시작 오류:', error);
    }
  };

  // 녹음 중지
  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;

    if (!mediaRecorder || recordingState === 'inactive') {
      return;
    }

    // 타이머 정리
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 녹음 종료
    if (mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }

    // 상태 업데이트
    setRecordingState('inactive');

    // 시각화 중지
    stopVisualizer();

    // 스트림 정리
    stopAudioStream(audioStreamRef.current);
    audioStreamRef.current = null;
    mediaRecorderRef.current = null;
  };

  // 시각화 시작
  const startVisualizer = (stream: MediaStream) => {
    if (!stream) return;

    try {
      // 기존 시각화 중지
      stopVisualizer();

      // 오디오 시각화 설정
      const { audioContext, analyser, source } = setupAudioVisualizer(stream, {
        fftSize: 2048,
        smoothingTimeConstant: 0.8,
      });

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;

      // 애니메이션 시작
      const animationId = startVisualizationLoop(updateVisualization);
      animationIdRef.current = animationId;
    } catch (error) {
      console.error('시각화 시작 오류:', error);
    }
  };

  // 시각화 중지
  const stopVisualizer = async () => {
    // 애니메이션 루프 중지
    if (animationIdRef.current) {
      stopVisualizationLoop(animationIdRef.current);
      animationIdRef.current = null;
    }

    // 오디오 컨텍스트 정리
    if (audioContextRef.current) {
      await cleanupAudioContext(audioContextRef.current);
      audioContextRef.current = null;
    }

    sourceRef.current = null;
    analyserRef.current = null;

    // 캔버스 초기화
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // 시각화 업데이트
  const updateVisualization = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;

    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 시각화 데이터 가져오기
    const { timeData, volume: currentVolume } = getVisualizationData(analyser);
    setVolume(currentVolume);

    // 캔버스 초기화
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 파형 그리기
    const width = canvas.width;
    const height = canvas.height;
    const sliceWidth = width / timeData.length;

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3498db';
    ctx.beginPath();

    let x = 0;

    for (let i = 0; i < timeData.length; i++) {
      const v = timeData[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  // 컴포넌트 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      stopAudioStream(audioStreamRef.current);
      stopVisualizer();
    };
  }, []);

  // 녹음 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Baby Friday 오디오 테스트</h1>

      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <canvas ref={canvasRef} width={800} height={200} className="w-full h-[200px] bg-gray-100 rounded-md" />
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold">{isRecording ? '녹음 중...' : isPaused ? '일시정지됨' : '준비됨'}</div>
          <div className="text-lg">{formatTime(recordingTime)}</div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm">볼륨: {volume}%</div>
        </div>

        <div className="flex space-x-4 justify-center">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition"
            >
              녹음 시작
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md transition"
            >
              녹음 중지
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
