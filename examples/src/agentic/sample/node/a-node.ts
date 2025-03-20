import { graphStateNode } from 'ts-edge';

import { wait } from '@shared/util';
import { SampleStore } from '../state';

export const sampleANode = graphStateNode({
  name: 'A',
  execute: async (state: SampleStore, { stream }) => {
    stream(`🔍 데이터 조회중`);
    await wait(1000);
  },
});
