import { graphNode } from 'ts-edge';
import { ReflectiveState } from '../state';
import { models, pureLLM } from '@examples/models';

// 출력 노드
export const outputNode = graphNode({
  name: 'output',
  description: 'Generates final user-friendly response',
  async execute(state: ReflectiveState): Promise<string> {
    console.log(`\n✨ OUTPUT`);

    const llm = pureLLM(models.custom.smart);

    // 워크플로우 요약 (도구 사용 결과만 포함)
    const toolResults = state.history
      .filter((r) => r.tool.name && r.tool.output)
      .map((r) => `- ${r.tool.name}: ${r.tool.output}`)
      .join('\n');

    const answer = await llm(
      `당신은 Self-Reflection 능력을 갖춘 AI 에이전트입니다. 수집한 정보를 바탕으로 사용자에게 답변하세요.

사용자 질문: "${state.userPrompt}"

도구 사용 결과:
${toolResults || '도구를 사용하지 않았습니다.'}

위 정보를 바탕으로 사용자 질문에 직접 답변하세요.
- 도구 사용 결과를 자연스럽게 언급하세요 (예: "계산해보니...", "검색 결과에 따르면...")
- 내부 처리 과정이나 반성 단계는 언급하지 마세요
- 명확하고 정확한 답변을 제공하세요

답변:`
    );

    console.log(`최종답변: ${answer}`);

    return answer;
  },
});
