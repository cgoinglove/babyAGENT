import { graphStateNode } from 'ts-edge';
import { ReActState } from '../state';
import { models } from '@examples/models';
import { generateObject } from 'ai';

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
    const prompt =
      `## 당신은 도구를 사용하는 에이전트입니다. 사용자의 질문에 대한 답변을 생성하기 위해 도구를 사용합니다.\n\n` +
      `### 사용 도구:\n` +
      `${tool.name}\n\n` +
      `### 도구 설명:\n` +
      `${tool.description}\n\n` +
      `### 유저의 질문:\n` +
      `"${state.userPrompt}"`;

    stream(`도구 입력 생성 중...`);

    // 도구 스키마를 사용하여 입력 생성
    const response = await generateObject({
      model: models.standard,
      schema: tool.schema,
      prompt: prompt,
    });
    // Tool 실행
    const result = await tool.execute(response.object);
    state.setAction({
      tool: action.tool,
      input: JSON.stringify(response.object),
      output: JSON.stringify(result),
    });
  },
});
