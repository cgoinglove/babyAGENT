import { CoreMessage } from 'ai';

export type LLMState = {
  // 이전 대화 메시지들
  prevMessages: CoreMessage[];

  // 현재 사용자 프롬프트
  prompt: string;

  // 모델 응답
  answer?: string;
  // 토큰 사용량
  tokenUsage?: number;
};

export type LLMContext = {
  update(param: Partial<LLMState>): LLMContext;
  /**
   * 현재 상태를 메시지 배열로 반환 (LLM 요청용)
   */
  asMessages(): CoreMessage[];
  /**
   * 이전 대화 이력에 새 프롬프트 추가하여 새 컨텍스트 생성
   */
  continueWith(newPrompt: string): LLMContext;
} & LLMState;

export const lc = (initial?: Partial<LLMState>): LLMContext => {
  const state: LLMState = {
    prompt: '',
    answer: undefined,
    tokenUsage: undefined,
    ...initial,
    prevMessages: initial?.prevMessages || [],
  };

  const context = {
    ...state,
    update: (param: Partial<LLMState>) => {
      Object.assign(state, param);
      return context;
    },
    asMessages: () => {
      const messages = state.prevMessages.concat({
        role: 'user',
        content: state.prompt,
      } as CoreMessage);

      if (state.answer) {
        messages.push({
          role: 'assistant',
          content: state.answer,
        } as CoreMessage);
      }

      return messages;
    },
    continueWith(newPrompt) {
      return lc({
        prompt: newPrompt,
        prevMessages: context.asMessages(),
      });
    },
  };
  return context;
};
