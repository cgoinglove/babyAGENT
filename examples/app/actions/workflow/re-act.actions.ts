'use server';

import { createWorkflowActions } from './create-workflow-action';
import { stupidCalculator } from '@examples/tools/stupid-calculator';
import { stupidSearchEngine } from '@examples/tools/stupid-search-engine';
import { createReactAgent } from '@examples/agentic/re-act';
import { stupidStringCounter } from '@examples/tools/stupid-string-counter';

const agent = createReactAgent();

const api = createWorkflowActions(agent, 'input', {
  inputViewParser() {
    return [];
  },
  outputViewParser({ node, isOk, error }) {
    if (isOk)
      switch (node.name) {
        case 'input':
          return [
            {
              label: '질문',
              value: node.input.prompt,
            },
            {
              label: '도구',
              value: node.input.tools.map((tool) => tool.name).join(', '),
            },
          ];
        case '🧠 reasoning': {
          return [
            { label: 'prompt', value: node.output.prompt },
            { label: 'answer', value: node.output.thought },
          ];
        }
        case 'output':
          return [
            { label: 'prompt', value: node.output.output_prompt },
            { label: 'answer', value: node.output.output_output },
          ];
        case '🛠️ acting':
          return [
            {
              label: '도구 input',
              value: node.output.action.input,
            },
            {
              label: '도구 output',
              value: node.output.action.output,
            },
          ];
        default:
          return [];
      }

    return [{ label: 'error', value: error }];
  },
});

export async function reActAgentStartAction(prompt: string) {
  api.start({
    prompt,
    tools: [stupidCalculator, stupidSearchEngine, stupidStringCounter],
  });
}

export async function reActAgentStopAction() {
  return api.stop();
}
export async function reActAgentResumeAction() {
  return api.resume();
}
export async function reActAgentGetStatusAction() {
  return api.getStatus();
}
export async function reActAgentGetStructuresAction() {
  return api.getNodeStructures();
}
export async function reActAgentReset() {
  return api.reset();
}
