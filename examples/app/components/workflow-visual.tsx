'use client';

import React, { useEffect } from 'react';
import { graphlib, layout } from '@dagrejs/dagre';

import {
  ReactFlow,
  Node as RFNode,
  Edge as RFEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NodeStructure } from '@ui/actions/workflow/create-workflow-action';
import CustomDefaultNode from './custom-flow-node/default';

interface Props {
  structures: NodeStructure[];
}

const nodeTypes = {
  customDefault: CustomDefaultNode,
};

const nodeWidth = 150;
const nodeHeight = 100;

const getFlow = (structures: NodeStructure[]) => {
  const g = new graphlib.Graph();
  g.setGraph({ rankdir: 'TB' });
  g.setDefaultEdgeLabel(() => ({}));

  structures.forEach((node) => {
    g.setNode(node.name, {
      width: nodeWidth,
      height: nodeHeight,
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

  // dagre 레이아웃 계산 실행
  layout(g);

  // React Flow 노드로 변환
  const nodes: RFNode<NodeStructure>[] = structures.map((node) => {
    const dagreNode = g.node(node.name);
    return {
      id: node.name,
      type: 'customDefault',
      position: {
        x: dagreNode.x - nodeWidth / 2,
        y: dagreNode.y - nodeHeight / 2,
      },
      data: {
        ...node,
        label: node.name,
      },
    };
  });

  // React Flow 엣지로 변환
  const edges: RFEdge[] = structures.flatMap((node) => {
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
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          }) as RFEdge
      );
    }
    return [];
  });

  return { nodes, edges };
};

export default function WorkFlowVisual({ structures }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  useEffect(() => {
    const flow = getFlow(structures);
    setNodes(flow.nodes);
    setEdges(flow.edges);
  }, [structures]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        fitView
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
