import { NextResponse } from 'next/server';
import { logger } from '../../../lib/logger';

export async function GET() {
  logger.api.info('서버 API 로그 테스트 엔드포인트 호출됨');

  try {
    // 로그 레벨 테스트
    logger.api.debug('디버그 메시지 - 개발 환경에서만 보임');
    logger.api.info('정보 메시지');
    logger.api.warn('경고 메시지');
    logger.api.error('에러 메시지');

    // 구조화된 로깅
    logger.api.info('구조화된 로그 예제', {
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substring(2, 15),
      environment: process.env.NODE_ENV,
    });

    return NextResponse.json({ success: true, message: '로그가 서버 콘솔에 기록되었습니다.' });
  } catch (error) {
    logger.api.error('로그 테스트 중 오류 발생', error);
    return NextResponse.json({ success: false, error: '로그 테스트 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
