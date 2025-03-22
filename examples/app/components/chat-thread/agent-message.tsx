'use client';

import { NodeThread } from '@ui/interface';
import ThreadTask from './thread-task';
import JsonView from '../shared/json-view';

export default function AgentMessage({
  message,
  threads,
}: {
  message: string;
  threads: NodeThread[];
  isRunning?: boolean;
}) {
  return (
    <div className="flex flex-col p-4 rounded-xl ring ring-sub-text animate-fade-in">
      <div className="text-xs font-semibold text-sub-text">AGENT</div>
      {threads.length > 0 && (
        <div className="w-full mt-4 h-full flex flex-col">
          {threads.map((thread) => (
            <ThreadTask key={thread.id} thread={thread} />
          ))}
        </div>
      )}
      {message && (
        <div className="text-default-text mb-2 my-4 px-2 animate-fade-in w-full">
          <JsonView data={message} />
        </div>
      )}
    </div>
  );
}
