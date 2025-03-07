import { node } from 'ts-edge';
import { ReactState } from '../state';

export const reasoningNode = node({
  name: '🧠 reasoning',
  async execute(state: ReactState): Promise<ReactState> {
    return state;
  },
});
