import { createGraph } from 'ts-edge';
import { reasoningNode } from './node/reasoning';
import { actingNode } from './node/acting';
import { outputNode } from './node/output';
import { inputNode } from './node/input';

const workflow = createGraph()
  .addNode(inputNode)
  .addNode(reasoningNode)
  .addNode(actingNode)
  .addNode(outputNode)
  .edge('input', '🧠 reasoning')
  .dynamicEdge('🧠 reasoning', {
    possibleTargets: ['output', '🛠️ acting'],
    router: (state) => {
      return state.action?.tool ? '🛠️ acting' : 'output';
    },
  })
  .edge('🛠️ acting', 'output');

export const createReactAgent = () => workflow;
