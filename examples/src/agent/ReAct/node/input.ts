import { node } from 'ts-edge';
import { ReactState } from '../state';
import { Tool } from '@interface';

export const inputNode = node({
  name: 'input',
  execute(input: { prompt: string; tools: Tool<any, any>[]; limitTry?: number }) {
    const initialState: ReactState = {
      userPrompt: input.prompt,
      tools: input.tools,
      thought: '',
      observation: 'complete',
      action: {},
      limitTry: input.limitTry || 5,
    };
    return initialState;
  },
});
