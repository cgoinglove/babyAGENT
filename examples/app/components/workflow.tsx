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
import NodeDetail from './node-detail';
import { safe } from 'ts-safe';
import { GraphStructure } from 'ts-edge';

export default function WorkFlow() {
  const [workflowStatus, setWorkflowStatus] = useState<'ready' | 'lock' | 'running'>('ready');
  const [selectedNode, setSelectedNode] = useState<NodeStatus | undefined>();
  const [histories, setHistories] = useState<NodeStatus[]>([]);
  const [, setStructure] = useState<GraphStructure>([]);

  const fetchFlow = useCallback(async () => {
    return safe()
      .map(reflectionAgentGetFlowAction)
      .effect((flow) => setHistories(flow.histories))
      .effect((flow) => setStructure(flow.structure))
      .effect((flow) => {
        if (flow.isRunning) setTimeout(() => fetchFlow(), 1000);
        if (workflowStatus != 'lock') setWorkflowStatus(flow.isRunning ? 'running' : 'ready');
      })
      .unwrap();
  }, []);
  const start = useCallback(
    (prompt: string) => {
      if (workflowStatus != 'ready') return;
      setWorkflowStatus('running');
      setHistories([]);
      setSelectedNode(undefined);
      reflectionAgentStartAction(prompt);
      fetchFlow();
    },
    [workflowStatus]
  );
  const resume = useCallback(() => {
    if (workflowStatus != 'lock') return;
    setWorkflowStatus('running');
    reflectionAgentResumeAction();
  }, [workflowStatus]);

  const stop = useCallback(() => {
    if (workflowStatus != 'running') return;
    setWorkflowStatus('lock');
    reflectionAgentStopAction();
  }, [workflowStatus]);

  useEffect(() => {
    fetchFlow();
  }, []);

  return (
    <div className="flex h-screen w-full">
      <ThreadSidebar
        isRunning={workflowStatus === 'running'}
        isLock={workflowStatus === 'lock'}
        start={start}
        stop={stop}
        resume={resume}
        nodes={histories}
        onSelectNode={setSelectedNode}
        selectedNode={selectedNode}
      />
      <div className="flex-1 overflow-y-auto">{selectedNode ? <NodeDetail node={selectedNode} /> : <></>}</div>
    </div>
  );
}
