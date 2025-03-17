import { createReactAgent } from '@examples/agentic/re-act';
import { createWorkflowActions } from './create-workflow-apis';
import { createReflectionAgent } from '@examples/agentic/self-reflective';
import { createRewooWorkflow } from '@examples/agentic/rewoo';
import { Agent } from '@ui/interface';
import { createSampleAgent } from '@examples/agentic/sample';
import { stupidCalculator } from '@examples/tools/stupid-calculator';
import { stupidSearchEngine } from '@examples/tools/stupid-search-engine';
import { stupidStringCounter } from '@examples/tools/stupid-string-counter';

export const agents: Agent[] = [
  {
    name: 'ReAct',
    description:
      'An agent that solves problems step by step through iterative reasoning and action, systematically handling complex tasks.',
    defaultPrompt: 'strorrrberrry 에서 r 의 개수를 알려줄래?',
    api: createWorkflowActions(createReactAgent().compile('input'), {
      inputParser: (input) => ({
        userPrompt: input.text!,
        tools: [stupidCalculator, stupidSearchEngine, stupidStringCounter],
      }),
      outputParser: (output) => output?.output_answer ?? '',
    }),
  },
  {
    name: 'Self Reflection',
    defaultPrompt: '125* 125* 222 는 뭐야?',
    description:
      'An agent that analyzes and improves its own thought processes, continuously evaluating results to find better solutions.',
    api: createWorkflowActions(createReflectionAgent().compile('input'), {
      inputParser: (input) => ({
        userPrompt: input.text!,
        tools: [stupidCalculator, stupidSearchEngine, stupidStringCounter],
      }),
      outputParser: (output) => output?.output_answer ?? '',
    }),
  },
  {
    name: 'Rewoo',
    description:
      'An agent that solves problems step by step through iterative reasoning and action, systematically handling complex tasks.',
    defaultPrompt: '124812*15125-35의 값과 strorrrberrry 에서 r 의 개수를 알려줄래?',
    api: createWorkflowActions(createRewooWorkflow().compile('start'), {
      inputParser: (input) => ({
        userPrompt: input.text!,
        tools: [stupidCalculator, stupidSearchEngine, stupidStringCounter],
      }),
      outputParser: (output) => output?.integration.answer ?? '',
    }),
  },
  {
    name: 'Sample',
    description: 'Sample agent',
    defaultPrompt: 'hello world',
    api: createWorkflowActions(createSampleAgent().compile('start'), {
      inputParser: (input) => ({
        userPrompt: input.text!,
      }),
      outputParser: (output) => output?.nextStage ?? '',
    }),
  },
];
