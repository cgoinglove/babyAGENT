'use client';

import { streamReader } from '@ui/helper/stream';
import { NodeThread, WorkflowStreamData } from '@ui/interface';
import { useAppStore } from '@ui/store';
import clsx from 'clsx';
import { ArrowUp, Pause } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GraphNodeStructure } from 'ts-edge';
import WorkFlowVisual from './workflow-visual';
type Props = {
  agents: {
    name: string;
    description: string;
    defaultPrompt: string;
    structure: GraphNodeStructure[];
  }[];
};

export default function LeftSide({ agents }: Props) {
  const [text, setText] = useState('');
  const [agentIndex, setAgentIndex] = useState(0);

  const selectedAgent = useMemo(() => agents[agentIndex], [agentIndex, agents]);

  const store = useAppStore();

  const isRunning = useMemo(() => {
    return store.workflowStatus === 'running' || store.workflowStatus === 'stop';
  }, [store.workflowStatus]);

  const resetAgent = useCallback(() => {
    store.setWorkflowStatus('ready');
    return fetch(`/api/workflow/${selectedAgent.name}/reset`, {
      method: 'POST',
    });
  }, [selectedAgent]);

  const sendMessage = () => {
    if (text.trim() === '' && isRunning) return;
    store.setMessage({ prompt: { text } });
    setText('');
    store.setWorkflowStatus('running');
    return fetch(`/api/workflow/${selectedAgent.name}/start`, {
      method: 'POST',
      body: JSON.stringify({ prompt: text }),
    }).then(async (response) => {
      const reader = streamReader(response.body?.getReader());
      for await (const _ of reader) {
        const event = _ as WorkflowStreamData;
        if (event.type === 'WORKFLOW_END') {
          const threads = store.current().message.threads;
          if (!event.isOk && threads.some((t) => t.status != 'fail')) {
            const lastThread = threads.at(-1)!;
            store.setMessage({
              ...store.current().message,
              threads: threads.map((t) => (t.id === lastThread.id ? { ...t, error: event.error, status: 'fail' } : t)),
            });
          }
          store.setWorkflowStatus(event.isOk ? 'success' : 'fail');
          store.addHistory({ ...store.current().message, answer: { text: event.output } });
          store.setMessage({
            prompt: { text: '' },
            threads: [],
          });
          break;
        } else if (event.type === 'NODE_START') {
          const newThread: NodeThread = {
            id: event.id,
            status: 'running',
            input: event.input,
            report: {},
            name: event.name,
            startedAt: Date.now(),
            streamText: '',
          };
          store.setMessage({
            ...store.current().message,
            threads: [...store.current().message.threads, newThread],
          });
        } else if (event.type === 'NODE_STREAM') {
          store.setMessage({
            ...store.current().message,
            threads: store.current().message.threads.map((thread) => {
              if (thread.id === event.id) {
                return {
                  ...thread,
                  streamText: thread.streamText + event.chunk,
                };
              }
              return thread;
            }),
          });
        } else if (event.type === 'NODE_END') {
          store.setMessage({
            ...store.current().message,
            threads: store.current().message.threads.map((thread) => {
              if (thread.id === event.id) {
                return {
                  ...thread,
                  status: event.isOk ? 'success' : 'fail',
                  endedAt: Date.now(),
                  output: event.output,
                  report: event.report,
                  error: event.isOk ? undefined : event.error,
                };
              }
              return thread;
            }),
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
    resetAgent();
    setText(selectedAgent.defaultPrompt ?? '');
    store.reset();
    store.setStructures(selectedAgent.structure);
  }, [agentIndex]);

  return (
    <div className="relative h-full flex flex-col ">
      <div className="border-b p-4 border-sub-text flex items-center flex-wrap gap-2 bg-background">
        <div className=" flex items-center gap-1 text-sub-text mr-auto">
          <span className="text-default-text font-bold">babyAGENT</span> examples
        </div>
      </div>

      <div className="flex-1 relative flex flex-col">
        <WorkFlowVisual />
        <div className="absolute bottom-0 right-0 w-[100px] h-[30px] bg-soft-background" />
      </div>

      <div className="px-4 bottom-0 left-0 w-full pt-2">
        <div className="ring rounded-3xl mb-4 p-4 bg-background ring-sub-text">
          <div className="flex gap-2 pl-1 ">
            <textarea
              contentEditable
              placeholder="어떤 도움이 필요하신가요?"
              className={clsx(
                'resize-none flex-1 focus:outline-none  focus:ring-sub-text/60',
                'scroll-pb-10 min-h-[24px] max-h-[calc(75dvh)] overflow-y-auto'
              )}
              rows={3}
              value={text}
              onChange={(e) => {
                setText(e.currentTarget.value);
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                handleKeyDown(e);
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.currentTarget.style.height = 'auto';
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                }
              }}
            />
            <div className="h-full">
              <button
                className="p-1.5 rounded-lg bg-default-text text-soft-background hover:bg-hover-color  cursor-pointer"
                onClick={isRunning ? resetAgent : sendMessage}
              >
                {isRunning ? <Pause size={14} className="fill-soft-background" /> : <ArrowUp size={14} />}
              </button>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            {agents.map((agent, index) => (
              <button
                key={index}
                disabled={isRunning}
                onClick={() => setAgentIndex(index)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  index === agentIndex
                    ? 'bg-default-text text-soft-background font-medium'
                    : 'bg-background ring hover:bg-hover-color'
                } ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {agent.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
