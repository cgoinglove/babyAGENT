'use server';

import { createWorkflowActions } from './create-workflow-action';
import { stupidCalculator } from '@examples/tools/stupid-calculator';
import { stupidSearchEngine } from '@examples/tools/stupid-search-engine';
import { createReactAgent } from '@examples/agentic/re-act';

const agent = createReactAgent();

const api = createWorkflowActions(agent, 'input');

export async function reActAgentStartAction(prompt: string) {
  api.start({
    prompt,
    tools: [stupidCalculator, stupidSearchEngine, stupidSearchEngine],
  });
}

export async function reActAgentStopAction() {
  return api.stop();
}
export async function reActAgentResumeAction() {
  return api.resume();
}
export async function reActAgentGetFlowAction() {
  return api.getFlowInfo();
}
