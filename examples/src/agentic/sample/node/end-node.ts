import { graphStateNode } from 'ts-edge';
import { SampleState } from '../state';
import { wait } from '@shared/util';
export const sampleEndNode = graphStateNode({
  name: 'End',
  execute: async (state: SampleState) => {
    if (state.debug) {
      console.log(`END_NODE: ✨...최종 답변 준비중`);
    }
    await wait(1000);
  },
});
