import { createStateGraph } from 'ts-edge';
import { reasoningNode } from './node/reasoning';
import { actingNode } from './node/acting';
import { answerNode } from './node/answer';
import { reActStore } from './state';

const workflow = createStateGraph(reActStore)
  .addNode(reasoningNode)
  .addNode(actingNode)
  .addNode(answerNode)
  .dynamicEdge('🧠 reasoning', {
    possibleTargets: ['answer', '🛠️ acting'],
    router: (state) => {
      return state.action?.tool ? '🛠️ acting' : 'answer';
    },
  })
  .edge('🛠️ acting', 'answer');

export const createReactAgent = () => workflow;
