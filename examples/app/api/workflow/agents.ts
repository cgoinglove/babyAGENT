import { createReactAgent } from '@examples/agentic/re-act';
import { createWorkflowActions } from './create-workflow-apis';
import { createReflectionAgent } from '@examples/agentic/self-reflective';
import { createRewooWorkflow } from '@examples/agentic/rewoo';

type Agent = {
  name: string;
  description: string;
  defaultPrompt: string;
  api: ReturnType<typeof createWorkflowActions>;
};

export const agents: Agent[] = [
  {
    name: 'ReAct',
    description:
      'An agent that solves problems step by step through iterative reasoning and action, systematically handling complex tasks.',
    defaultPrompt: 'strorrrberrry 에서 r 의 개수를 알려줄래?',
    api: createWorkflowActions(createReactAgent(), 'input'),
  },
  {
    name: 'Self Reflection',
    defaultPrompt: '125* 125* 222 는 뭐야?',
    description:
      'An agent that analyzes and improves its own thought processes, continuously evaluating results to find better solutions.',
    api: createWorkflowActions(createReflectionAgent(), 'input'),
  },
  {
    name: 'Rewoo',
    description:
      'An agent that solves problems step by step through iterative reasoning and action, systematically handling complex tasks.',
    defaultPrompt: '124812*15125-35의 값과 strorrrberrry 에서 r 의 개수를 알려줄래?',
    api: createWorkflowActions(createRewooWorkflow(), 'start'),
  },
];
