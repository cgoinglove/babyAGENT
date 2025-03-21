import { CoreMessage } from 'ai';

export type LLmState = {
  prevMessages: CoreMessage[];

  prompt: string;

  answer?: string;

  usedToken?: number;
};

export type LLmContext = {
  update(param: Partial<LLmState>);
  toMessage(): CoreMessage[];
} & LLmState;

export const lc = (initial: Partial<LLmState>): LLmContext => {
  const state: LLmState = {
    prevMessages: [],
    prompt: '',
    answer: undefined,
    usedToken: undefined,
    ...initial,
  };

  return {
    ...state,
    update: (param: Partial<LLmState>) => {
      Object.assign(state, param);
    },
    toMessage: () => {
      return state.prevMessages.concat({
        role: 'user',
        content: state.prompt,
      } as CoreMessage);
    },
  };
};
