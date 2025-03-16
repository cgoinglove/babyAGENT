import { createRewooWorkflow } from '@examples/agentic/rewoo';
import { createWorkflowActions } from './create-workflow-action';
import { stupidCalculator } from '@examples/tools/stupid-calculator';
import { stupidSearchEngine } from '@examples/tools/stupid-search-engine';

const agent = createRewooWorkflow();

const api = createWorkflowActions(agent, 'start', {
  dataViewParser(event) {
    if (event.eventType == 'NODE_START') return [];
    const { node, isOk, error } = event;
    if (isOk)
      switch (node.name) {
        case 'start': {
          return [
            { label: '질문', value: node.input.prompt },
            { label: '도구', value: node.input.tools.map((tool) => tool.name).join(', ') },
          ];
        }
        case '📝 Planning':
          return [
            {
              label: 'plan',
              value: node.output.plan.list,
            },
            {
              label: 'prompt',
              value: node.output.plan.plan_prompt!,
            },
            {
              label: 'plan_tokens',
              value: node.output.plan.tokens!,
            },
          ];
        case '🧠 Reasoning':
          return [
            {
              label: 'prompt',
              value: node.output.plan.list[node.output.planIndex].reasoning?.prompt,
            },
            {
              label: 'answer',
              value: node.output.plan.list[node.output.planIndex].reasoning?.answer,
            },
            {
              label: 'tokens',
              value: node.output.plan.list[node.output.planIndex].reasoning?.tokens,
            },
          ];
        case '🛠️ Acting':
          return [
            {
              label: 'tool',
              value: node.output.plan.list[node.output.planIndex].acting?.name,
            },
            {
              label: 'input',
              value: node.output.plan.list[node.output.planIndex].acting?.input,
            },
            {
              label: 'output',
              value: node.output.plan.list[node.output.planIndex].acting?.output,
            },
            {
              label: 'tokens',
              value: node.output.plan.list[node.output.planIndex].acting?.tokens,
            },
          ];
        case '🧐 Integration':
          return [
            {
              label: 'prompt',
              value: node.output.integration.prompt,
            },
            {
              label: 'answer',
              value: node.output.integration.answer,
            },

            {
              label: 'tokens',
              value: node.output.integration.tokens,
            },
          ];
        default:
          return [];
      }
    return [{ label: 'error', value: error }];
  },
});

export async function rewooStartAction(prompt: string) {
  api.start({
    prompt,
    tools: [stupidCalculator, stupidSearchEngine, stupidSearchEngine],
  });
}

export async function rewooStopAction() {
  return api.stop();
}

export async function rewooResumeAction() {
  return api.resume();
}

export async function rewooGetStatusAction() {
  return api.getStatus();
}

export async function rewooGetStructuresAction() {
  return api.getNodeStructures();
}

export async function rewooResetAction() {
  return api.reset();
}
