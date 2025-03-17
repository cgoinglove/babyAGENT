import { NodeThread } from '@ui/interface';

import { Node, Edge, MarkerType } from '@xyflow/react';
import { calculateRanker } from './circulate-ranker';
import { GraphNodeStructure } from 'ts-edge';

export type FlowNode = GraphNodeStructure & {
  status: NodeThread['status'];
  masterStatus: NodeThread['status'];
  level: number;
  index: number;
};

export type FlowEdge = Record<string, any>;

export const createFlow = (
  structures: GraphNodeStructure[],
  options?: {
    width?: number;
    height?: number;
  }
): { nodes: Node<FlowNode>[]; edges: Edge<FlowEdge>[] } => {
  const { height, width } = { height: 250, width: 250, ...options };

  const sourceToTargets = structures.reduce((acc, node) => {
    const targets = node.edge?.name || [];
    acc[node.name] = targets;
    return acc;
  }, {});

  const levelByNode = calculateRanker(sourceToTargets);

  const levelCount = Object.values(levelByNode).reduce((acc, node) => {
    acc[node.level] = (acc[node.level] || 0) + 1;
    return acc;
  }, {});

  const nodes = structures.reduce(
    (acc, node) => {
      const xIndex = levelByNode[node.name].index - (levelCount[levelByNode[node.name].level] - 1) / 2 + 1;

      const flowNode: Node<FlowNode> = {
        id: node.name,
        type: 'customDefault',
        position: {
          y: levelByNode[node.name].level * height,
          x: xIndex * width,
        },
        data: {
          ...node,
          level: levelByNode[node.name].level,
          index: levelByNode[node.name].index,
          status: 'ready',
          masterStatus: 'ready',
        },
      };
      acc[node.name] = flowNode;
      return acc;
    },
    {} as Record<string, Node<FlowNode>>
  );

  const edges: Edge<FlowEdge>[] = structures.flatMap((node) => {
    if (node.edge) {
      return node.edge.name.map((target) => {
        let sourceHandle: string | undefined = undefined;
        let targetHandle: string | undefined = undefined;

        const isSameLevel = levelByNode[node.name].level == levelByNode[target].level;
        const isToUpperLevel = levelByNode[node.name].level > levelByNode[target].level;
        if (isSameLevel) {
          if (levelByNode[node.name].index < levelByNode[target].index) {
            sourceHandle = 'right';
            targetHandle = 'left';
          } else {
            sourceHandle = 'left';
            targetHandle = 'right';
          }
        } else if (isToUpperLevel) {
          sourceHandle = 'right';
          targetHandle = 'right';
        }

        return {
          data: node,
          selectable: true,
          id: `${node.name}-${target}`,
          source: node.name,
          sourceHandle,
          targetHandle,
          target,
          animated: node.edge?.type == 'dynamic',
          // type: 'smoothstep',
          style: {
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        } as Edge<FlowEdge>;
      });
    }
    return [];
  });

  return { nodes: Object.values(nodes), edges };
};
