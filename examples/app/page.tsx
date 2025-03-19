'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ThreadDetail from '@ui/components/thread-detail';
import WorkFlowVisual from '@ui/components/workflow-visual';
import SelectBox from './components/shared/select-box';
import remarkGfm from 'remark-gfm';
import { Agent, ChatMessage, NodeThread, WorkflowStatus, WorkflowStreamData } from './interface';
import ThreadCard from './components/thread-card';
import { Send } from 'lucide-react';
import { streamReader } from './helper/stream';
import { GraphNodeStructure } from 'ts-edge';
import Markdown from 'react-markdown';

export default function WorkFlow() {
  const [agentIndex, setAgentIndex] = useState(0);
  const [agents, setAgents] = useState<(Omit<Agent, 'api'> & { structure: GraphNodeStructure[] })[]>([]);
  const selectedAgent = useMemo(() => agents[agentIndex], [agentIndex, agents]);

  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>('ready');
  const [selectedThread, setSelectedThread] = useState<NodeThread | undefined>(undefined);
  const [structures, setStructures] = useState<GraphNodeStructure[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [text, setText] = useState<string>('');

  const currentMessage = useMemo(() => messages.at(-1), [messages]);

  const nodeStatusByName = useMemo(() => {
    return Object.fromEntries(currentMessage?.threads.map((v) => [v.name, v.status]) ?? []);
  }, [currentMessage?.threads.map((v) => v.status).join()]);

  const stopAgent = useCallback(() => {
    return fetch(`/api/workflow/${selectedAgent.name}/stop`, {
      method: 'POST',
    });
  }, [selectedAgent]);

  const resumeAgent = useCallback(() => {
    return fetch(`/api/workflow/${selectedAgent.name}/resume`, {
      method: 'POST',
    });
  }, [selectedAgent]);

  const resetAgent = useCallback(() => {
    return fetch(`/api/workflow/${selectedAgent.name}/reset`, {
      method: 'POST',
    });
  }, [selectedAgent]);

  const sendMessage = () => {
    const prompt = text;
    setText('');
    setWorkflowStatus('running');

    setMessages((v) => [
      ...v,
      {
        prompt: { text: prompt },
        threads: [],
      },
    ]);
    return fetch(`/api/workflow/${selectedAgent.name}/start`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }).then(async (response) => {
      const reader = streamReader(response.body?.getReader());
      // for-await 루프를 사용하여 스트림 데이터 처리
      for await (const _ of reader) {
        const event = _ as WorkflowStreamData;

        // 이벤트 타입에 따른 처리
        if (event.type === 'WORKFLOW_END') {
          console.log('WORKFLOW_END');
          setWorkflowStatus('ready');
          setMessages((v) => {
            const messages = [...v];
            const currentMessage = messages.pop()!;
            currentMessage.answer = { text: event.output };
            return [...messages, currentMessage];
          });
          break; // 스트림 종료
        } else if (event.type === 'NODE_START') {
          console.log('NODE_START', event.name);
          setMessages((prev) => {
            const messages = [...prev];
            const currentMessage = messages.pop()!;
            const newThread: NodeThread = {
              id: event.id,
              status: 'running',
              input: event.input,
              name: event.name,
              startedAt: Date.now(),
              streamText: '',
            };
            console.log('push', JSON.stringify(currentMessage.threads));
            currentMessage.threads.push(newThread);
            return [...messages, currentMessage];
          });
        } else if (event.type === 'NODE_STREAM') {
          console.log('NODE_STREAM', event.name);
          setMessages((prev) => {
            const messages = [...prev];
            const currentMessage = messages.pop()!;
            const currentThread = currentMessage.threads!.find((v) => v.id === event.id)!;
            Object.assign(currentThread, {
              streamText: (currentThread.streamText ?? '') + event.chunk,
            });
            return [...messages, currentMessage];
          });
        } else if (event.type === 'NODE_END') {
          console.log('NODE_END', event.name);
          setMessages((prev) => {
            const messages = [...prev];
            const currentMessage = messages.pop()!;
            const currentThread = currentMessage.threads!.find((v) => v.id === event.id)!;
            Object.assign(currentThread, {
              status: event.isOk ? 'success' : 'fail',
              endedAt: Date.now(),
              output: event.output,
              error: event.isOk ? undefined : event.error,
            });
            return [...messages, currentMessage];
          });
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
    setText(selectedAgent.defaultPrompt ?? '');
    setStructures(selectedAgent.structure ?? []);
    setWorkflowStatus('ready');
    setMessages([]);
    setSelectedThread(undefined);
    resetAgent();
  }, [selectedAgent]);

  if (!selectedAgent) return null;

  return (
    <div className="flex h-screen w-full">
      <div className="w-full md:w-1/3 border-r h-screen flex flex-col">
        <div className="border-b p-4 flex items-center flex-wrap gap-2">
          <div className=" flex items-center gap-1 text-sub-text mr-auto">
            <span className="text-default-text font-bold">babyAGENT</span> examples
          </div>

          <SelectBox
            items={agents.map((v, i) => ({ label: v.name, value: i }))}
            onChange={setAgentIndex}
            value={agentIndex}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col h-full px-4 my-4">
            {messages.length ? (
              messages.map(({ prompt, threads, answer }, index) => {
                return (
                  <div key={index} className="mb-4">
                    <div className="text-sm font-semibold animate-fade-in-slow rounded-lg bg-hover-color px-6 py-2">
                      {prompt.text}
                    </div>
                    <div className="ring rounded-lg flex flex-col my-3 py-1">
                      {threads.map((thread, index) => (
                        <ThreadCard
                          key={`${thread.name}-${index}`}
                          thread={thread}
                          onClick={setSelectedThread.bind(null, thread === selectedThread ? undefined : thread)}
                          isSelected={thread === selectedThread}
                          isLast={index + 1 == threads.length}
                          isFirst={index == 0}
                        />
                      ))}
                    </div>
                    {answer && (
                      <div className="prose text-sm font-semibold animate-fade-in-slow rounded-lg ring text-sub-text  px-6 py-2">
                        <Markdown remarkPlugins={[remarkGfm]}>{answer.text}</Markdown>
                      </div>
                    )}
                  </div>
                );
              })
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
              const currentMessage = messages.at(-1);
              currentMessage?.threads
                .map((v, i) => ({ ...v, index: i }))
                .reverse()
                .find((thread) => {
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
