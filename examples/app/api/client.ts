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
import { rewooResetAction, rewooResumeAction, rewooStopAction } from '@ui/actions/workflow/rewoo.actions';
import { rewooStartAction } from '@ui/actions/workflow/rewoo.actions';
import { rewooGetStructuresAction } from '@ui/actions/workflow/rewoo.actions';
import { rewooGetStatusAction } from '@ui/actions/workflow/rewoo.actions';

const agents: {
  name: string;
  description: string;
  defaultPrompt: string;
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
    defaultPrompt: 'strorrrberrry 에서 r 의 개수를 알려줄래?',
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
    defaultPrompt: '125* 125* 222 는 뭐야?',
    description:
      'An agent that analyzes and improves its own thought processes, continuously evaluating results to find better solutions.',
    fetchStatusAction: reflectionAgentGetStatusAction,
    fetchStructureAction: reflectionAgentGetStructuresAction,
    startAction: reflectionAgentStartAction,
    stopAction: reflectionAgentStopAction,
    resumeAction: reflectionAgentResumeAction,
    resetAction: reflectionAgentReset,
  },
  {
    name: 'Rewoo',
    description:
      'An agent that solves problems step by step through iterative reasoning and action, systematically handling complex tasks.',
    defaultPrompt: '124812*15125-35의 값과 strorrrberrry 에서 r 의 개수를 알려줄래?',
    fetchStatusAction: rewooGetStatusAction,
    fetchStructureAction: rewooGetStructuresAction,
    startAction: rewooStartAction,
    stopAction: rewooStopAction,
    resumeAction: rewooResumeAction,
    resetAction: rewooResetAction,
  },
];

export const api = {
  agents,
};
