import { Tool } from '@interface';
import { z } from 'zod';

export const ReactStateSchema = z.object({
  userPrompt: z.string(),

  thought: z.string(),

  tools: z.array(z.any()) as z.ZodArray<z.ZodType<Tool>>,

  action: z.object({
    tool: z.string().optional(), // 도구 이름
    output: z.string().optional(), // llm 이 읽을 수있도록 직렬화 처리까지 해야함
    input: z.string().optional(), // llm 이 읽을 수있도록 직렬화 처리까지 해야함
  }),

  observation: z.enum(['complete', 'use_action']),

  limitTry: z.number().optional(),
});

export type ReactState = z.infer<typeof ReactStateSchema>;
