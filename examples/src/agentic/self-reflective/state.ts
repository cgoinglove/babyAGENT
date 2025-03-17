import { ToolCall } from '@interface';
import { graphStore } from 'ts-edge';

// 단순화된 단계 정의
export enum ReflectiveStage {
  REASONING = 'reasoning',
  ACTING = 'acting',
  REFLECTING = 'reflecting',
  COMPLETED = 'completed',
}

export type ReflectiveState = {
  userPrompt: string;
  tools: ToolCall[];
  stage: ReflectiveStage;
  history: {
    error?: string;
    reasoing_prompt?: string;
    reasoing_answer?: string;
    tool?: {
      name?: string;
      input?: string;
      output?: string;
    };
    reflection_prompt?: string;
    reflection_answer?: string;
    output_prompt?: string;
    output_answer?: string;
  }[];
  retry: number;
  setStage: (stage: ReflectiveStage) => void;
  pushHistory: (history: ReflectiveState['history'][number]) => void;
  getLatestHistory: () => ReflectiveState['history'][number];
  updateLatestHistory: (history: Partial<ReflectiveState['history'][number]>) => void;
};

export const reflectiveStore = graphStore<ReflectiveState>((set, get) => ({
  userPrompt: '',
  tools: [],
  stage: ReflectiveStage.REASONING,
  history: [],
  retry: 5,
  setStage: (stage: ReflectiveStage) => set({ stage }),
  pushHistory: (history: ReflectiveState['history'][number]) =>
    set((prev) => {
      return { history: [...prev.history, history] };
    }),
  getLatestHistory: () => get().history.at(-1)!,
  updateLatestHistory: (history: Partial<ReflectiveState['history'][number]>) =>
    set((state) => ({
      history: [...state.history.slice(0, -1), { ...state.history[state.history.length - 1], ...history }],
    })),
}));
