'use client';
import { useEffect, useState } from 'react';
import { CirclePause, Play, Send } from 'lucide-react';
import { NodeThread } from '@ui/actions/workflow/create-workflow-action';
import ThreadCard from './thread-card';
import SelectBox from './shared/select-box';

interface Props {
  onSelectThread: (thread?: NodeThread) => void;
  selectedThread?: NodeThread;
  threads: NodeThread[];
  isRunning: boolean;
  isLock?: boolean;
  start(prompt: string);
  stop();
  resume();
  onChangeIndex(index: number);
  agents: { name: string; description?: string }[];
  curreuntIndex: number;
}

export default function ThreadSidebar({
  isRunning,
  isLock,
  resume,
  start,
  stop,
  selectedThread,
  onSelectThread,
  threads,
  agents,
  onChangeIndex,
  curreuntIndex,
}: Props) {
  const [prompt, setPrompt] = useState('');

  const handleSendMessage = () => {
    if (prompt.trim()) {
      start(prompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    return () => {
      if (isRunning) {
        setPrompt('');
      }
    };
  }, [isRunning]);

  return (
    <div className="w-full md:w-1/3 border-r h-screen flex flex-col">
      <div className="border-b p-4 flex items-center">
        <div className=" flex items-center gap-1 text-sub-text mr-auto">
          <span className="text-default-text font-bold">babyAGENT</span> examples
        </div>
        <SelectBox
          items={agents.map((v, i) => ({ label: v.name, value: i }))}
          onChange={onChangeIndex}
          value={curreuntIndex}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col h-full">
          {threads.length ? (
            threads.map((thread, index) => (
              <ThreadCard
                key={`${thread.name}-${index}`}
                thread={thread}
                onClick={onSelectThread.bind(null, thread === selectedThread ? undefined : thread)}
                isSelected={thread === selectedThread}
                isLast={index + 1 == threads.length}
              />
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <h4 className="font-bold text-5xl animate-fade-in-slow">Try Example</h4>
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
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-0 bottom-1.5">
            <button
              className="p-1.5 m-1 rounded-full hover:bg-hover-color flex items-center justify-center cursor-pointer"
              onClick={!isRunning ? handleSendMessage : isLock ? resume : stop}
              disabled={!prompt.trim()}
            >
              {!isRunning ? <Send size={14} /> : isLock ? <Play size={14} /> : <CirclePause size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
