import { graphNode } from 'ts-edge';
import { ReflectiveStage, ReflectiveState } from '../state';
import { ToolCall } from '@interface';

// 입력 노드: 초기 상태 설정
export const inputNode = graphNode({
  name: 'input',
  execute(input: { prompt: string; tools: ToolCall<any, any>[]; debug?: boolean }) {
    const initialState: ReflectiveState = {
      userPrompt: input.prompt,
      tools: input.tools,
      stage: ReflectiveStage.REASONING,
      history: [],
      retry: 5,
      debug: Boolean(input.debug),
    };
    if (input.debug) {
      console.log(`\n\n📝 INPUT NODE\n`);
      console.log(`질문    : ${input.prompt}`);
      console.log(`사용가능 도구 : '${input.tools.map((v) => v.name).join(',')}'`);
    }
    return initialState;
  },
});
