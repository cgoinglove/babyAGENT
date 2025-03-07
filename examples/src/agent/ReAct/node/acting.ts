import { node } from 'ts-edge';
import { ReactState } from '../state';

export const actingNode = node({
  name: '🛠️ acting',
  execute(input: ReactState): Promise<ReactState> {
    return Promise.resolve(input);
  },
});
