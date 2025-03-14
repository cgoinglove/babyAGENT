'use client';
import React, { useEffect } from 'react';

import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NodeStructure, NodeThread } from '@ui/actions/workflow/create-workflow-action';
import CustomDefaultNode from './custom-flow-node/default';
import { createFlow, FlowEdge, FlowNode } from './helper/create-flow';

type NodeStatus = {
  status: NodeThread['status'];
  duration: NodeThread['duration'];
};

interface Props {
  structures: NodeStructure[];
  nodeStatusByName: Record<string, NodeStatus>;
  workflowStatus: NodeThread['status'];
}

const nodeTypes = {
  customDefault: CustomDefaultNode,
};

export default function WorkFlowVisual({ structures, nodeStatusByName, workflowStatus }: Props) {
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
        const prev = { duration: node.data.duration, status: node.data.status, masterStatus: node.data.masterStatus };
        const next = { ...nodeStatusByName[node.data.name], masterStatus: workflowStatus };
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
    <div className="w-full h-full">
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
