import { Tool } from '@interface';
import { z } from 'zod';

export const ReactStateSchema = z.object({
  userPrompt: z.string(),

  prompt: z.string().optional(),
  thought: z.string(),

  tools: z.array(z.any()) as z.ZodArray<z.ZodType<Tool>>,

  action: z.object({
    tool: z.string().optional(), // 도구 이름
    input: z.string().optional(), // llm 이 읽을 수있도록 직렬화 처리까지 해야함
    output: z.string().optional(), // llm 이 읽을 수있도록 직렬화 처리까지 해야함
  }),
  debug: z.boolean().default(false).optional(),
  output_prompt: z.string().optional(),
  output_output: z.string().optional(),
});

export type ReactState = z.infer<typeof ReactStateSchema>;
