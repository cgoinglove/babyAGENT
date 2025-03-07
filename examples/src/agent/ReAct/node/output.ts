import { node } from 'ts-edge';
import { ReactState } from '../state';
import { models, pureLLM } from '@examples/models';

const outputPrompt = (userQuestion: string, agentThought: string): string => {
  return `SYSTEM: 당신은 USER 질문에 대한 최종 응답을 생성하는 도우미입니다. AGENT의 사고 과정을 바탕으로 USER에게 명확하고 친절한 응답을 제공하세요. AGENT의 내부 사고 과정을 직접 인용하지 말고, 그 내용을 기반으로 자연스러운 최종 답변을 작성하세요.
  
  AGENT: ${agentThought}
  
  USER: ${userQuestion}
  
  당신의 응답:`;
};

export const outputNode = node({
  name: 'output',
  execute(state: ReactState): Promise<string> {
    const llm = pureLLM(models.ollama.llama3);
    const prompt = outputPrompt(state.userPrompt, state.thought);
    return llm(prompt);
  },
});
