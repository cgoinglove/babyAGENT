import { graphStateNode } from 'ts-edge';
import { ReflectiveStage, ReflectiveState } from '../state';
import { models } from '@examples/models';
import { z } from 'zod';
import { getHistoryText } from './helper';
import { streamObject } from 'ai';

// 반성 노드
export const reflectingNode = graphStateNode({
  name: 'reflecting',
  metadata: { description: 'Evaluates approach and decides next steps' },
  async execute(state: ReflectiveState, { stream }) {
    const latestHistory = { ...state.getLatestHistory() };

    stream(`🔍 REFLECTING\n`);

    // 이전 기록 요약
    const historyText = getHistoryText(state.history);

    const ReflectionSchema = z.object({
      reflection: z.string(),
      needMoreWork: z.boolean(),
      reason: z.string(),
    });

    const prompt = `당신은 Self-Reflection 에이전트입니다. 지금까지의 접근을 평가하고 작업이 완료되었는지 판단하세요.
        
    사용자 질문: "${state.userPrompt}"
    
    작업 기록:${historyText}
    
    중요 체크 사항:
    - 질문의 모든 부분이 해결되었는가? ("그리고", "또한" 등 이후 부분 포함)
    - 도구 실행 결과가 최종 답변인지 중간 결과인지 확인
    - 이전 결과를 활용한 추가 계산/분석이 필요한지 확인
    
    다음 형식으로 JSON으로 응답:
    {
      "reflection": "작업이 더 필요시 반성 내용과 더 필요한 내용을 명확하게 이전 도구사용 내용과 함께 작성, 더 필요 없다면 작업내용 평가",
      "needMoreWork": true/false,
      "reason": "판단 이유, 다음엔 어떻게 행동 해야 할지 명확한 피드백."
    }`;
    stream(`${prompt}\n`);
    latestHistory.reflection_prompt = prompt;

    const response = streamObject({
      model: models.standard,
      schema: ReflectionSchema,
      prompt,
    });

    for await (const text of response.textStream) {
      stream(text);
    }

    const result = await response.object;

    latestHistory.reflection_answer = result.reflection + (result.reason || '');

    state.updateLatestHistory(latestHistory);
    state.setStage(result.needMoreWork && state.retry > 0 ? ReflectiveStage.REASONING : ReflectiveStage.COMPLETED);
  },
});
