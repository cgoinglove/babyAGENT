'use client';
import {
  reflectionAgentGetStatusAction,
  reflectionAgentGetStructuresAction,
  reflectionAgentResumeAction,
  reflectionAgentStartAction,
  reflectionAgentStopAction,
  reflectionAgentReset,
} from '@ui/actions/workflow/reflection.actions';

import {
  reActAgentGetStatusAction,
  reActAgentGetStructuresAction,
  reActAgentResumeAction,
  reActAgentStartAction,
  reActAgentStopAction,
  reActAgentReset,
} from '@ui/actions/workflow/re-act.actions';
import { NodeStructure, NodeThread, WorkflowStatus } from '@ui/actions/workflow/create-workflow-action';

const agents: {
  name: string;
  description: string;
  stopAction(): Promise<void>;
  resumeAction(): Promise<void>;
  startAction(prompt: string): Promise<void>;
  resetAction(): Promise<void>;
  fetchStatusAction(): Promise<{
    threads: NodeThread[];
    workflowStatus: WorkflowStatus;
  }>;
  fetchStructureAction(): Promise<NodeStructure[]>;
}[] = [
  {
    name: 'Reasoing Acting',
    description:
      'An agent that solves problems step by step through iterative reasoning and action, systematically handling complex tasks.',
    fetchStatusAction: reActAgentGetStatusAction,
    fetchStructureAction: reActAgentGetStructuresAction,
    startAction: reActAgentStartAction,
    stopAction: reActAgentStopAction,
    resumeAction: reActAgentResumeAction,
    resetAction: reActAgentReset,
  },
  {
    name: 'Self Reflection',
    description:
      'An agent that analyzes and improves its own thought processes, continuously evaluating results to find better solutions.',
    fetchStatusAction: reflectionAgentGetStatusAction,
    fetchStructureAction: reflectionAgentGetStructuresAction,
    startAction: reflectionAgentStartAction,
    stopAction: reflectionAgentStopAction,
    resumeAction: reflectionAgentResumeAction,
    resetAction: reflectionAgentReset,
  },
];

export const api = {
  agents,
};
