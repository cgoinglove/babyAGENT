import { Tool } from '@interface';
import { z } from 'zod';

// 단순화된 단계 정의
export enum ReflectiveStage {
  REASONING = 'reasoning',
  ACTING = 'acting',
  REFLECTING = 'reflecting',
  COMPLETED = 'completed',
}

export const ReflectiveStateSchema = z.object({
  userPrompt: z.string(), // 유저 질문
  tools: z.array(z.any()) as z.ZodArray<z.ZodType<Tool>>, // 사용가능한 툴
  stage: z.nativeEnum(ReflectiveStage).default(ReflectiveStage.REASONING), //현 상태
  history: z.array(
    z.object({
      error: z.string().optional(),
      reasoing_prompt: z.string().optional(),
      reasoing_output: z.string().optional(),
      tool: z.object({ name: z.string().optional(), input: z.string().optional(), output: z.string().optional() }),
      reflection_prompt: z.string().optional(),
      reflection_output: z.string().optional(),
      output_prompt: z.string().optional(),
      output_output: z.string().optional(),
    })
  ),
  retry: z.number().default(5),
  debug: z.boolean().default(false).optional(),
});

export type ReflectiveState = z.infer<typeof ReflectiveStateSchema>;
