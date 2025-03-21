import { CoreMessage } from 'ai';
import { type ZodType } from 'zod';

export interface ToolCall<Input = any, Output = any> {
  name: string;
  description: string;
  execute: (param: Input) => Output;
  schema: ZodType<Input>;
}

export type PureLLmFunction = (prompt: string) => Promise<string>;

// llm 사용 컨텍스트
export type LLmContext = {
  prevMessages: CoreMessage[];

  prompt: string;
  // 답변
  answer?: string;
  // 사용된 토큰
  usedToken?: number;
};
