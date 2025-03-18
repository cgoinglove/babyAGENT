import { graphStateNode } from 'ts-edge';
import { ReflectiveState } from '../state';
import { models } from '@examples/models';
import { getHistoryText } from './helper';
import { streamText } from 'ai';

// 출력 노드
export const outputNode = graphStateNode({
  name: 'output',
  metadata: { description: 'Generates final user-friendly response' },
  async execute(state: ReflectiveState, { stream }) {
    stream(`\n✨ OUTPUT`);

    const historyText = getHistoryText(state.history);

    const prompt = `당신은 Self-Reflection 능력을 갖춘 AI 에이전트입니다. 수집한 정보를 바탕으로 사용자에게 답변하세요.

사용자 질문: "${state.userPrompt}"

작업 기록:${historyText}

위 정보를 바탕으로 사용자 질문에 직접 답변하세요.

- 도구 사용 결과를 자연스럽게 언급하세요 (예: "계산해보니...", "검색 결과에 따르면...")
- 내부 처리 과정이나 반성 단계는 언급하지 마세요
- 명확하고 정확한 답변을 제공하세요
답변:`;

    stream(`${prompt}\n`);

    state.setOutput(prompt, '');

    const response = streamText({
      model: models.standard,
      prompt,
    });

    for await (const text of response.textStream) {
      stream(text);
    }

    const answer = await response.text;

    state.setOutput(prompt, answer);
  },
});
