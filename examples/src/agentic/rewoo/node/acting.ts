import { streamObject } from 'ai';
import { RewooState } from '../state';
import { graphStateNode } from 'ts-edge';
import { models } from '@examples/models';

export const rewooActingNode = graphStateNode({
  name: '🛠️ Acting',
  execute: async (state: RewooState, { stream }) => {
    const plan = state.getCurrentPlan();

    const tool = state.tools.find((tool) => tool.name === plan.acting!.name.trim())!;
    if (!tool) {
      stream(`도구를 찾을 수 없습니다. ${plan.acting!.name}`);
      throw new Error(`도구를 찾을 수 없습니다. ${plan.acting!.name}`);
    }

    const system = `당신은 도구를 사용하여 작업을 수행하는 AI 도우미입니다.
    현재 ${tool.name} 도구에 전달할 입력값을 생성해야 합니다.
    도구 설명: ${tool.description}`;

    const user = `계획: "${plan.plan}"
    추론 결과: "${plan.reasoning!.answer}"

    위 정보를 바탕으로 ${tool.name} 도구에 전달할 입력값을 생성하세요.`;
    stream(`PROMPT:\n\n${JSON.stringify([system, user], null, 2)}\n\n`);

    const response = await streamObject({
      model: models.standardstandard,
      system,
      prompt: user,
      schema: tool.schema,
    });

    stream('ASSISTANT:\n\n');
    for await (const chunk of response.textStream) {
      stream(chunk);
    }
    stream('\n\n');

    const result = await response.object;
    plan.acting!.input = result;
    plan.acting!.tokens = (await response.usage).totalTokens;
    const output = await tool.execute(result);
    plan.acting!.output = output;
    state.updatePlan(plan.id, plan);
  },
});
