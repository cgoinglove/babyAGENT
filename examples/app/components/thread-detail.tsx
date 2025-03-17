'use client';

import { NodeThread, WorkflowStatus } from '@ui/interface';
import clsx from 'clsx';
import { Clock, CheckCircle, XCircle, AlertCircle, Pause, ChevronLeft } from 'lucide-react';
import JsonView from './shared/json-view';
import { useEffect, useState } from 'react';

const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleString();
};

const getStatusIcon = (status: WorkflowStatus) => {
  switch (status) {
    case 'ready':
      return <Clock className="h-5 w-5 text-blue-500" />;
    case 'running':
      return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'fail':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'stop':
      return <Pause className="h-5 w-5 text-gray-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};

export default function ThreadDetail({ thread, goBack }: { thread: NodeThread; goBack: () => void }) {
  const [openTab, setOpenTab] = useState<'stream' | 'input' | 'output' | 'error' | undefined>('stream');

  const duration = thread.startedAt
    ? (((thread.endedAt ?? Date.now()) - thread.startedAt) / 1000).toFixed(0) + 's'
    : '';

  useEffect(() => {
    setOpenTab('stream');
  }, [thread.id]);

  return (
    <div className="w-full h-full bg-soft-background p-8 overflow-auto">
      <div className="mb-8" onClick={goBack}>
        <button className="px-3 py-2 rounded-full hover:bg-hover-color transition-colors cursor-pointer flex justify-center items-center">
          <ChevronLeft className="h-5 w-5 " />
          <h1 className="text-2xl ml-2 font-bold">{thread.name}</h1>
        </button>
      </div>

      {/* Thread information */}
      <div className="mb-8 bg-background p-4 rounded-xl ring">
        <div className="flex flex-row items-center justify-between px-4">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-sub-text">Status</p>
            <div className="flex items-center">
              {getStatusIcon(thread.status)}
              <span
                className={clsx('ml-2 font-semibold', {
                  'text-blue-600': thread.status === 'ready',
                  'text-yellow-600': thread.status === 'running',
                  'text-green-600': thread.status === 'success',
                  'text-red-600': thread.status === 'fail',
                  'text-gray-600': thread.status === 'stop',
                })}
              >
                {thread.status.charAt(0).toUpperCase() + thread.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-sub-text">Duration</p>
            <p className="font-medium">{duration}</p>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-sub-text">Started At</p>
            <p className="font-medium">{formatTimestamp(thread.startedAt)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <JsonView
            key={thread.streamText}
            data={thread.streamText}
            label="Stream"
            open={openTab == 'stream'}
            onClick={() => setOpenTab(openTab == 'stream' ? undefined : 'stream')}
          />
        </div>

        {thread.input && (
          <div>
            <JsonView
              data={thread.input}
              label="Input"
              open={openTab == 'input'}
              onClick={() => setOpenTab(openTab == 'input' ? undefined : 'input')}
            />
          </div>
        )}
        {thread.output && (
          <div>
            <JsonView
              data={thread.output}
              label="Output"
              open={openTab == 'output'}
              onClick={() => setOpenTab(openTab == 'output' ? undefined : 'output')}
            />
          </div>
        )}
        {thread.error && (
          <div>
            <JsonView
              data={thread.error}
              label="Error"
              open={openTab == 'error'}
              onClick={() => setOpenTab(openTab == 'error' ? undefined : 'error')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
