import { node } from 'ts-edge';
import { ReactState } from '../state';
import { Tool } from '@interface';

export const inputNode = node({
  name: 'input',
  execute(input: { prompt: string; tools: Tool[] }) {
    const initialState: ReactState = {
      userPrompt: input.prompt,
      tools: input.tools,
      thought: '',
      observation: 'complete',
      action: {},
    };
    return initialState;
  },
});
