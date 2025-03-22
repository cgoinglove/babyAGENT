'use client';

import { WorkflowStatus } from '@ui/interface';
import clsx from 'clsx';
import { Clock, CheckCircle, XCircle, AlertCircle, Pause, ChevronLeft } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useShallow } from 'zustand/shallow';
import { useAppStore } from '@ui/store';
import ReportItem from './chat-thread/report-item';

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

export default function ThreadDetail() {
  const [selectedThread, threads, histories, setSelectedThread] = useAppStore(
    useShallow((state) => [state.selectedThread, state.message.threads, state.histories, state.setSelectedThread])
  );

  const thread = useMemo(() => {
    return (
      threads.find((t) => t.id == selectedThread) ??
      histories
        .map((v) => v.threads)
        .flat()
        .find((t) => t.id == selectedThread)!
    );
  }, [selectedThread, threads, histories]);

  const [tick, setTick] = useState(0);

  const duration = useMemo(() => {
    return thread.startedAt ? (((thread.endedAt ?? Date.now()) - thread.startedAt) / 1000).toFixed(0) + 's' : '';
  }, [tick]);

  useEffect(() => {
    if (thread.status == 'running') {
      const interval = setInterval(() => {
        setTick((t) => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [thread]);

  return (
    <div className="w-full h-full  p-8 overflow-auto">
      <div className="mb-8" onClick={setSelectedThread.bind(null, undefined)}>
        <button className="px-3 py-2 rounded-full hover:bg-hover-color transition-colors cursor-pointer flex justify-center items-center">
          <ChevronLeft className="h-5 w-5 " />
          <h1 className="text-2xl mx-2 font-bold">{thread.name}</h1>
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
        {Object.entries(thread.report).map(([key, value]) => (
          <ReportItem key={key} label={key} data={value} />
        ))}

        {thread.error && (
          <div>
            <ReportItem label="Error" data={thread.error} />
          </div>
        )}
      </div>
    </div>
  );
}
