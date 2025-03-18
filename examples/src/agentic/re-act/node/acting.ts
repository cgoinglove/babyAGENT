import { graphStateNode } from 'ts-edge';
import { ReActState } from '../state';
import { models } from '@examples/models';
import { streamObject } from 'ai';

export const actingNode = graphStateNode({
  name: '🛠️ acting',
  async execute(state: ReActState, { stream }) {
    const action = state.action!;
    const tool = state.tools.find((tool) => tool.name == action?.tool.trim())!;

    if (!tool) {
      stream(`도구를 찾을 수 없습니다. ${action?.tool}`);
      throw new Error(`도구를 찾을 수 없습니다. ${action?.tool}`);
    }

    // 도구 입력 생성을 위한 프롬프트 - 간결하게 수정
    const inputPrompt = `
사용자 질문: "${state.userPrompt}"

선택한 도구: "${tool.name}"
도구 설명: ${tool.description}

추론: ${state.thought_answer}

이 도구를 실행하기 위해 필요한 입력을 정확하게 생성하세요. 도구의 스키마에 맞는 형식으로 입력값을 제공해야 합니다.`;

    // 도구 스키마를 사용하여 입력 생성
    const toolInput = streamObject({
      model: models.standard,
      schema: tool.schema,
      prompt: inputPrompt,
    });

    for await (const text of toolInput.textStream) {
      stream(text);
    }

    // Tool 실행
    const result = await tool.execute(await toolInput.object);
    state.setAction({
      tool: action.tool,
      input: JSON.stringify(toolInput),
      output: JSON.stringify(result),
    });
    stream(`output : ${action.output}`);
  },
});
