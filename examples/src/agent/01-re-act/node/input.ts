import { graphNode } from 'ts-edge';
import { ReactState } from '../state';
import { Tool } from '@interface';

export const inputNode = graphNode({
  name: 'input',
  execute(input: { prompt: string; tools: Tool<any, any>[] }) {
    const initialState: ReactState = {
      userPrompt: input.prompt,
      tools: input.tools,
      thought: '',
      action: {},
    };
    return initialState;
  },
});
