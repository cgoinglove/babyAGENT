import { models } from '@examples/models';
import { RewooState } from '../state';
import { graphStateNode } from 'ts-edge';
import { CoreMessage, streamObject } from 'ai';
import { z } from 'zod';
import { parsePlans } from './helper';
export const rewooReasoningNode = graphStateNode({
  name: '🧠 Reasoning',
  metadata: {
    description: '계획을 이유를 생각하고 답변을 생성합니다.',
  },
  execute: async (state: RewooState, { stream }) => {
    const plan = state.getCurrentPlan();
    if (!plan) {
      return state;
    }
    plan.step = 'reasoning';
    const dependency = plan.dependency.map((id) => state.plan.list.find((p) => p.id === id)!);
    const dependencyPlans = parsePlans(dependency);

    const system = `당신은 사용자의 요청을 이해하고 단계별 계획을 수행하는 AI 도우미입니다.
    현재 특정 계획 단계에 대한 추론이 필요합니다.
    계획의 목적과 필요성을 분석하고, 이 단계에서 특정 도구가 필요한지 판단해야 합니다.

    사용 가능한 도구 목록:
    ${state.tools.map((tool) => `- ${tool.name}: ${tool.description}`).join('\n')}

    답변은 다음 두 가지로 구성되어야 합니다:
    1. 계획 단계에 대한 간결하고 논리적인 추론 (문제와 필요한 접근방식 설명)
    2. 사용할 도구 이름 (도구가 필요 없다면 빈 문자열)`;

    const user = `사용자의 원래 요청: ${state.userPrompt}

    현재 수행할 계획: "${plan.plan}"

    ${dependencyPlans.length > 0 ? `이 계획의 의존성 정보:\n${dependencyPlans}` : '이 계획은 의존성이 없습니다.'}

    위 정보를 바탕으로 현재 계획 단계에 대한 추론을 제공하고, 필요한 도구가 있다면 선택하세요.`;

    const prompt: CoreMessage[] = [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ];

    stream(`PROMPT:\n\n${JSON.stringify(prompt, null, 2)}\n\n`);

    plan.reasoning = {
      prompt,
      answer: '',
      tokens: 0,
    };

    const response = await streamObject({
      model: models.standard,
      messages: prompt,
      schema: z.object({
        reason: z.string().describe('현재 계획 단계의 목적과 필요성에 대한 간결한 추론'),
        tool: z.string().describe('사용할 도구 이름 (도구가 필요 없으면 빈 문자열 "")'),
      }),
    });

    stream('ASSISTANT:\n\n');
    for await (const chunk of response.textStream) {
      stream(chunk);
    }
    stream('\n\n');

    const result = await response.object;

    plan.reasoning.answer = result.reason;
    plan.reasoning.tokens = (await response.usage).totalTokens;
    plan.step = result.tool.trim() ? 'acting' : 'completed';
    plan.acting = { name: result.tool, input: '', output: '', tokens: 0 };
    state.updatePlan(plan.id, plan);
  },
});
