import { graphNode } from 'ts-edge';
import { RewooState } from '../state';
import { ToolCall } from '@interface';

export const rewooStartNode = graphNode({
  name: 'start',
  execute: (input: { prompt: string; tools: ToolCall[]; debug?: boolean }): RewooState => {
    const { prompt, tools, debug = false } = input;

    const state: RewooState = {
      userPrompt: prompt,
      tools,
      planIndex: 0,
      plan: {
        tokens: 0,
        prompt: [],
        list: [],
      },
      integration: {
        tokens: 0,
        prompt: [],
        answer: '',
      },
      debug,
    };
    return state;
  },
});
