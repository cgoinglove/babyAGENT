import { createConsola } from 'consola';

// 기본 로거 인스턴스 생성
const consola = createConsola({
  level: process.env.NODE_ENV === 'production' ? 4 : 5, // 프로덕션에서는 info 레벨 이상, 개발에서는 모든 로그
});

// 프로덕션 환경에서는 브라우저 콘솔 로그 비활성화 옵션
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  consola.level = 0; // production 클라이언트에서는 로깅 비활성화 (필요한 경우 제거)
}

// 커스텀 로거 생성 함수
export const createLogger = (name: string) => {
  return consola.withTag(name);
};

// 기본 로거들
export const logger = {
  app: createLogger('app'),
  api: createLogger('api'),
  db: createLogger('db'),
  auth: createLogger('auth'),
  speech: createLogger('speech'),
};

// 로거 타입 내보내기
export type Logger = ReturnType<typeof createLogger>;

// 로그 레벨 설정 헬퍼 함수
export const setLogLevel = (level: number) => {
  consola.level = level;
};

export default logger;
