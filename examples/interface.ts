import { type ZodType } from 'zod';

export interface ToolCall<Input = any, Output = any> {
  name: string;
  description: string;
  execute: (param: Input) => Output;
  schema: ZodType<Input>;
}

export type PureLLmFunction = (prompt: string) => Promise<string>;
