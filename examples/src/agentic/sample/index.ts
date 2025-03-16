import { createGraph } from 'ts-edge';
import { sampleStartNode } from './node/start-node';
import { sampleANode } from './node/a-node';
import { sampleBNode } from './node/b-node';
import { sampleEndNode } from './node/end-node';

const workflow = createGraph()
  .addNode(sampleStartNode)
  .addNode(sampleANode)
  .addNode(sampleBNode)
  .addNode(sampleEndNode)
  .dynamicEdge('start', (state) => {
    return state.nextStage === 'A' ? 'A' : 'B';
  })
  .edge('A', 'End')
  .edge('B', 'End');

export const createSampleAgent = () => workflow;
