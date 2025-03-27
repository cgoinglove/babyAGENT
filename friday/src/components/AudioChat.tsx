'use client';
import { useState } from 'react';
import { useSpeechRecognition } from '../hooks/use-speech-recognition';
import { logger } from '../lib/logger';

// 웨이브폼 컴포넌트 정의
const Waveform: React.FC<{ data: number[] }> = ({ data }) => {
  return (
    <div className="flex items-center justify-center h-20 gap-[2px] my-4">
      {data.map((value, index) => (
        <div
          key={index}
          className="w-1 bg-blue-500 rounded-full"
          style={{
            height: `${Math.max(4, value * 100)}%`,
            opacity: isNaN(value) ? 0 : 0.7 + value * 0.3,
          }}
        />
      ))}
    </div>
  );
};

const AudioChat: React.FC = () => {
  const [fetchInProgress, setFetchInProgress] = useState(false);

  // 음성 인식 결과를 처리하는 함수
  const handleFinalResult = async (transcript: string) => {
    if (transcript.trim() && !fetchInProgress) {
      logger.app.info(`음성 인식 결과 처리 시작: ${transcript}`);
      setFetchInProgress(true);

      try {
        // 여기에 fetch 로직 추가
        // 예: const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: transcript }) });
        logger.app.debug('API 요청 시작');

        // 임시 지연 추가 (실제 fetch 구현 시 제거)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        logger.app.debug('API 요청 완료');
      } catch (error) {
        logger.app.error('API 요청 오류:', error);
      } finally {
        setFetchInProgress(false);
        logger.app.info('음성 인식 결과 처리 완료');
      }
    }
  };

  // useSpeechRecognition 훅 사용
  const { transcript, finalTranscript, isListening, error, waveform, resetTranscript, toggleListening } =
    useSpeechRecognition({
      lang: 'ko-KR',
      onFinalResult: handleFinalResult,
    });

  logger.app.debug('AudioChat 렌더링', { isListening, hasError: !!error });

  return (
    <div className="flex flex-col items-center gap-4 p-4 max-w-md">
      <h2 className="text-lg font-bold">음성 인식</h2>

      {/* 음성 파형 시각화 */}
      {isListening && <Waveform data={waveform} />}

      {/* 음성 인식 결과 표시 영역 */}
      <div className="w-full p-4 min-h-32 max-h-60 overflow-y-auto bg-gray-100 rounded border">
        <p className="font-bold">최종 결과:</p>
        <p className="mb-4">{finalTranscript}</p>

        {transcript && (
          <>
            <p className="font-bold">인식 중:</p>
            <p className="italic text-gray-600">{transcript}</p>
          </>
        )}

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            logger.app.info(`음성 인식 ${isListening ? '중지' : '시작'} 버튼 클릭`);
            toggleListening();
          }}
          disabled={fetchInProgress}
          className={`px-4 py-2 rounded-full ${
            isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors ${fetchInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isListening ? '인식 중지' : '인식 시작'}
        </button>

        <button
          onClick={() => {
            logger.app.info('음성 인식 초기화 버튼 클릭');
            resetTranscript();
          }}
          className="px-4 py-2 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition-colors"
        >
          초기화
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        {fetchInProgress ? '처리 중...' : isListening ? '말씀하세요...' : '버튼을 눌러 인식을 시작하세요'}
      </p>
    </div>
  );
};

export default AudioChat;
