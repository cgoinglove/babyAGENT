'use client';
import React, { useEffect, useMemo, useRef } from 'react';

import { ReactFlow, useNodesState, useEdgesState, Node, Edge, ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomDefaultNode from './custom-flow-node/default';
import { FlowEdge, FlowNode, createFlow } from '@ui/helper/create-flow';

import { useAppStore } from '@ui/store';

const nodeTypes = {
  customDefault: CustomDefaultNode,
};

// Define custom fit view options to control zoom behavior
const fitViewOptions = {
  padding: 0.5, // Adds padding around nodes (0.5 = 50%)
  minZoom: 0.4, // Prevents excessive zooming in
  maxZoom: 1.2, // Prevents excessive zooming out
};

// Define default viewport for initial render
const defaultViewport = {
  x: 0,
  y: -50,
  zoom: 0.7, // Start at 70% zoom (zoomed out a bit)
};

export default function WorkFlowVisual() {
  const store = useAppStore();
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowNode>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<FlowEdge>>([]);

  // Track if we need to refit the view
  const shouldRefitRef = useRef(false);

  const nodeByName = useMemo(() => {
    const threads = store.histories
      .map((v) => v.threads)
      .flat()
      .concat(store.message.threads)
      .flat();
    return Object.fromEntries(
      threads.map((thread) => [
        thread.name,
        {
          status: thread.status,
          id: thread.id,
        },
      ])
    );
  }, [store.message, store.histories]);

  // Save the ReactFlow instance when it's initialized
  const onInit = (reactFlowInstance: ReactFlowInstance) => {
    reactFlowInstanceRef.current = reactFlowInstance;
  };

  // Update the flow when structures change
  useEffect(() => {
    const flow = createFlow(store.structures);
    setNodes(flow.nodes);
    setEdges(flow.edges);

    // Set flag to trigger a refit after nodes are updated
    shouldRefitRef.current = true;
  }, [store.structures]);

  // Refit the view after nodes are updated
  useEffect(() => {
    // Check if we have nodes and should refit
    if (nodes.length > 0 && shouldRefitRef.current && reactFlowInstanceRef.current) {
      // Short timeout to ensure nodes are fully rendered
      const timer = setTimeout(() => {
        if (reactFlowInstanceRef.current) {
          reactFlowInstanceRef.current.fitView(fitViewOptions);
          shouldRefitRef.current = false;
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [nodes]);

  useEffect(() => {
    const isDiff = (a: any, b: any) => {
      return a.status != b.status || a.masterStatus != b.masterStatus || a.id != b.id;
    };
    setNodes((nodes) => {
      return nodes.map((node) => {
        const prev = { status: node.data.status, masterStatus: node.data.masterStatus, id: node.data.id };
        const next = {
          status: nodeByName[node.data.name]?.status,
          masterStatus: store.workflowStatus,
          id: nodeByName[node.data.name]?.id,
        };
        if (isDiff(prev, next)) {
          return {
            ...node,
            data: { ...node.data, ...next },
          };
        }
        return node;
      });
    });
  }, [nodeByName, store.workflowStatus]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        onNodeClick={(_, node) => {
          if (node.data.id != node.data.name) {
            store.setSelectedThread(node.data.id);
          }
        }}
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={fitViewOptions}
        defaultViewport={defaultViewport}
        minZoom={0.4}
        maxZoom={1.5}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit as any}
      ></ReactFlow>
    </div>
  );
}
