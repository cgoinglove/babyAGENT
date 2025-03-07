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
  .dynamicEdge('🧠 reasoning', (nodeResult) => {
    return nodeResult.output.observation == 'need_action' ? '🛠️ acting' : 'output';
  })
  .edge('🛠️ acting', '🧠 reasoning');

export const ReActAgent = workflow.compile('input', 'output'); //startnode, endnode
// ReActAgent('안녕안녕')
