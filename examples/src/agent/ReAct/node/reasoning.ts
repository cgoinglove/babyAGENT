import { node } from 'ts-edge';
import { ReactState } from '../state';

export const reasoningNode = node({
  name: '🧠 reasoning',
  execute(input: ReactState): Promise<ReactState> {
    return Promise.resolve(input);
  },
});
