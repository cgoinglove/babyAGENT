import { graphNode } from 'ts-edge';
import { ReActState } from '../state';
import { models, objectLLM } from '@examples/models';

export const actingNode = graphNode({
  name: '🛠️ acting',
  async execute(state: ReActState): Promise<ReActState> {
    const llm = objectLLM(models.custom.standard);
    const action = state.action!;
    const tool = state.tools.find((tool) => tool.name == action?.tool)!;

    // 도구 입력 생성을 위한 프롬프트 - 간결하게 수정
    const inputPrompt = `
사용자 질문: "${state.userPrompt}"

선택한 도구: "${tool.name}"
도구 설명: ${tool.description}

추론: ${state.thought_answer}

이 도구를 실행하기 위해 필요한 입력을 정확하게 생성하세요. 도구의 스키마에 맞는 형식으로 입력값을 제공해야 합니다.`;

    // 도구 스키마를 사용하여 입력 생성
    const toolInput = await llm(inputPrompt, tool.schema);

    action.input = JSON.stringify(toolInput);

    // Tool 실행
    const result = await tool.execute(toolInput);
    action.output = JSON.stringify(result);

    if (state.debug) {
      console.log(`\n\n🛠️ ACTING NODE\n`);
      console.log(`도구    : ${action.tool}`);
      console.log(`input  : ${action.input}`);
      console.log(`output : ${action.output}`);
    }
    return state;
  },
});
