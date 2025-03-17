import { graphStateNode } from 'ts-edge';
import { ReActState } from '../state';
import { models } from '@examples/models';
import { streamText } from 'ai';

// 간결한 출력 프롬프트 생성 함수
function outputPrompt({
  userPrompt,
  toolName,
  toolInput,
  toolOutput,
  lastThought,
}: {
  userPrompt: string;
  toolName?: string;
  toolInput?: string;
  toolOutput?: string;
  lastThought: string;
}): string {
  return `당신은 ReACT 에이전트로, 추론과 도구 사용 결과를 바탕으로 사용자에게 명확한 답변을 제공합니다.

사용자 질문: ${userPrompt}

${lastThought ? `추론 과정: ${lastThought}` : ''}

${toolName ? `사용한 도구: ${toolName}` : '도구를 사용하지 않았습니다.'}
${toolInput ? `도구 입력값: ${toolInput}` : ''}
${toolOutput ? `도구 실행 결과: ${toolOutput}` : ''}

위 정보를 바탕으로 사용자에게 간결하고 명확한 답변을 제공하세요. 
${toolName ? `도구 사용 사실을 자연스럽게 언급하세요 (예: "검색 결과에 따르면...", "계산해보니...")` : ''}
전문 용어나 복잡한 설명은 피하고, 정보를 이해하기 쉽게 전달하세요.

답변:`;
}

export const outputNode = graphStateNode({
  name: 'output',
  async execute(state: ReActState, { stream }) {
    const userPrompt = state.userPrompt;
    const toolName = state.action?.tool; // optional
    const toolInput = state.action?.input; // optional
    const toolOutput = state.action?.output; // optional
    const lastThought = state.thought_answer;

    const prompt = outputPrompt({ userPrompt, toolName, toolInput, toolOutput, lastThought });
    const answer = streamText({
      model: models.custom.standard,
      prompt,
    });
    for await (const text of answer.textStream) {
      stream(text);
    }
    state.setOutput(prompt, await answer.text);
  },
});
