import { NodeStructure, NodeThread } from '@ui/actions/workflow/create-workflow-action';
import { graphlib, layout } from '@dagrejs/dagre';

import { Node, Edge, MarkerType } from '@xyflow/react';

export type FlowNode = NodeStructure & {
  status: NodeThread['status'];
  duration?: NodeThread['duration'];
  masterStatus: NodeThread['status'];
};

export type FlowEdge = {};

export const createFlow = (
  structures: NodeStructure[],
  options?: {
    width?: number;
    height?: number;
  }
): { nodes: Node<FlowNode>[]; edges: Edge<FlowEdge>[] } => {
  const { height, width } = { height: 200, width: 400, ...options };
  const g = new graphlib.Graph();
  g.setGraph({ rankdir: 'TB' });
  g.setDefaultEdgeLabel(() => ({}));

  structures.forEach((node) => {
    g.setNode(node.name, {
      width,
      height,
      label: node.name,
    });
  });

  structures.forEach((node) => {
    if (node.edge) {
      node.edge.name.forEach((target) => {
        g.setEdge(node.name, target);
      });
    }
  });

  layout(g);

  const nodes: Node<FlowNode>[] = structures.map((node) => {
    const dagreNode = g.node(node.name);
    return {
      id: node.name,
      type: 'customDefault',
      position: {
        x: dagreNode.x - width / 2,
        y: dagreNode.y - height / 2,
      },
      data: {
        ...node,
        status: 'ready',
        masterStatus: 'ready',
      },
    };
  });

  const edges: Edge<FlowEdge>[] = structures.flatMap((node) => {
    if (node.edge) {
      return node.edge.name.map(
        (target) =>
          ({
            data: node,
            selectable: true,
            id: `${node.name}-${target}`,
            source: node.name,
            target,
            animated: node.edge?.type == 'dynamic',
            style: {
              strokeWidth: 2,
              stroke: '#FF0072',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#FF0072',
            },
          }) as Edge<FlowEdge>
      );
    }
    return [];
  });

  return { nodes, edges };
};
