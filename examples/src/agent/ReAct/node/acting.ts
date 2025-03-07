import { node } from 'ts-edge';
import { ReactState } from '../state';
import { models, objectLLM } from '@examples/models';

export const actingNode = node({
  name: '🛠️ acting',
  async execute(state: ReactState): Promise<ReactState> {
    const llm = objectLLM(models.stupid);

    // search Tool
    const tool = state.tools.find((tool) => tool.name == state.action.tool);
    if (!tool) throw new Error('Tool Not Found');

    // 도구 입력 생성을 위한 프롬프트
    const inputPrompt = `
사용자 질문 "${state.userPrompt}"에 대해 "${tool.name}" 도구를 사용하려고 합니다.

도구 설명: ${tool.description}

현재 사고 과정: ${state.thought}

이 도구를 실행하기 위한 입력을 생성해주세요.`;

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
    return newState;
  },
});
