import { ToolCall } from '@interface';
import { createGraphStore } from 'ts-edge';

export type ReActState = {
  userPrompt: string;
  tools: ToolCall[];
  thought_prompt: string;
  thought_answer: string;
  action?: {
    tool: string;
    input: string;
    output: string;
  };
  output_prompt?: string;
  output_answer?: string;
  setThought: (prompt: string, answer: string) => void;
  setAction: (action?: ReActState['action']) => void;
  setOutput: (prompt: string, answer: string) => void;
};

export const reActStore = createGraphStore<ReActState>((set) => {
  return {
    userPrompt: '',
    thought_prompt: '',
    thought_answer: '',
    tools: [],
    setThought: (prompt, answer) => {
      set({ thought_prompt: prompt, thought_answer: answer });
    },
    setAction: (action) => {
      set({ action });
    },
    setOutput: (prompt, answer) => {
      set({ output_prompt: prompt, output_answer: answer });
    },
  };
});
