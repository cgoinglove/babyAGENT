'use client';
import { NodeThread } from '@ui/interface';
import { useAppStore } from '@ui/store';
import clsx from 'clsx';
import { LoaderCircle } from 'lucide-react';
import { useMemo } from 'react';

import JsonView from '../shared/json-view';
import { useShallow } from 'zustand/shallow';
export default function ThreadTask({ thread }: { thread: NodeThread }) {
  const [setSelectedThread, workflowStatus] = useAppStore(
    useShallow((state) => [state.setSelectedThread, state.workflowStatus])
  );

  const duration = useMemo(() => {
    if (!thread.startedAt || !thread.endedAt) return null;
    return Math.round((thread.endedAt - thread.startedAt) / 1000);
  }, [thread.startedAt, thread.endedAt]);

  return (
    <div
      className="w-full h-full rounded-lg hover:bg-sub-text/20 cursor-pointer px-4 py-2 animate-fade-in"
      onClick={setSelectedThread.bind(null, thread.id)}
    >
      <div className="flex items-center text-sm">
        <div
          className={clsx(
            thread.status === 'fail' ? 'bg-red-400' : thread.status === 'running' ? 'bg-blue-300' : 'bg-sub-text/40',
            'w-1.5 h-1.5 rounded-full mr-2'
          )}
        />
        <p
          className={clsx(
            thread.status === 'fail' && 'text-red-400',
            !duration && 'animate-pulse',
            'font-semibold mr-6'
          )}
        >
          {thread.name.toUpperCase()}
        </p>
        {thread.status === 'running' ? (
          <LoaderCircle size={16} className="animate-spin ml-auto" />
        ) : (
          <span className="ml-auto text-xs text-sub-text">
            {duration}
            {'s'}
          </span>
        )}
      </div>
      {thread.streamText && workflowStatus == 'running' && (
        <div className="text-xs! text-sub-text my-1 px-2 pors">
          <JsonView data={thread.streamText} />
        </div>
      )}
      {thread.status === 'fail' && (
        <div className="text-xs text-red-400 my-1 px-2">
          <JsonView
            data={{
              error: {
                name: thread.error.name,
                message: thread.error.message,
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
