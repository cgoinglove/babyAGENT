'use server';

import { createWorkflowActions } from './create-workflow-action';
import { stupidCalculator } from '@examples/tools/stupid-calculator';
import { stupidSearchEngine } from '@examples/tools/stupid-search-engine';
import { createReflectionAgent } from '@examples/agentic/self-reflective';

const agent = createReflectionAgent();

const api = createWorkflowActions(agent, 'input', {
  inputViewParser() {
    return [];
  },
  outputViewParser(event) {
    if (event.isOk) {
      const state = event.node.output;
      const latestHistory = state.history[state.history.length - 1];
      switch (event.node.name) {
        case 'input': {
          return [
            { label: '질문', value: state.userPrompt },
            { label: '도구', value: state.tools.map((tool) => tool.name).join(', ') },
          ];
        }
        case 'reasoning': {
          return [
            { label: 'prompt', value: latestHistory.reasoing_prompt },
            { label: 'answer', value: latestHistory.reasoing_output },
          ];
        }
        case 'reflecting': {
          return [
            { label: 'prompt', value: latestHistory.reflection_prompt },
            { label: 'answer', value: latestHistory.reflection_output },
          ];
        }
        case 'acting': {
          return [
            { label: 'tool', value: latestHistory.tool.name },
            { label: 'tool input', value: latestHistory.tool.input },
            { label: 'tool output', value: latestHistory.tool.output },
          ];
        }
        case 'output': {
          return [
            { label: 'prompt', value: latestHistory.output_prompt },
            { label: 'answer', value: latestHistory.output_output },
          ];
        }
      }
    }
    return [{ label: 'error', value: event.error }];
  },
});

export async function reflectionAgentStartAction(prompt: string) {
  api.start({
    prompt,
    tools: [stupidCalculator, stupidSearchEngine, stupidSearchEngine],
  });
}

export async function reflectionAgentStopAction() {
  return api.stop();
}
export async function reflectionAgentResumeAction() {
  return api.resume();
}
export async function reflectionAgentGetStatusAction() {
  return api.getStatus();
}
export async function reflectionAgentGetStructuresAction() {
  return api.getNodeStructures();
}
export async function reflectionAgentReset() {
  return api.reset();
}
