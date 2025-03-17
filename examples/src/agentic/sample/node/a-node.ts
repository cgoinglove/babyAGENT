import { graphStateNode } from 'ts-edge';

import { wait } from '@shared/util';
import { SampleState } from '../state';

export const sampleANode = graphStateNode({
  name: 'A',
  execute: async (state: SampleState) => {
    if (state.debug) {
      console.log(`A_NODE: 🔍 데이터 조회중`);
    }
    await wait(1000);
  },
});
