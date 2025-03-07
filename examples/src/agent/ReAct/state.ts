import { Tool } from '@interface';
import { z } from 'zod';

export const ReactStateSchema = z.object({
  userPrompt: z.string(),

  thought: z.string(),

  tools: z.array(z.any()) as z.ZodArray<z.ZodType<Tool>>,

  action: z.object({
    tool: z.string().optional(), // 도구 이름
    input: z.any().optional(), // 도구 인자
    output: z.any().optional(),
  }),

  observation: z.enum(['need_action', 'complete']),
});

export type ReactState = z.infer<typeof ReactStateSchema>;
