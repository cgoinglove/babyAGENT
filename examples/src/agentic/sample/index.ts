import { createStateGraph } from 'ts-edge';
import { sampleStartNode } from './node/start-node';
import { sampleANode } from './node/a-node';
import { sampleBNode } from './node/b-node';
import { sampleEndNode } from './node/end-node';
import { sampleStore } from './state';

const workflow = createStateGraph(sampleStore)
  .addNode(sampleStartNode)
  .addNode(sampleANode)
  .addNode(sampleBNode)
  .addNode(sampleEndNode)
  .dynamicEdge('start', {
    possibleTargets: ['A', 'B'],
    router: ({ nextStage }) => {
      return nextStage === 'A' ? 'A' : 'B';
    },
  })
  .edge('A', 'End')
  .edge('B', 'End');

export const createSampleAgent = () => workflow;
