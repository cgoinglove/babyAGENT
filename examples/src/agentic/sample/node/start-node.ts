import { graphNode } from 'ts-edge';
import { SampleState } from '../state';
import { wait } from '@shared/util';

export const sampleStartNode = graphNode({
  name: 'start',
  execute: async (input: { prompt: string; debug?: boolean }): Promise<SampleState> => {
    const { prompt, debug = false } = input;
    const random = Number(Math.random().toFixed(2));

    if (debug) {
      console.log(`START_NODE: ✨ ...어디로 갈지 생각중`);
    }
    await wait(1000);
    const state: SampleState = {
      userPrompt: prompt,
      nextStage: random > 0.5 ? 'A' : 'B',
      debug,
    };
    return state;
  },
});
