import { graphStateNode } from 'ts-edge';
import { SampleState } from '../state';
import { wait } from '@shared/util';

export const sampleStartNode = graphStateNode({
  name: 'start',
  execute: async (state: SampleState, { stream }) => {
    const random = Number(Math.random().toFixed(2));

    stream(`✨ ...어디로 갈지 생각중`);

    await wait(1000);

    state.setNextStage(random > 0.5 ? 'A' : 'B');
    stream(`\n ${random > 0.5 ? 'A' : 'B'}로 이동합니다.`);
  },
});
