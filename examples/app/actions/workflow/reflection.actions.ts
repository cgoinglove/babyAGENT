'use server';

import { createWorkflowActions } from './workflow-action';
import { stupidCalculator } from '@examples/tools/stupid-calculator';
import { stupidSearchEngine } from '@examples/tools/stupid-search-engine';
import { createReflectionAgent } from '@examples/agentic/self-reflective';

const agent = createReflectionAgent();
const api = createWorkflowActions(agent);

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
export async function reflectionAgentGetFlowAction() {
  return api.getFlow();
}
