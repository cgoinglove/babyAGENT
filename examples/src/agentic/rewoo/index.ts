import { createGraph } from 'ts-edge';
import { rewooPlanningNode } from './node/planning';
import { rewooStartNode } from './node/start';
import { rewooReasoningNode } from './node/reasoning';
import { rewooIntegrationNode } from './node/integration';
import { rewooActingNode } from './node/acting';
import { rewooCheckPlanNode } from './node/check-plan';
const rewooWorkflow = createGraph()
  .addNode(rewooStartNode)
  .addNode(rewooPlanningNode)
  .addNode(rewooReasoningNode)
  .addNode(rewooCheckPlanNode)
  .addNode(rewooActingNode)
  .addNode(rewooIntegrationNode)
  .edge('start', '📝 Planning')
  .edge('📝 Planning', '🧠 Reasoning')
  .edge('🛠️ Acting', '✅ Check Plan')
  .dynamicEdge('🧠 Reasoning', {
    possibleTargets: ['🛠️ Acting', '✅ Check Plan'],
    router: (state) => {
      const plan = state.plan.list[state.planIndex];
      if (plan?.step === 'acting') {
        return '🛠️ Acting';
      } else {
        return '✅ Check Plan';
      }
    },
  })
  .dynamicEdge('✅ Check Plan', {
    possibleTargets: ['🧠 Reasoning', '🧐 Integration'],
    router: (state) => {
      if (state.plan.list[state.planIndex]) {
        return '🧠 Reasoning';
      } else {
        return '🧐 Integration';
      }
    },
  });

export const createRewooWorkflow = () => rewooWorkflow;
