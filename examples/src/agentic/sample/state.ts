import { graphStore } from 'ts-edge';

type SampleState = {
  userPrompt: string;
  nextStage: 'A' | 'B';
};

export const sampleStore = graphStore<SampleState>({
  userPrompt: '',
  nextStage: 'A',
});

export type SampleStore = graphStore.infer<SampleState>;
