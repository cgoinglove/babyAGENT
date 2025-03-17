import { graphStore } from 'ts-edge';

export type SampleState = {
  userPrompt: string;
  nextStage: 'A' | 'B';
  debug: boolean;
  setNextStage: (stage: 'A' | 'B') => void;
};

export const sampleStore = graphStore<SampleState>((set) => {
  return {
    debug: false,
    nextStage: 'A',
    userPrompt: '',
    setNextStage(stage) {
      set({ nextStage: stage });
    },
  };
});
