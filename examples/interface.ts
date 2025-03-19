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
  // 질문 : 이전 질문과 대답들이 포함될 수 있음
  prompt: CoreMessage[];

  // 답변
  answer?: string;

  // 사용된 토큰
  usedToken?: number;
};
