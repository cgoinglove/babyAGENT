'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ThreadDetail from '@ui/components/thread-detail';
import WorkFlowVisual from '@ui/components/workflow-visual';
import SelectBox from './components/shared/select-box';
import { Agent, ChatMessage, NodeThread, WorkflowStatus, WorkflowStreamData } from './interface';

import { Send } from 'lucide-react';
import { streamReader } from './helper/stream';
import { GraphNodeStructure } from 'ts-edge';
import ChatMessageView from './components/chat-message';
export default function WorkFlow() {
  const [agentIndex, setAgentIndex] = useState(0);
  const [agents, setAgents] = useState<(Omit<Agent, 'api'> & { structure: GraphNodeStructure[] })[]>([]);
  const selectedAgent = useMemo(() => agents[agentIndex], [agentIndex, agents]);

  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>('ready');
  const [selectedThread, setSelectedThread] = useState<NodeThread | undefined>(undefined);
  const [structures, setStructures] = useState<GraphNodeStructure[]>([]);
  const [text, setText] = useState('');

  const [histories, setHistories] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<ChatMessage & { running: boolean; id?: string }>({
    prompt: { text: '' },
    threads: [],
    answer: undefined,
    running: false,
  });

  const latestMessage = useRef<ChatMessage & { running: boolean }>(message);
  latestMessage.current = message;
  const nodeStatusByName = useMemo(() => {
    return Object.fromEntries(message.threads.map((v) => [v.name, v.status]));
  }, [message.threads.map((v) => v.status).join()]);

  const isRunning = useMemo(() => {
    return workflowStatus === 'running' || workflowStatus === 'stop';
  }, [workflowStatus]);

  // const stopAgent = useCallback(() => {
  //   return fetch(`/api/workflow/${selectedAgent.name}/stop`, {
  //     method: 'POST',
  //   });
  // }, [selectedAgent]);

  // const resumeAgent = useCallback(() => {
  //   return fetch(`/api/workflow/${selectedAgent.name}/resume`, {
  //     method: 'POST',
  //   });
  // }, [selectedAgent]);

  const resetAgent = useCallback(() => {
    return fetch(`/api/workflow/${selectedAgent.name}/reset`, {
      method: 'POST',
    });
  }, [selectedAgent]);

  const sendMessage = () => {
    if (text.trim() === '' && isRunning) return;
    setMessage((prev) => ({ ...prev, prompt: { text }, running: true }));
    setText('');
    setWorkflowStatus('running');
    return fetch(`/api/workflow/${selectedAgent.name}/start`, {
      method: 'POST',
      body: JSON.stringify({ prompt: text }),
    }).then(async (response) => {
      const reader = streamReader(response.body?.getReader());
      // for-await 루프를 사용하여 스트림 데이터 처리
      for await (const _ of reader) {
        const event = _ as WorkflowStreamData;
        // 이벤트 타입에 따른 처리
        if (event.type === 'WORKFLOW_END') {
          setWorkflowStatus(event.isOk ? 'success' : 'fail');
          setMessage((prevMessage) => {
            setHistories((prev) => [...prev, { ...prevMessage, answer: { text: event.output } }]);
            return {
              running: false,
              prompt: { text: '' },
              threads: [],
            };
          });
          break; // 스트림 종료
        } else if (event.type === 'NODE_START') {
          const newThread: NodeThread = {
            id: event.id,
            status: 'running',
            input: event.input,
            name: event.name,
            startedAt: Date.now(),
            streamText: '',
          };
          setMessage((prev) => ({
            ...prev,
            threads: [...prev.threads, newThread],
          }));
        } else if (event.type === 'NODE_STREAM') {
          setMessage((prev) => ({
            ...prev,
            threads: prev.threads.map((thread) => {
              if (thread.id === event.id) {
                return {
                  ...thread,
                  streamText: (thread.streamText ?? '') + event.chunk,
                };
              }
              return thread;
            }),
          }));
        } else if (event.type === 'NODE_END') {
          setMessage((prev) => ({
            ...prev,
            threads: prev.threads.map((thread) => {
              if (thread.id === event.id) {
                return {
                  ...thread,
                  status: event.isOk ? 'success' : 'fail',
                  endedAt: Date.now(),
                  output: event.output,
                  error: event.isOk ? undefined : event.error,
                };
              }
              return thread;
            }),
          }));
        }
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    fetch('/api/workflow')
      .then((res) => res.json())
      .then(setAgents);
  }, []);

  useEffect(() => {
    if (!selectedAgent) return;
    resetAgent();
    setMessage({
      prompt: { text: '' },
      threads: [],
      running: false,
    });
    setText(selectedAgent.defaultPrompt ?? '');
    setStructures(selectedAgent.structure ?? []);
    setWorkflowStatus('ready');
    setHistories([]);
    setSelectedThread(undefined);
  }, [selectedAgent]);

  if (!selectedAgent) return null;

  return (
    <div className="flex h-screen w-full">
      <div className="w-full md:w-2/5 border-r h-screen flex flex-col">
        <div className="border-b p-4 flex items-center flex-wrap gap-2">
          <div className=" flex items-center gap-1 text-sub-text mr-auto">
            <span className="text-default-text font-bold">babyAGENT</span> examples
          </div>

          <SelectBox
            disabled={isRunning}
            items={agents.map((v, i) => ({ label: v.name, value: i }))}
            onChange={setAgentIndex}
            value={agentIndex}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col h-full px-4 py-6 gap-6">
            {histories.length || message.running ? (
              <>
                {[...histories, message].map((message, index) => (
                  <ChatMessageView key={index} message={message} onClick={setSelectedThread} />
                ))}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col px-12 animate-fade-in">
                <h4 className="font-bold text-5xl mb-4">{selectedAgent.name}</h4>
                <h4 className="text-xl text-default-text/80">📌 {selectedAgent.description}</h4>
              </div>
            )}
          </div>
        </div>

        {/* Chat input area */}
        <div className="p-3 border-t">
          <div className="relative">
            <textarea
              disabled={isRunning}
              placeholder="Type a prompt..."
              className="disabled:text-sub-text disabled:bg-hover-color transition-all h-full resize-none ring w-full rounded p-3 focus:outline-none focus:ring-1 focus:ring-sub-text/60 bg-soft-background"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="absolute right-0 bottom-1.5">
              <button
                className="p-1.5 m-1 rounded-full hover:bg-hover-color flex items-center justify-center cursor-pointer"
                onClick={sendMessage}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {selectedThread ? (
          <ThreadDetail goBack={setSelectedThread.bind(null, undefined)} thread={selectedThread} />
        ) : (
          <WorkFlowVisual
            onSelectNode={(name) => {
              if (workflowStatus === 'ready') return;
              [...message.threads].reverse().find((thread) => {
                if (thread.name == name) {
                  setSelectedThread(thread);
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
