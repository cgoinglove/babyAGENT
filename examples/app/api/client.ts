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
  description?: string;
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
    fetchStatusAction: reActAgentGetStatusAction,
    fetchStructureAction: reActAgentGetStructuresAction,
    startAction: reActAgentStartAction,
    stopAction: reActAgentStopAction,
    resumeAction: reActAgentResumeAction,
    resetAction: reActAgentReset,
  },
  {
    name: 'Self Reflection',
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
