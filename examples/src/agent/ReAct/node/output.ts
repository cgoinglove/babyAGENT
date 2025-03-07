import { node } from 'ts-edge';
import { ReactState } from '../state';

export const outputNode = node({
  name: 'output',
  execute(input: ReactState): Promise<string> {
    return Promise.resolve('ok');
  },
});
