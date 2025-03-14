import { graphNode } from 'ts-edge';
import { ReflectiveStage, ReflectiveState } from '../state';
import { models, objectLLM } from '@examples/models';
import { z } from 'zod';
import { getHistoryText } from './helper';

// 추론 노드: 문제 분석 및 도구 선택
export const reasoningNode = graphNode({
  name: 'reasoning',
  metadata: { description: 'Decides if and which tools to use' },
  async execute(state: ReflectiveState): Promise<ReflectiveState> {
    if (state.debug) {
      console.log(`\n🧠 REASONING (남은 시도: ${state.retry})`);
    }
    --state.retry;
    // 도구 정보 포맷팅
    const toolsDesc = state.tools.map((t) => `- ${t.name}: ${t.description}`).join('\n');

    // 이전 기록 요약
    const historyText = getHistoryText(state.history);

    const llm = objectLLM(models.custom.standard);

    const ReasoningSchema = z.object({
      thought: z.string(),
      needTool: z.boolean(),
      toolName: z.enum(['', ...state.tools.map((v) => v.name)] as [string, ...string[]]),
    });

    const prompt = `당신은 Self-Reflection 능력을 갖춘 AI 에이전트입니다. 문제를 분석하고 도구 사용 여부를 결정하세요.

사용자 질문: "${state.userPrompt}"

사용 가능한 도구:
${toolsDesc}

${historyText ? `이전 작업: ${historyText}` : ''}
${historyText ? '이전 작업 내용을 바탕으로 다음 단계를 결정하세요. 아직 해결되지 않은 부분이 있는지 확인하세요.' : ''}

도구 사용 결정:
1. 도구가 필요하다면: 이전 사용된 도구와 도구의 결과를 바탕으로 현 단계에 가장 적합한 도구를 하나만 선택하세요, 
2. 도구가 필요없다면: 직접 답변할 수 있는 이유를 설명하세요

다음 형식으로 응답하세요:
{
  "thought": "질문 분석 및 도구 사용 여부와 도구를 사용하게 된다면 어떤 도구를 어떤 값으로 사용할지에 대한 계획",
  "needTool": true/false,
  "toolName": "사용할 도구 이름 (도구가 필요 없으면 빈 문자열 \"\")"
}`;

    const newHistory: ReflectiveState['history'][number] = {
      reasoing_prompt: prompt,
      tool: { name: undefined, input: undefined, output: undefined },
    };
    state.history.push(newHistory);
    const response = await llm(prompt, ReasoningSchema).catch((e) => {
      newHistory.error = e.message;
      throw e;
    });
    if (state.debug) {
      console.log(`생각: ${response.thought}`);
    }

    newHistory.reasoing_output = response.thought;

    // 다음 단계 결정
    if (response.needTool && response.toolName) {
      // 도구 선택 정보 저장
      state.stage = ReflectiveStage.ACTING;
      newHistory.tool.name = response.toolName;
    } else {
      // 도구 불필요시 바로 반성 단계로
      state.stage = ReflectiveStage.REFLECTING;
    }

    return state;
  },
});
