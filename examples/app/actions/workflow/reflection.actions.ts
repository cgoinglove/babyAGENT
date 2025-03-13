'use server';

import { createWorkflowActions } from './create-workflow-action';
import { stupidCalculator } from '@examples/tools/stupid-calculator';
import { stupidSearchEngine } from '@examples/tools/stupid-search-engine';
import { createReflectionAgent } from '@examples/agentic/self-reflective';

const agent = createReflectionAgent();

const api = createWorkflowActions(agent, 'input');

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
