import { node } from 'ts-edge';
import { ReactState } from '../state';

export const inputNode = node({
  name: 'input',
  execute(userPrompt: string) {
    const initialState: ReactState = {
      input: userPrompt,
    };
    return initialState;
  },
});
