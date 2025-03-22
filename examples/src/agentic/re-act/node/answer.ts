import { graphStateNode } from 'ts-edge';
import { ReActState } from '../state';
import { models } from '@examples/models';
import { generateText } from 'ai';

export const answerNode = graphStateNode({
  name: 'answer',
  async execute(state: ReActState, { stream }) {
    const userPrompt = state.userPrompt;
    const toolName = state.action?.tool; // optional
    const toolInput = state.action?.input; // optional
    const toolOutput = state.action?.output; // optional
    const lastThought = state.thought_answer;

    stream(`최종 답변 생성 중...`);

    let prompt =
      `## 당신은 ReACT 에이전트로, 추론과 도구 사용 결과를 바탕으로 사용자에게 명확한 답변을 제공합니다.\n\n` +
      `### 사용자 질문:\n` +
      `${userPrompt}\n\n` +
      `### 추론 과정:\n` +
      `${lastThought}\n\n`;
    if (toolName) prompt += `### 사용한 도구:\n` + `${toolName}\n\n`;
    if (toolInput) prompt += `### 도구 입력값:\n` + `${toolInput}\n\n`;
    if (toolOutput) prompt += `### 도구 실행 결과:\n` + `${toolOutput}\n\n`;

    const response = await generateText({
      model: models.standard,
      prompt: prompt,
    });
    state.setOutput(prompt, response.text);
  },
});
