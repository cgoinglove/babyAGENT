'use client';
import { useState } from 'react';
import { CirclePause, Play, Send } from 'lucide-react';
import { NodeStatus } from '@ui/actions/workflow/workflow-action';
import NodeCard from './node-card';

interface Props {
  onSelectNode: (node: NodeStatus) => void;
  selectedNode?: NodeStatus;
  nodes: NodeStatus[];
  isRunning: boolean;
  isLock?: boolean;
  start(prompt: string);
  stop();
  resume();
}

export default function ThreadSidebar({
  isRunning,
  isLock,
  resume,
  start,
  stop,
  selectedNode,
  onSelectNode,
  nodes,
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

  return (
    <div className="w-full md:w-1/3 border-r h-screen flex flex-col">
      <div className="border-b p-4">
        <div className=" flex items-center gap-1 text-sub-text">
          <span className="text-default-text font-bold">babyAGENT</span> examples
        </div>
      </div>

      <div className="flex-1">
        <div className="p-2">
          {nodes.map((node, index) => (
            <NodeCard
              key={`${node.name}-${index}`}
              node={node}
              title={node.name}
              onClick={onSelectNode.bind(null, node)}
              isSelected={node === selectedNode}
            />
          ))}
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
