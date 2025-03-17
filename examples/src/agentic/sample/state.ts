import { graphStore } from 'ts-edge';

export type SampleState = {
  userPrompt: string;
  nextStage: 'A' | 'B';
  setNextStage: (stage: 'A' | 'B') => void;
};

export const sampleStore = graphStore<SampleState>((set) => {
  return {
    nextStage: 'A',
    userPrompt: '',
    setNextStage(stage) {
      set({ nextStage: stage });
    },
  };
});
