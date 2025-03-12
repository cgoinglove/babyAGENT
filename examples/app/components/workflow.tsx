'use client';

import { useCallback, useEffect, useState } from 'react';
import ThreadSidebar from '@ui/components/thread-sidebar';
import { NodeStructure, NodeThread, WorkflowStatus } from '@ui/actions/workflow/create-workflow-action';
import {
  reflectionAgentGetFlowAction,
  reflectionAgentResumeAction,
  reflectionAgentStartAction,
  reflectionAgentStopAction,
} from '@ui/actions/workflow/reflection.actions';
import NodeDetail from './thread-detail';
import { safe } from 'ts-safe';
import WorkFlowVisual from './workflow-visual';
import { PromiseChain, wait } from '@shared/util';

const pchain = PromiseChain();

export default function WorkFlow() {
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>('ready');
  const [selectedThread, setSelectedThread] = useState<NodeThread | undefined>();
  const [threads, setThreads] = useState<NodeThread[]>([]);
  const [structures, setStructures] = useState<NodeStructure[]>([]);

  const fetchFlow = useCallback(async () => {
    return safe()
      .map(reflectionAgentGetFlowAction)
      .effect((flow) => {
        if (flow.workflowStatus != 'ready') setThreads(flow.threads);
      })
      .effect((flow) => setStructures(flow.nodeStructures))
      .effect((flow) => setWorkflowStatus(flow.workflowStatus))
      .effect((flow) => {
        if (flow.workflowStatus == 'running') {
          pchain(() => wait(1000).then(fetchFlow)); // 폴링
        }
      })
      .unwrap();
  }, []);
  const start = useCallback(
    (prompt: string) => {
      if (workflowStatus != 'ready') return;
      setWorkflowStatus('running');
      setThreads([]);
      setSelectedThread(undefined);
      reflectionAgentStartAction(prompt);
      fetchFlow();
    },
    [workflowStatus]
  );
  const resume = useCallback(() => {
    if (workflowStatus != 'stop') return;
    fetchFlow();
    reflectionAgentResumeAction();
  }, [workflowStatus]);

  const stop = useCallback(() => {
    if (workflowStatus != 'running') return;
    reflectionAgentStopAction();
  }, [workflowStatus]);

  useEffect(() => {
    fetchFlow();
  }, []);

  return (
    <div className="flex h-screen w-full">
      <ThreadSidebar
        isRunning={workflowStatus === 'running'}
        isLock={workflowStatus === 'stop'}
        start={start}
        stop={stop}
        resume={resume}
        threads={threads}
        onSelectThread={setSelectedThread}
        selectedThread={selectedThread}
      />
      <div className="flex-1 overflow-y-auto">
        {selectedThread ? (
          <NodeDetail thread={selectedThread} />
        ) : structures.length ? (
          <WorkFlowVisual structures={structures} />
        ) : null}
      </div>
    </div>
  );
}
