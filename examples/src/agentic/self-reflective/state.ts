import { ToolCall } from '@interface';

// 단순화된 단계 정의
export enum ReflectiveStage {
  REASONING = 'reasoning',
  ACTING = 'acting',
  REFLECTING = 'reflecting',
  COMPLETED = 'completed',
}

export type ReflectiveState = {
  userPrompt: string;
  tools: ToolCall[];
  stage: ReflectiveStage;
  history: {
    error?: string;
    reasoing_prompt?: string;
    reasoing_answer?: string;
    tool?: {
      name?: string;
      input?: string;
      output?: string;
    };
    reflection_prompt?: string;
    reflection_answer?: string;
    output_prompt?: string;
    output_answer?: string;
  }[];
  retry: number;
  debug: boolean;
};
