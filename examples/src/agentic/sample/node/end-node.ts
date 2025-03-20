import { graphStateNode } from 'ts-edge';
import { SampleStore } from '../state';
import { wait } from '@shared/util';
export const sampleEndNode = graphStateNode({
  name: 'End',
  execute: async ({ state, setState }: SampleStore, { stream }) => {
    stream(`✨...최종 답변 준비중`);
    await wait(1000);
  },
});
