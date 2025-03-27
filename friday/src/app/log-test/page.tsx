'use client';

import { useState } from 'react';
import { logger, setLogLevel } from '../../lib/logger';
import type { NextPage } from 'next';

const LogTestPage: NextPage = () => {
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [logLevel, setLogLevelState] = useState<number>(5); // 기본값은 debug(5)

  const testClientLogs = () => {
    logger.app.debug('클라이언트 디버그 로그');
    logger.app.info('클라이언트 정보 로그');
    logger.app.warn('클라이언트 경고 로그');
    logger.app.error('클라이언트 에러 로그');
    logger.app.success('클라이언트 성공 로그');

    logger.app.info('구조화된 로그 예제', {
      component: 'LogTestPage',
      timestamp: new Date().toISOString(),
      clientInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
      },
    });

    alert('브라우저 콘솔을 확인하세요!');
  };

  const testServerLogs = async () => {
    try {
      const response = await fetch('/api/log-test');
      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      logger.app.error('서버 로그 테스트 API 호출 중 오류:', error);
      setApiResponse('API 호출 중 오류가 발생했습니다.');
    }
  };

  const changeLogLevel = (level: number) => {
    setLogLevel(level);
    setLogLevelState(level);
    logger.app.info(`로그 레벨이 ${level}로 변경되었습니다.`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-8 text-center">로거 테스트</h1>

        <div className="mb-8 p-4 bg-gray-100 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">로그 레벨 설정</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => changeLogLevel(0)}
              className={`px-4 py-2 rounded ${logLevel === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              0: Silent
            </button>
            <button
              onClick={() => changeLogLevel(1)}
              className={`px-4 py-2 rounded ${logLevel === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              1: Fatal
            </button>
            <button
              onClick={() => changeLogLevel(2)}
              className={`px-4 py-2 rounded ${logLevel === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              2: Error
            </button>
            <button
              onClick={() => changeLogLevel(3)}
              className={`px-4 py-2 rounded ${logLevel === 3 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              3: Warn
            </button>
            <button
              onClick={() => changeLogLevel(4)}
              className={`px-4 py-2 rounded ${logLevel === 4 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              4: Info
            </button>
            <button
              onClick={() => changeLogLevel(5)}
              className={`px-4 py-2 rounded ${logLevel === 5 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              5: Debug
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-gray-100 rounded shadow flex flex-col">
            <h2 className="text-lg font-semibold mb-2">클라이언트 로그</h2>
            <p className="text-sm mb-4">브라우저 콘솔에 로그가 기록됩니다.</p>
            <button
              onClick={testClientLogs}
              className="mt-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              클라이언트 로그 테스트
            </button>
          </div>

          <div className="p-4 bg-gray-100 rounded shadow flex flex-col">
            <h2 className="text-lg font-semibold mb-2">서버 로그</h2>
            <p className="text-sm mb-4">서버 콘솔에 로그가 기록되고 API 응답이 표시됩니다.</p>
            <button
              onClick={testServerLogs}
              className="mt-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              서버 로그 테스트
            </button>
          </div>
        </div>

        {apiResponse && (
          <div className="p-4 bg-gray-100 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">API 응답</h2>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">{apiResponse}</pre>
          </div>
        )}
      </div>
    </main>
  );
};

export default LogTestPage;
