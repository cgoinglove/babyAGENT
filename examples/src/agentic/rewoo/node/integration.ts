import { RewooState } from '../state';
import { graphNode } from 'ts-edge';
import { parsePlans } from './helper';
import { CoreMessage, generateText } from 'ai';
import { models } from '@examples/models';

export const rewooIntegrationNode = graphNode({
  name: '🧐 Integration',
  metadata: {
    description: '모든 계획을 통합하여 최종 답변을 생성합니다.',
  },
  execute: async (state: RewooState): Promise<RewooState> => {
    const completedPlans = parsePlans(state.plan.list);
    const originalPrompt = state.userPrompt;

    const system = `당신은 사용자의 요청에 대해 단계별 계획을 수행한 후 최종 답변을 생성하는 AI 도우미입니다.
    각 계획의 결과물을 모두 고려하여 일관되고 통합된 답변을 제공해야 합니다.
    
    답변 작성 시 다음 사항을 지켜주세요:
    1. 각 계획의 수행 과정과 결과를 종합적으로 반영하세요.
    2. 사용자의 원래 요청에 정확히 답변하세요.
    3. 전문적이면서도 이해하기 쉬운 언어로 답변하세요.
    4. 필요한 경우 각 단계에서 얻은 정보를 인용하되, 중복되는 내용은 제거하세요.
    5. 이해를 돕기 위해 예시나 비유를 적절히 사용하세요.
    6. 도구를 사용한 경우, 그 결과를 적절히 해석하여 사용자에게 의미 있는 정보를 제공하세요.`;

    const user = `원래 사용자 요청: ${originalPrompt}

    수행된 계획 및 결과:
    ${completedPlans}

    위 정보를 바탕으로 사용자의 원래 요청에 대한 종합적인 답변을 제공해주세요.
    계획 수행 과정에 대한 설명은 최소화하고, 사용자가 원하는 결과와 통찰력에 집중하세요.`;

    const prompt: CoreMessage[] = [
      {
        role: 'system',
        content: system,
      },
      {
        role: 'user',
        content: user,
      },
    ];
    if (state.debug) {
      console.log(`\n\n🧐 INTEGRATION NODE PROMPT\n`);
      console.dir(prompt, { depth: null });
    }
    state.integration.prompt = prompt;

    const response = await generateText({
      model: models.custom.standard,
      messages: prompt,
    });

    if (state.debug) {
      console.log(`\n\n🧐 INTEGRATION NODE RESPONSE\n`);
      console.log(`${response.text}`);
    }

    state.integration.answer = response.text;
    state.integration.tokens = response.usage.totalTokens;

    return state;
  },
});
