import { graphStateNode } from 'ts-edge';
import { SampleState } from '../state';
import { wait } from '@shared/util';
export const sampleBNode = graphStateNode({
  name: 'B',
  execute: async (state: SampleState) => {
    if (state.debug) {
      console.log(`B_NODE: 🔍 데이터 조회중`);
    }
    await wait(1000);
  },
});
