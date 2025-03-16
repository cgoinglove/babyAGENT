import { ToolCall } from '@interface';

type RewooPlan = {
  id: string; // 계획 아이디
  plan: string; // 계획 내용
  step: 'ready' | 'completed' | 'acting' | 'reasoning';
  reasoning?: {
    prompt: string; // 이유 질문
    answer: string; // 이유 답변
    tokens: number; // 이유 토큰 수
  };
  acting?: {
    name: string; // 행동 이름
    input: string; // 행동 입력
    output: string; // 행동 출력
    tokens: number; // 행동 토큰 수
  };
  dependency: RewooPlan['id'][]; // 계획 의존성
};

export type RewooState = {
  userPrompt: string; // 사용자 입력
  tools: ToolCall[]; // 사용 가능한 툴
  planIndex: number; // 계획 인덱스
  plan: {
    plan_prompt: string; // 계획 질문
    list: RewooPlan[]; // 계획들
    tokens: number; // 계획 토큰 수
  };
  integration: {
    prompt: string; // 통합 질문
    answer: string; // 통합 답변
    tokens: number; // 통합 토큰 수
  };
  debug?: boolean; // 디버그 여부
};
