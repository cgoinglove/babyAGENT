'use client';

import { useEffect, useMemo, useState } from 'react';
import ThreadSidebar from '@ui/components/thread-sidebar';

import ThreadDetail from '@ui/components/thread-detail';
import { safe } from 'ts-safe';
import WorkFlowVisual from '@ui/components/workflow-visual';
import { PromiseChain, wait } from '@shared/util';
import SelectBox from './components/shared/select-box';
import { NodeStructure, NodeThread, WorkflowStatus } from './api/workflow/create-workflow-apis';

const asyncChain = PromiseChain();

export default function WorkFlow() {
  const [index, setIndex] = useState(0);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>('ready');
  const [selectedThread, setSelectedThread] = useState<NodeThread | undefined>();
  const [threads, setThreads] = useState<NodeThread[]>([]);
  const [structures, setStructures] = useState<NodeStructure[]>([]);

  const [agents, setApis] = useState([]);

  const agentApi = useMemo(() => [][index]!, [index]);
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

  useEffect(() => {
    fetch('/api/workflow')
      .then((res) => res.json())
      .then(setApis);
  }, []);

  // useEffect(() => {
  //   init();
  // }, [agentApi]);
  if (!agents.length) return <div>waiy</div>;

  return (
    <div className="flex h-screen w-full">
      <ThreadSidebar
        isRunning={workflowStatus === 'running'}
        isLock={workflowStatus === 'stop'}
        start={start}
        stop={stop}
        title={agents[index].name}
        description={agents[index].description}
        resume={resume}
        threads={threads}
        onSelectThread={setSelectedThread}
        selectedThread={selectedThread}
      >
        <div className="border-b p-4 flex items-center flex-wrap gap-2">
          <div className=" flex items-center gap-1 text-sub-text mr-auto">
            <span className="text-default-text font-bold">babyAGENT</span> examples
          </div>

          <SelectBox items={agents.map((v, i) => ({ label: v.name, value: i }))} onChange={setIndex} value={index} />
        </div>
      </ThreadSidebar>
      <div className="flex-1 overflow-y-auto">
        {selectedThread ? (
          <ThreadDetail goBack={setSelectedThread.bind(null, undefined)} thread={selectedThread} />
        ) : (
          <WorkFlowVisual structures={structures} nodeStatusByName={nodeStatusByName} workflowStatus={workflowStatus} />
        )}
      </div>
    </div>
  );
}
