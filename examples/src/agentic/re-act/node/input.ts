import { graphNode } from 'ts-edge';
import { ReActState } from '../state';
import { ToolCall } from '@interface';

export const inputNode = graphNode({
  name: 'input',
  execute(input: { prompt: string; tools: ToolCall<any, any>[]; debug?: boolean }) {
    const initialState: ReActState = {
      userPrompt: input.prompt,
      tools: input.tools,
      thought_prompt: '',
      thought_answer: '',
      debug: input.debug ?? false,
    };
    if (input.debug) {
      console.log(`\n\n📝 INPUT NODE\n`);
      console.log(`질문    : ${input.prompt}`);
      console.log(`사용가능 도구 : '${input.tools.map((v) => v.name).join(',')}'`);
    }
    return initialState;
  },
});
