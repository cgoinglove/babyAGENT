import { graphStateNode } from 'ts-edge';
import { SampleStore } from '../state';
import { wait } from '@shared/util';

export const sampleStartNode = graphStateNode({
  name: 'start',
  execute: async ({ state, setState }: SampleStore, { stream }) => {
    const random = Number(Math.random().toFixed(2));

    stream(`✨ 유저 질문: ${state.userPrompt}\n`);
    stream(`✨ ...어디로 갈지 생각중 `);

    await wait(1000);

    setState({
      nextStage: random > 0.5 ? 'A' : 'B',
    });

    stream(`\n ${random > 0.5 ? 'A' : 'B'}로 이동합니다.`);
  },
});
