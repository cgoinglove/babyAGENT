import { graphStateNode } from 'ts-edge';
import { SampleState } from '../state';
import { wait } from '@shared/util';

export const sampleStartNode = graphStateNode({
  name: 'start',
  execute: async (state: SampleState) => {
    const random = Number(Math.random().toFixed(2));

    if (state.debug) {
      console.log(`START_NODE: ✨ ...어디로 갈지 생각중`);
    }
    await wait(1000);

    state.setNextStage(random > 0.5 ? 'A' : 'B');
  },
});
