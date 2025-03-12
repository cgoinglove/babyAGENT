import { graphNode } from 'ts-edge';
import { ReflectiveStage, ReflectiveState } from '../state';
import { models, objectLLM } from '@examples/models';
import { z } from 'zod';

// 추론 노드: 문제 분석 및 도구 선택
export const reasoningNode = graphNode({
  name: 'reasoning',
  description: 'Decides if and which tools to use',
  async execute(state: ReflectiveState): Promise<ReflectiveState> {
    console.log(`\n🧠 REASONING (남은 시도: ${state.retry})`);

    // 도구 정보 포맷팅
    const toolsDesc = state.tools.map((t) => `- ${t.name}: ${t.description}`).join('\n');

    // 이전 기록 요약
    let historyText = '';
    if (state.history.length > 0) {
      // 간결한 히스토리 표현
      historyText = state.history
        .slice(-3)
        .map((r) => {
          let text = '';
          if (r.stage === ReflectiveStage.REASONING) {
            text += `추론: ${r.thought}`;
          } else if (r.stage === ReflectiveStage.ACTING) {
            text += `도구 실행: ${r.tool.name} → 입력: ${r.tool.input} → 출력: ${r.tool.output}`;
          } else if (r.stage === ReflectiveStage.REFLECTING) {
            text += `반성: ${r.reflection}`;
          }
          return text;
        })
        .filter(Boolean)
        .join('\n');

      if (historyText) {
        historyText = `\n최근 작업 내역:\n${historyText}`;
      }
    }
    const llm = objectLLM(models.custom.standard);

    const ReasoningSchema = z.object({
      thought: z.string(),
      needTool: z.boolean(),
      toolName: z.enum(['', ...state.tools.map((v) => v.name)] as [string, ...string[]]),
    });

    const response = await llm(
      `당신은 Self-Reflection 능력을 갖춘 AI 에이전트입니다. 문제를 분석하고 도구 사용 여부를 결정하세요.

사용자 질문: "${state.userPrompt}"

사용 가능한 도구:
${toolsDesc}
${historyText}


도구 사용 결정:
1. 도구가 필요하다면: 현 단계에 가장 적합한 도구를 하나만 선택하세요
2. 도구가 필요없다면: 직접 답변할 수 있는 이유를 설명하세요

${historyText != '' ? '이전 작업 내용을 바탕으로 다음 단계를 결정하세요. 아직 해결되지 않은 부분이 있는지 확인하세요.' : ''}

다음 형식으로 응답하세요:
{
  "thought": "질문 분석 및 도구 사용 여부와 어떻게 사용 해야 할지에 대한 추론",
  "needTool": true/false,
  "toolName": "사용할 도구 이름 (도구가 필요 없으면 빈 문자열 \"\")"
}`,
      ReasoningSchema
    );

    console.log(`생각: ${response.thought}`);

    // 상태 업데이트
    const newState: ReflectiveState = {
      ...state,
      history: [
        ...state.history,
        {
          stage: ReflectiveStage.REASONING,
          thought: response.thought,
          tool: { name: undefined, input: undefined, output: undefined },
        },
      ],
      retry: state.retry - 1,
    };

    // 다음 단계 결정
    if (response.needTool && response.toolName) {
      // 도구 선택 정보 저장
      newState.stage = ReflectiveStage.ACTING;
      newState.history[newState.history.length - 1].tool.name = response.toolName;
    } else {
      // 도구 불필요시 바로 반성 단계로
      newState.stage = ReflectiveStage.REFLECTING;
    }

    return newState;
  },
});
