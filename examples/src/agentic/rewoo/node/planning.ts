import { graphStateNode } from 'ts-edge';
import { RewooState } from '../state';
import { CoreMessage, streamObject } from 'ai';
import { models } from '@examples/models';
import { z } from 'zod';
export const rewooPlanningNode = graphStateNode({
  name: '📝 Planning',
  metadata: {
    description: '사용자 질문을 분석하고, 이를 해결하기 위한 논리적인 계획 단계를 생성합니다.',
  },
  execute: async (state: RewooState, { stream }) => {
    const system = `당신은 ReWOO(Reasoning Without Observation) 아키텍처의 Planning 단계를 담당하는 AI입니다.
    사용자 질문을 분석하고, 이를 해결하기 위한 논리적인 계획 단계를 생성해야 합니다.
    
    ## 사용 가능한 도구:
    ${state.tools.map((tool) => `- ${tool.name}: ${tool.description}`).join('\n')}
    
    ## 계획 생성 지침:
    1. 사용자 질문을 해결하기 위한 단계별 계획을 수립하세요.
    2. 각 계획은 명확하고 실행 가능해야 합니다.
    3. 각 계획 간의 의존성을 명시적으로 파악하세요.
    4. 가능한 한 많은 단계를 도구 사용 전에 미리 계획하세요.
    
    ## 의존성 결정 방법:
    - 데이터 흐름: 어떤 계획의 출력이 다른 계획의 입력으로 사용되는지
    - 논리적 순서: 어떤 계획이 다른 계획보다 먼저 실행되어야 하는지
    - 자원 의존성: 어떤 계획이 다른 계획이 생성한 결과물에 의존하는지
    
    복잡한 질문은 더 작은 하위 작업으로 분해하고, 각 작업에 적절한 도구를 할당하세요.
    의존성이 없는 독립적인 작업은 병렬로 실행될 수 있음을 고려하세요.`;

    const plan: RewooState['plan'] = {
      prompt: [],
      list: [],
      tokens: 0,
    };

    const messages: CoreMessage[] = [
      { role: 'system', content: system },
      { role: 'user', content: state.userPrompt },
    ];
    plan.prompt = messages;

    stream(`PROMPT:\n\n${JSON.stringify(plan, null, 2)}\n\n`);

    const planSchema = z.object({
      plans: z.array(
        z.object({
          id: z.string(),
          plan: z.string(),
          dependency: z.array(z.string()),
        })
      ),
    });

    const response = streamObject({
      model: models.smart,
      messages,
      schema: planSchema,
    });

    stream('ASSISTANT:\n\n');
    for await (const chunk of response.textStream) {
      stream(chunk);
    }
    stream('\n\n');

    const result = await response.object;

    plan.tokens = (await response.usage).totalTokens;
    plan.list = result.plans.map((plan) => ({
      plan: plan.plan,
      id: plan.id,
      dependency: plan.dependency,
      step: 'ready',
      reasoning: {
        prompt: [],
        answer: '',
        tokens: 0,
      },
      completed: false,
    }));
    state.setPlan(plan);
  },
});
