import { Tool } from '@interface';
import { z } from 'zod';

// 단순화된 단계 정의
export enum ReflectiveStage {
  REASONING = 'reasoning',
  ACTING = 'acting',
  REFLECTING = 'reflecting',
  COMPLETED = 'completed',
}

// 간소화된 기록 타입
export interface Record {
  stage: ReflectiveStage;
  thought?: string;
  tool: {
    name?: string;
    input?: string;
    output?: string;
  };
  reflection?: string;
}

export const ReflectiveStateSchema = z.object({
  userPrompt: z.string(), // 유저 질문
  tools: z.array(z.any()) as z.ZodArray<z.ZodType<Tool>>, // 사용가능한 툴
  stage: z.nativeEnum(ReflectiveStage).default(ReflectiveStage.REASONING), //현 상태
  history: z.array(
    z.object({
      stage: z.nativeEnum(ReflectiveStage),
      thought: z.string().optional(),
      tool: z.object({ name: z.string().optional(), input: z.string().optional(), output: z.string().optional() }),
      reflection: z.string().optional(),
    })
  ),
  retry: z.number().default(5),
});

export type ReflectiveState = z.infer<typeof ReflectiveStateSchema>;
