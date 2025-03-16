import { generateObject } from 'ai';
import { RewooState } from '../state';
import { graphNode } from 'ts-edge';
import { models } from '@examples/models';

export const rewooActingNode = graphNode({
  name: '🛠️ Acting',
  execute: async (state: RewooState): Promise<RewooState> => {
    const plan = state.plan.list[state.planIndex];

    const tool = state.tools.find((tool) => tool.name === plan.acting!.name)!;

    const system = `당신은 도구를 사용하여 작업을 수행하는 AI 도우미입니다.
    현재 ${tool.name} 도구에 전달할 입력값을 생성해야 합니다.
    도구 설명: ${tool.description}`;

    const user = `계획: "${plan.plan}"
    추론 결과: "${plan.reasoning!.answer}"

    위 정보를 바탕으로 ${tool.name} 도구에 전달할 입력값을 생성하세요.`;
    if (state.debug) {
      console.log(`\n\n🛠️ ACTING NODE PROMPT\n`);
      console.dir([system, user], { depth: null });
    }

    const response = await generateObject({
      model: models.custom.standard,
      system,
      prompt: user,
      schema: tool.schema,
    });

    if (state.debug) {
      console.log(`\n\n🛠️ ACTING NODE RESPONSE\n`);
      console.dir(response.object, { depth: null });
    }
    plan.acting!.input = response.object;
    plan.acting!.tokens = response.usage.totalTokens;
    const result = await tool.execute(response.object);
    plan.acting!.output = result;
    return state;
  },
});
