import { graphNode } from 'ts-edge';
import { ReflectiveState } from '../state';
import { models, objectLLM } from '@examples/models';

// 도구 실행 노드
export const actingNode = graphNode({
  name: 'acting',
  metadata: { description: 'Executes selected tools and collects results' },
  async execute(state: ReflectiveState): Promise<ReflectiveState> {
    const latestHistory = state.history[state.history.length - 1];
    const latestUseTool = [...state.history].reverse().find((h) => h.tool?.name)?.tool;
    const toolName = latestHistory.tool?.name;
    if (state.debug) {
      console.log(`\n🛠️ ACTING: ${toolName}`);
    }

    const tool = state.tools.find((t) => t.name === toolName);
    if (!tool) {
      latestHistory.error = `도구를 찾을 수 없습니다: ${toolName}`;
      throw new Error(`도구를 찾을 수 없습니다: ${toolName}`);
    }

    const llm = objectLLM(models.custom.standard);

    const prompt = `사용자 질문: "${state.userPrompt}"
    선택한 도구: "${tool.name}"
    도구 설명: ${tool.description}
    추론: ${latestHistory.reasoing_answer}
    ${latestUseTool ? `이전 도구 사용:${JSON.stringify(latestUseTool)}` : ''}
    
    이전 도구사용 내용이 있다면, 이 부분을 참고하고 이전과 다른 값을 사용 해야합니다.

    이 도구를 실행하기 위한 정확한 입력을 생성하세요.
    JSON 형식으로 응답하세요:
    `;
    // 도구 입력 생성
    const toolInput = await llm(prompt, tool.schema).catch((e) => {
      latestHistory.error = e.message;
      throw e;
    });

    // 도구 실행
    const result = await tool.execute(toolInput);

    const inputStr = typeof toolInput === 'string' ? toolInput : JSON.stringify(toolInput);
    const outputStr = typeof result === 'string' ? result : JSON.stringify(result);

    if (state.debug) {
      console.log(`입력: ${inputStr}`);
      console.log(`출력: ${outputStr}`);
    }

    // 마지막 기록 업데이트
    latestHistory.tool!.input = inputStr;
    latestHistory.tool!.output = outputStr;

    // 상태 업데이트
    return state;
  },
});
