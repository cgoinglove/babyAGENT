'use client';

import { useCallback, useEffect, useState } from 'react';
import ThreadSidebar from '@ui/components/thread-sidebar';
import { NodeStatus } from '@ui/actions/workflow/workflow-action';
import {
  reflectionAgentGetFlowAction,
  reflectionAgentResumeAction,
  reflectionAgentStartAction,
  reflectionAgentStopAction,
} from '@ui/actions/workflow/reflection.actions';
import { NodeDetail } from './node-detail';
import { safe } from 'ts-safe';
// import NodeDetail from "@ui/components/node-detail"

export default function WorkFlow() {
  const [workflowStatus, setWorkflowStatus] = useState<'ready' | 'lock' | 'running'>('ready');
  const [selectedNode, setSelectedNode] = useState<NodeStatus | undefined>();
  const [nodes, setNodes] = useState<NodeStatus[]>([]);

  const fetchFlow = useCallback(async () => {
    return safe()
      .map(reflectionAgentGetFlowAction)
      .effect((flow) => setNodes(flow.histories))
      .effect((flow) => flow.isRunning && setTimeout(() => fetchFlow(), 1000))
      .unwrap();
  }, []);
  const start = useCallback((prompt: string) => {
    if (workflowStatus != 'ready') return;
    setWorkflowStatus('running');
    setNodes([]);
    setSelectedNode(undefined);
    reflectionAgentStartAction(prompt);
    fetchFlow();
  }, []);
  const resume = useCallback(() => {
    reflectionAgentResumeAction();
  }, []);

  const stop = useCallback(() => {
    reflectionAgentStopAction();
  }, []);

  return (
    <div className="flex h-screen w-full">
      <ThreadSidebar
        isRunning={workflowStatus === 'running'}
        isLock={workflowStatus === 'lock'}
        start={start}
        stop={stop}
        resume={resume}
        nodes={nodes}
        onSelectNode={setSelectedNode}
        selectedNode={selectedNode}
      />
      <div>{selectedNode && <NodeDetail node={selectedNode} />}</div>
    </div>
  );
}
