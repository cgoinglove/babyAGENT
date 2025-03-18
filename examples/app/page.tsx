'use client';

import { useEffect, useMemo, useState } from 'react';

import ThreadDetail from '@ui/components/thread-detail';

import WorkFlowVisual from '@ui/components/workflow-visual';

import SelectBox from './components/shared/select-box';

import { Agent, NodeThread, WorkflowStatus, WorkflowStreamData } from './interface';
import ThreadCard from './components/thread-card';
import { Send } from 'lucide-react';
import { streamReader } from './helper/stream';
import { GraphNodeStructure } from 'ts-edge';
export default function WorkFlow() {
  const [index, setIndex] = useState(0);
  const [agents, setAgents] = useState<(Omit<Agent, 'api'> & { structure: GraphNodeStructure[] })[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>('ready');
  const [selectedThread, setSelectedThread] = useState<number | undefined>(undefined);
  const [threads, setThreads] = useState<NodeThread[]>([]);
  const [structures, setStructures] = useState<GraphNodeStructure[]>([]);
  const [text, setText] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');

  const nodeStatusByName = useMemo(() => {
    return Object.fromEntries(threads.map((v) => [v.name, v.status]));
  }, [threads]);
// 시작해야함
  const agent = useMemo(() => agents[index], [index, agents]);

  const api = useMemo(() => {
    if (!agent) return;

    return {
      stop() {
        return fetch(`/api/workflow/${agent.name}/stop`, {
          method: 'POST',
        });
      },
      resume() {
        return fetch(`/api/workflow/${agent.name}/resume`, {
          method: 'POST',
        });
      },
      reset() {
        return fetch(`/api/workflow/${agent.name}/reset`, {
          method: 'POST',
        });
      },
      start(prompt: string) {
        setThreads([]);
        setText('');
        setPrompt(prompt);
        setAnswer('');
        return fetch(`/api/workflow/${agent.name}/start`, {
          method: 'POST',
          body: JSON.stringify({ prompt }),
        }).then(async (response) => {
          const reader = streamReader(response.body?.getReader());

          // for-await 루프를 사용하여 스트림 데이터 처리
          for await (const _ of reader) {
            const event = _ as WorkflowStreamData;

            // 이벤트 타입에 따른 처리
            if (event.type === 'WORKFLOW_START') {
              setWorkflowStatus('running');
            } else if (event.type === 'WORKFLOW_END') {
              setWorkflowStatus('ready');
              setAnswer(event.output);
              break; // 스트림 종료
            } else if (event.type === 'NODE_START') {
              setThreads((v) => [
                ...v,
                {
                  id: event.id,
                  status: 'running',
                  input: event.input,
                  name: event.name,
                  startedAt: Date.now(),
                  streamText: '',
                },
              ]);
            } else if (event.type === 'NODE_STREAM') {
              setThreads((v) => {
                const thread = v.find((v) => v.id === event.id);
                if (!thread) return v;
                return v.map((v) => (v.id === event.id ? { ...v, streamText: (v.streamText ?? '') + event.chunk } : v));
              });
            } else if (event.type === 'NODE_END') {
              setThreads((v) => {
                const thread = v.find((v) => v.id === event.id);
                if (!thread) return v;
                return v.map((v) =>
                  v.id === event.id
                    ? {
                        ...v,
                        status: event.isOk ? 'success' : 'fail',
                        endedAt: Date.now(),
                        output: event.output,
                        error: event.isOk ? undefined : event.error,
                      }
                    : v
                );
              });
            }
          }
        });
      },
    };
  }, [agent]);

  const handleSendMessage = () => {
    if (text.trim()) {
      api?.start(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    fetch('/api/workflow')
      .then((res) => res.json())
      .then(setAgents);
  }, []);

  useEffect(() => {
    if (!agent) return;
    setText(agent.defaultPrompt ?? '');
    setStructures(agent.structure ?? []);
    setWorkflowStatus('ready');
    setThreads([]);
    setPrompt('');
    setAnswer('');
    setSelectedThread(undefined);
  }, [agent]);

  useEffect(() => {
    if (!api) return;
    api.reset();
  }, [api]);

  if (!agent) return null;

  return (
    <div className="flex h-screen w-full">
      <div className="w-full md:w-1/3 border-r h-screen flex flex-col">
        <div className="border-b p-4 flex items-center flex-wrap gap-2">
          <div className=" flex items-center gap-1 text-sub-text mr-auto">
            <span className="text-default-text font-bold">babyAGENT</span> examples
          </div>

          <SelectBox items={agents.map((v, i) => ({ label: v.name, value: i }))} onChange={setIndex} value={index} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col h-full px-4 my-4">
            {threads.length || prompt ? (
              <>
                <div className="text-sm font-semibold animate-fade-in-slow rounded-lg bg-hover-color px-6 py-2">
                  {prompt}
                </div>
                <div className="ring rounded-lg flex flex-col my-3 py-1">
                  {threads.map((thread, index) => (
                    <ThreadCard
                      key={`${thread.name}-${index}`}
                      thread={thread}
                      onClick={setSelectedThread.bind(null, index === selectedThread ? undefined : index)}
                      isSelected={index === selectedThread}
                      isLast={index + 1 == threads.length}
                      isFirst={index == 0}
                    />
                  ))}
                </div>
                {answer && (
                  <div className="text-sm font-semibold animate-fade-in-slow rounded-lg ring text-sub-text  px-6 py-2">
                    {answer}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col px-12 animate-fade-in">
                <h4 className="font-bold text-5xl mb-4">{agent.name}</h4>
                <h4 className="text-xl text-default-text/80">📌 {agent.description}</h4>
              </div>
            )}
          </div>
        </div>

        {/* Chat input area */}
        <div className="p-3 border-t">
          <div className="relative">
            <textarea
              disabled={workflowStatus === 'running' || workflowStatus === 'stop'}
              placeholder="Type a prompt..."
              className="disabled:text-sub-text disabled:bg-hover-color transition-all h-full resize-none ring w-full rounded p-3 focus:outline-none focus:ring-1 focus:ring-sub-text/60 bg-soft-background"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="absolute right-0 bottom-1.5">
              <button
                className="p-1.5 m-1 rounded-full hover:bg-hover-color flex items-center justify-center cursor-pointer"
                onClick={handleSendMessage}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {threads[selectedThread!] ? (
          <ThreadDetail goBack={setSelectedThread.bind(null, undefined)} thread={threads[selectedThread!]} />
        ) : (
          <WorkFlowVisual
            onSelectNode={(name) => {
              threads
                .map((v, i) => ({ ...v, index: i }))
                .reverse()
                .find((thread) => {
                  if (thread.name == name) {
                    setSelectedThread(thread.index);
                    return true;
                  }
                });
            }}
            structures={structures}
            nodeStatusByName={nodeStatusByName}
            workflowStatus={workflowStatus}
          />
        )}
      </div>
    </div>
  );
}
