import { type ZodType } from 'zod';

export interface Tool<Input = unknown, Output = unknown> {
  name: string;
  description: string;
  execute: (param: Input) => Output;
  schema: ZodType<Input>;
}

export type PureLLmFunction = (prompt: string) => Promise<string>;
