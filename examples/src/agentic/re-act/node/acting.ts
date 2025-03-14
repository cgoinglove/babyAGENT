import { graphNode } from 'ts-edge';
import { ReactState } from '../state';
import { models, objectLLM } from '@examples/models';

export const actingNode = graphNode({
  name: '🛠️ acting',
  async execute(state: ReactState): Promise<ReactState> {
    const llm = objectLLM(models.custom.standard);

    // search Tool
    const tool = state.tools.find((tool) => tool.name == state.action.tool);
    if (!tool) throw new Error('Tool Not Found');

    // 도구 입력 생성을 위한 프롬프트 - 간결하게 수정
    const inputPrompt = `
사용자 질문: "${state.userPrompt}"

선택한 도구: "${tool.name}"
도구 설명: ${tool.description}

추론: ${state.thought}

이 도구를 실행하기 위해 필요한 입력을 정확하게 생성하세요. 도구의 스키마에 맞는 형식으로 입력값을 제공해야 합니다.`;

    // 도구 스키마를 사용하여 입력 생성
    const toolInput = await llm(inputPrompt, tool.schema);

    // Tool 실행
    const result = await tool.execute(toolInput);

    // 결과 저장
    const newState = { ...state };

    const stringify = (data: any) => (typeof data === 'string' ? data : JSON.stringify(data));
    newState.action = {
      ...newState.action,
      input: stringify(toolInput),
      output: stringify(result),
    };
    if (state.debug) {
      console.log(`\n\n🛠️ ACTING NODE\n`);
      console.log(`도구    : ${newState.action.tool}`);
      console.log(`input  : ${newState.action.input}`);
      console.log(`output : ${newState.action.output}`);
    }
    return newState;
  },
});
