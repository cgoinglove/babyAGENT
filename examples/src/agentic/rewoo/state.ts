import { ToolCall } from '@interface';
import { CoreMessage } from 'ai';
import { graphStore } from 'ts-edge';

type RewooPlan = {
  id: string; // 계획 아이디
  plan: string; // 계획 내용
  step: 'ready' | 'completed' | 'acting' | 'reasoning';
  reasoning?: {
    prompt: CoreMessage[]; // 이유 질문
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
    prompt: CoreMessage[]; // 계획 질문
    list: RewooPlan[]; // 계획들
    tokens: number; // 계획 토큰 수
  };
  integration: {
    prompt: CoreMessage[]; // 통합 질문
    answer: string; // 통합 답변
    tokens: number; // 통합 토큰 수
  };
  next(): void;
  hasNextPlan(): boolean;
  getCurrentPlan(): RewooPlan;
  setPlan(plan: RewooState['plan']): void;
  updatePlan(id: string, plan: Partial<RewooPlan>): void;
  setIntegration(integration: RewooState['integration']): void;
};

export const rewooStore = graphStore<RewooState>((set, get) => {
  return {
    userPrompt: '',
    tools: [],
    planIndex: 0,
    plan: {
      prompt: [],
      list: [],
      tokens: 0,
    },
    integration: {
      prompt: [],
      answer: '',
      tokens: 0,
    },
    getCurrentPlan() {
      const state = get();
      return { ...state.plan.list[state.planIndex] };
    },
    next() {
      set((prev) => ({ planIndex: prev.planIndex + 1 }));
    },
    hasNextPlan() {
      const state = get();
      return state.planIndex < state.plan.list.length;
    },
    setPlan(plan) {
      set({ plan });
    },
    updatePlan(id, plan) {
      set((prev) => {
        const index = prev.plan.list.findIndex((p) => p.id === id);
        if (index !== -1) {
          prev.plan.list[index] = { ...prev.plan.list[index], ...plan };
        }
        return prev;
      });
    },
    setIntegration(integration) {
      set({ integration });
    },
  };
});
