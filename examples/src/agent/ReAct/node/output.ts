import { node } from 'ts-edge';
import { ReactState } from '../state';
import { models, pureLLM } from '@examples/models';

// 개선된 출력 프롬프트 생성 함수
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
  return `SYSTEM: 당신은 사용자 질문에 대한 최종 응답을 생성하는 도우미입니다.
사용자에게 명확하고 자연스러운 응답을 제공하세요.

USER QUESTION: ${userPrompt}

AGENT REASONING: ${lastThought}

${toolName ? `TOOL USED: ${toolName}` : ''}
${toolInput ? `TOOL Input: ${toolInput}` : ''}
${toolOutput ? `TOOL RESULT: ${toolOutput}` : ''}

위 정보를 바탕으로 사용자에게 자연스럽고 명확한 최종 응답을 제공하세요.

${
  toolName
    ? `중요: 응답에 "${toolName}" 도구를 사용하여 정보를 찾았다는 내용을 자연스럽게 포함하세요. 
     예: "날씨 정보를 확인해보니...", "계산해보면...", "검색 결과에 따르면..." 등의 방식으로 도구 활용을 언급하세요.`
    : '도구를 사용하지 않았으므로, 직접적인 응답을 제공하세요.'
}

최종 응답을 작성할 때 자연스러운 대화 형식을 유지하세요.

FINAL RESPONSE:`;
}

export const outputNode = node({
  name: 'output',
  execute(state: ReactState): Promise<string> {
    const llm = pureLLM(models.stupid);
    const userPrompt = state.userPrompt;
    const toolName = state.action.tool; // optional
    const toolInput = state.action.input; // optional
    const toolOutput = state.action.output; // optional
    const lastThought = state.thought;

    const prompt = outputPrompt({ userPrompt, toolName, toolInput, toolOutput, lastThought });
    return llm(prompt);
  },
});
