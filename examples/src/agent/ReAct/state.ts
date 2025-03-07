import { z } from 'zod';

export const ReactStateSchema = z.object({
  // 입력: 사용자의 원래 질문
  input: z.string(),

  thought: z.string().optional(),

  action: z
    .object({
      tool: z.string(), // 도구 이름
      input: z.any().optional(), // 도구 인자
      output: z.any().optional(),
    })
    .optional(),

  observation: z.enum(['need_action', 'complete']).optional(),
});

export type ReactState = z.infer<typeof ReactStateSchema>;
