import { graphNode } from 'ts-edge';
import { ReflectiveStage, ReflectiveState } from '../state';
import { models, objectLLM } from '@examples/models';
import { z } from 'zod';

// 반성 노드
export const reflectingNode = graphNode({
  name: 'reflecting',
  metadata: { description: 'Evaluates approach and decides next steps' },
  async execute(state: ReflectiveState): Promise<ReflectiveState> {
    console.log(`\n🔍 REFLECTING`);

    // 이전 기록 요약
    const recordsText = state.history
      .map((r, i) => {
        let text = `[${i + 1}] `;
        if (r.stage === ReflectiveStage.REASONING) {
          text += `추론: ${r.thought}`;
          if (r.tool.name) text += `, 선택한 도구: ${r.tool.name}`;
        }
        if (r.tool.input) text += `\n   입력: ${r.tool.input}`;
        if (r.tool.output) text += `\n   출력: ${r.tool.output}`;
        if (r.reflection) text += `\n   반성: ${r.reflection}`;
        return text;
      })
      .join('\n\n');

    const llm = objectLLM(models.custom.standard);

    const ReflectionSchema = z.object({
      reflection: z.string(),
      needMoreWork: z.boolean(),
      reason: z.string(),
    });

    const response = await llm(
      `당신은 Self-Reflection 에이전트입니다. 지금까지의 접근을 평가하고 작업이 완료되었는지 판단하세요.
        
        사용자 질문: "${state.userPrompt}"
        
        작업 기록:
        ${recordsText}
        
        중요 체크 사항:
        - 질문의 모든 부분이 해결되었는가? ("그리고", "또한" 등 이후 부분 포함)
        - 도구 실행 결과가 최종 답변인지 중간 결과인지 확인
        - 이전 결과를 활용한 추가 계산/분석이 필요한지 확인
        
        다음 형식으로 JSON으로 응답:
        {
          "reflection": "작업이 더 필요시 반성 내용과 더 필요한 내용을 명확하게 이전 도구사용 내용과 함께 작성, 더 필요 없다면 작업내용 평가",
          "needMoreWork": true/false,
          "reason": "판단 이유, 다음엔 어떻게 행동 해야 할지 명확한 피드백."
        }`,
      ReflectionSchema
    );

    console.log(`반성: ${response.reflection}`);
    console.log(`추가 작업 필요: ${response.needMoreWork}`);
    console.log(`이유 : ${response.reason}`);

    // 상태 업데이트
    const newState: ReflectiveState = {
      ...state,
      history: [
        ...state.history,
        {
          stage: ReflectiveStage.REFLECTING,
          reflection: `${response.reflection} ${response.reason}`,
          tool: state.history.at(-1)?.tool ?? {},
        },
      ],
    };

    // 다음 단계 결정
    if (response.needMoreWork && state.retry > 0) {
      newState.stage = ReflectiveStage.REASONING;
    } else {
      newState.stage = ReflectiveStage.COMPLETED;
    }

    return newState;
  },
});
