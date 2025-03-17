import { graphNode } from 'ts-edge';
import { ReActState } from '../state';
import { ToolCall } from '@interface';
import { objectLLM, models } from '@examples/models';
import { z } from 'zod';

export const reasoningNode = graphNode({
  name: '🧠 reasoning',
  async execute(state: ReActState): Promise<ReActState> {
    // 도구 정보 포맷팅
    const toolsDescription = state.tools.map((tool: ToolCall) => `- ${tool.name}: ${tool.description}`).join('\n');

    const llm = objectLLM(models.custom.standard);

    const ReasoningSchema = z.object({
      thought: z.string(),
      toolName: z.enum(['', ...state.tools.map((v) => v.name)] as [string, ...string[]]),
    });
    const prompt = `당신은 ReACT(Reasoning + Acting) 에이전트로, 사용자 질문에 대해 논리적으로 생각하고 필요시 도구를 사용합니다.

    사용자 질문: "${state.userPrompt}"
      
    사용 가능한 도구:
    ${toolsDescription}
      
    먼저 질문을 분석하고, 도구 사용이 필요한지 판단하세요:
    1. 도구가 필요하다면: 어떤 도구를 사용할지, 왜 필요한지 간결하게 설명하세요
    2. 도구가 필요없다면: 직접 답변할 수 있는 이유를 설명하세요
      
    다음 JSON 형식으로 응답하세요:
    {
      "thought": "질문 분석 및 도구 사용 여부에 대한 간결한 추론",
      "toolName": "사용할 도구 이름 (도구가 필요 없으면 빈 문자열 '')"
    }`;

    state.thought_prompt = prompt;

    const response = await llm(prompt, ReasoningSchema);
    if (state.debug) {
      console.log(`\n\n🧠 REASONING NODE\n`);
      console.log(`생각    : ${response.thought}`);
    }
    state.thought_answer = response.thought;

    if (response.toolName) {
      state.action = {
        tool: response.toolName,
        input: '',
        output: '',
      };
    }
    return state;
  },
});
