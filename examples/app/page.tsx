'use client';

import { useEffect, useMemo, useState } from 'react';
import ThreadSidebar from '@ui/components/thread-sidebar';
import { NodeStructure, NodeThread, WorkflowStatus } from '@ui/actions/workflow/create-workflow-action';

import ThreadDetail from '@ui/components/thread-detail';
import { safe } from 'ts-safe';
import WorkFlowVisual from '@ui/components/workflow-visual';
import { PromiseChain, wait } from '@shared/util';
import { api } from './api/client';

const asyncChain = PromiseChain();

const agents = api.agents;

const agentsInfo = agents.map((v) => ({
  name: v.name,
  description: v.description,
}));

export default function WorkFlow() {
  const [index, setIndex] = useState(0);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>('ready');
  const [selectedThread, setSelectedThread] = useState<NodeThread | undefined>();
  const [threads, setThreads] = useState<NodeThread[]>([]);
  const [structures, setStructures] = useState<NodeStructure[]>([]);

  const agentApi = useMemo(() => agents[index]!, [index]);
  const fetchStatus = async () => {
    return safe()
      .map(agentApi.fetchStatusAction)
      .effect((flow) => {
        if (flow.workflowStatus != 'ready') setThreads(flow.threads);
      })
      .effect((flow) => setWorkflowStatus(flow.workflowStatus))
      .effect((flow) => {
        if (flow.workflowStatus == 'running') {
          asyncChain(() => wait(1000).then(fetchStatus)); // 폴링
        }
      })
      .unwrap();
  };

  const nodeStatusByName = useMemo(() => {
    return [...threads].reverse().reduce(
      (prev, thread) => {
        if (!prev[thread.name]) {
          prev[thread.name] = {
            duration: thread.duration,
            status: thread.status,
          };
        }
        return prev;
      },
      {} as Record<
        string,
        {
          status: NodeThread['status'];
          duration: NodeThread['duration'];
        }
      >
    );
  }, [threads]);

  const fetchStructures = async () => {
    const response = await agentApi.fetchStructureAction();
    setStructures(response);
  };

  const start = async (prompt: string) => {
    await init();
    setWorkflowStatus('running');
    setThreads([]);
    setSelectedThread(undefined);
    agentApi.startAction(prompt);
    fetchStatus();
  };
  const resume = () => {
    if (workflowStatus != 'stop') return;
    fetchStatus();
    agentApi.resumeAction();
  };

  const stop = () => {
    if (workflowStatus != 'running') return;
    agentApi.stopAction();
  };

  const init = async () => {
    await agentApi.resetAction();
    fetchStatus();
    fetchStructures();
  };

  useEffect(() => {
    init();
  }, [agentApi]);

  return (
    <div className="flex h-screen w-full">
      <ThreadSidebar
        isRunning={workflowStatus === 'running'}
        isLock={workflowStatus === 'stop'}
        start={start}
        stop={stop}
        title={agentsInfo[index].name}
        description={agentsInfo[index].description}
        resume={resume}
        threads={threads}
        onSelectThread={setSelectedThread}
        selectedThread={selectedThread}
        onChangeIndex={setIndex}
        curreuntIndex={index}
        agents={agentsInfo}
      />
      <div className="flex-1 overflow-y-auto">
        {selectedThread ? (
          <ThreadDetail goBack={setSelectedThread.bind(null, undefined)} thread={selectedThread} />
        ) : structures.length ? (
          <WorkFlowVisual structures={structures} nodeStatusByName={nodeStatusByName} workflowStatus={workflowStatus} />
        ) : null}
      </div>
    </div>
  );
}
