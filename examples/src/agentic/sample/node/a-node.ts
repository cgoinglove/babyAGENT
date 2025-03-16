import { graphNode } from 'ts-edge';
import { SampleState } from '../state';
import { wait } from '@shared/util';

export const sampleANode = graphNode({
  name: 'A',
  execute: async (state: SampleState): Promise<SampleState> => {
    if (state.debug) {
      console.log(`A_NODE: 🔍 데이터 조회중`);
    }
    await wait(1000);
    return state;
  },
});
