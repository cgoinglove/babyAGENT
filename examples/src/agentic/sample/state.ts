import { graphStore } from 'ts-edge';

export type SampleState = {
  userPrompt: string;
  nextStage: 'A' | 'B';
  updateStage(stage: 'A' | 'B'): void;
};

export const sampleStore = graphStore<SampleState>((set) => {
  return {
    userPrompt: '',
    nextStage: 'A',
    updateStage(stage) {
      set({ nextStage: stage });
    },
  };
});
