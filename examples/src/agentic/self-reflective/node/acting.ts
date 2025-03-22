import { graphStateNode } from 'ts-edge';
import { ReflectiveState } from '../state';
import { models } from '@examples/models';
import { streamObject } from 'ai';

// 도구 실행 노드
export const actingNode = graphStateNode({
  name: 'acting',
  metadata: { description: 'Executes selected tools and collects results' },
  async execute(state: ReflectiveState, { stream }) {
    const latestHistory = { ...state.getLatestHistory() };
    const latestUseTool = [...state.history].reverse().find((h) => h.tool?.name)?.tool;
    const toolName = latestHistory.tool?.name;
    const tool = state.tools.find((t) => t.name === toolName?.trim());
    if (!tool) {
      stream(`도구를 찾을 수 없습니다: ${toolName}`);
      latestHistory.error = `도구를 찾을 수 없습니다: ${toolName}`;
      throw new Error(`도구를 찾을 수 없습니다: ${toolName}`);
    }

    const prompt = `사용자 질문: "${state.userPrompt}"
    선택한 도구: "${tool.name}"
    도구 설명: ${tool.description}
    추론: ${latestHistory.reasoing_answer}
    ${latestUseTool ? `이전 도구 사용:${JSON.stringify(latestUseTool)}` : ''}
    
    이전 도구사용 내용이 있다면, 이 부분을 참고하고 이전과 다른 값을 사용 해야합니다.

    이 도구를 실행하기 위한 정확한 입력을 생성하세요.
    JSON 형식으로 응답하세요:
    `;

    const response = streamObject({
      model: models.standard,
      schema: tool.schema,
      prompt,
    });

    for await (const text of response.textStream) {
      stream(text);
    }

    const toolInput = await response.object;
    // 도구 실행
    const result = await tool.execute(toolInput);

    const inputStr = typeof toolInput === 'string' ? toolInput : JSON.stringify(toolInput);
    const outputStr = typeof result === 'string' ? result : JSON.stringify(result);

    latestHistory.tool!.input = inputStr;
    latestHistory.tool!.output = outputStr;

    state.updateLatestHistory(latestHistory);
  },
});
