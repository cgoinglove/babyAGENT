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
    console.log(`\n\n📝 INPUT NODE\n`);
    console.log(`질문    : ${input.prompt}`);
    console.log(`사용가능 도구 : '${input.tools.map((v) => v.name).join(',')}'`);
    return initialState;
  },
});
