import { ToolCall } from '@interface';

export type ReActState = {
  userPrompt: string;
  thought_prompt: string;
  thought_answer: string;
  tools: ToolCall[];
  action?: {
    tool: string;
    input: string;
    output: string;
  };
  debug: boolean;
  output_prompt?: string;
  output_answer?: string;
};
