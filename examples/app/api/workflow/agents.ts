import { createReactAgent } from '@examples/agentic/re-act';
import { createWorkflowActions } from './create-workflow-apis';
import { createReflectionAgent } from '@examples/agentic/self-reflective';
import { createRewooWorkflow } from '@examples/agentic/rewoo';
import { Agent } from '@ui/interface';
import { createSampleAgent } from '@examples/agentic/sample';
import { stupidCalculator } from '@examples/tools/stupid-calculator';
import { stupidSearchEngine } from '@examples/tools/stupid-search-engine';
import { stupidStringCounter } from '@examples/tools/stupid-string-counter';
import { tavilySearch } from '@examples/tools/tavily-search';

export const agents: Agent[] = [
  {
    name: 'ReAct',
    description:
      'An agent that solves problems step by step through iterative reasoning and action, systematically handling complex tasks.',
    defaultPrompt: 'strorrrberrry 에서 r 의 개수를 알려줄래?',
    api: createWorkflowActions(createReactAgent().compile('🧠 reasoning'), {
      inputParser: (input) => ({
        userPrompt: input.text!,
        tools: [stupidCalculator, stupidSearchEngine, stupidStringCounter],
      }),
      outputParser: (output) => output?.output_answer ?? '',
      reportParser(event) {
        const state = event.node.output!;
        const name = event.node.name;
        if (name == '🧠 reasoning') {
          return {
            prompt: state.thought_prompt,
            output: state.thought_answer,
          };
        }
        if (name == '🛠️ acting') {
          return {
            tool: state.action?.tool,
            input: state.action?.input,
            output: state.action?.output,
          };
        }
        if (name == 'answer') {
          return {
            prompt: state.output_prompt,
            output: state.output_answer,
          };
        }
        return {};
      },
    }),
  },
  {
    name: 'Self Reflection',
    defaultPrompt: '125* 125* 222 는 뭐야?',
    description:
      'An agent that analyzes and improves its own thought processes, continuously evaluating results to find better solutions.',
    api: createWorkflowActions(createReflectionAgent().compile('reasoning'), {
      inputParser: (input) => ({
        userPrompt: input.text!,
        tools: [stupidCalculator, stupidSearchEngine, stupidStringCounter],
      }),
      outputParser: (output) => output?.output_answer ?? '',
      reportParser(event) {
        const state = event.node.output!;
        const name = event.node.name;
        if (name == 'reasoning') {
          return {
            prompt: state.getLatestHistory().reasoing_prompt,
            output: state.getLatestHistory().reasoing_answer,
          };
        }
        if (name == 'reflecting') {
          return {
            prompt: state.getLatestHistory().reflection_prompt,
            output: state.getLatestHistory().reflection_answer,
          };
        }
        if (name == 'output') {
          return {
            prompt: state.output_prompt,
            output: state.output_answer,
          };
        }
        if (name == 'acting') {
          return {
            tool: state.getLatestHistory().tool?.name,
            input: state.getLatestHistory().tool?.input,
            output: state.getLatestHistory().tool?.output,
          };
        }
        return {};
      },
    }),
  },
  {
    name: 'Rewoo',
    description:
      'An agent that solves problems step by step through iterative reasoning and action, systematically handling complex tasks.',
    defaultPrompt: '권지용 최근 앨범이 뭐야? 그리고 그 앨범에 대한 평가에대한 간단한 md 문서를 작성해줘',
    api: createWorkflowActions(createRewooWorkflow().compile('📝 Planning'), {
      inputParser: (input) => ({
        userPrompt: input.text!,
        tools: [stupidCalculator, stupidStringCounter, tavilySearch],
      }),
      outputParser: (output) => output?.integration.answer ?? '',
      reportParser(event) {
        const state = event.node.output!;
        const name = event.node.name;
        if (name == '📝 Planning') {
          return {
            prompt: state.plan.prompt,
            tokens: state.plan.tokens,
            plans: state.plan.list,
          };
        }
        if (name == '🧠 Reasoning') {
          return {
            prompt: state.getCurrentPlan().reasoning?.prompt,
            output: state.getCurrentPlan().reasoning?.answer,
            tokens: state.getCurrentPlan().reasoning?.tokens,
          };
        }
        if (name == '🛠️ Acting') {
          return {
            tool: state.getCurrentPlan().acting?.name,
            input: state.getCurrentPlan().acting?.input,
            output: state.getCurrentPlan().acting?.output,
            tokens: state.getCurrentPlan().acting?.tokens,
          };
        }
        if (name == '🧐 Integration') {
          return {
            prompt: state.integration.prompt,
            output: state.integration.answer,
            tokens: state.integration.tokens,
          };
        }
        return {};
      },
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
