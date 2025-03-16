'use client';
import { PropsWithChildren, useEffect, useState } from 'react';
import { CirclePause, Play, Send } from 'lucide-react';
import { NodeThread } from '@ui/actions/workflow/create-workflow-action';
import ThreadCard from './thread-card';

interface Props {
  onSelectThread: (thread?: NodeThread) => void;
  selectedThread?: NodeThread;
  threads: NodeThread[];
  isRunning: boolean;
  isLock?: boolean;
  start(prompt: string);
  stop();
  resume();
  title: string;
  description: string;
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
  description,
  title,
  children,
}: PropsWithChildren<Props>) {
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
      {children}

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
            <div className="w-full h-full flex items-center justify-center flex-col px-12 animate-fade-in">
              <h4 className="font-bold text-5xl mb-4">{title}</h4>
              <h4 className="text-xl text-default-text/80">📌 {description}</h4>
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
            >
              {!isRunning ? <Send size={14} /> : isLock ? <Play size={14} /> : <CirclePause size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
