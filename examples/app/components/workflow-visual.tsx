'use client';
import React, { useEffect } from 'react';

import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowStatus } from '@ui/interface';
import CustomDefaultNode from './custom-flow-node/default';
import { FlowEdge, FlowNode, createFlow } from '@ui/helper/create-flow';
import { GraphNodeStructure } from 'ts-edge';
interface Props {
  structures: GraphNodeStructure[];
  nodeStatusByName: Record<string, WorkflowStatus>;
  workflowStatus: WorkflowStatus;
  onSelectNode: (name: string) => void;
}

const nodeTypes = {
  customDefault: CustomDefaultNode,
};

export default function WorkFlowVisual({ onSelectNode, structures, nodeStatusByName, workflowStatus }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowNode>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<FlowEdge>>([]);

  useEffect(() => {
    const flow = createFlow(structures);
    setNodes(flow.nodes);
    setEdges(flow.edges);
  }, [structures]);

  useEffect(() => {
    const isDiff = (a: any, b: any) => {
      return a.duration != b.duration || a.status != b.status || a.masterStatus != b.masterStatus;
    };
    setNodes((nodes) => {
      return nodes.map((node) => {
        const prev = { status: node.data.status, masterStatus: node.data.masterStatus };
        const next = { status: nodeStatusByName[node.data.name], masterStatus: workflowStatus };
        if (isDiff(prev, next)) {
          return {
            ...node,
            data: { ...node.data, ...next },
          };
        }
        return node;
      });
    });
  }, [nodeStatusByName, workflowStatus]);

  return (
    <div className="w-full h-full bg-hover-color">
      <ReactFlow
        onNodeClick={(_, node) => {
          onSelectNode(node.data.name);
        }}
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
