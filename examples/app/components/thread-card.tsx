'use client';
import { NodeThread } from '@ui/interface';
import clsx from 'clsx';
import { useRef } from 'react';

interface Props {
  thread: NodeThread;
  onClick: () => void;
  isSelected: boolean;
  isLast: boolean;
  isFirst: boolean;
}
const calcDuration = (a?: number, b?: number) => (a ? (((b || Date.now()) - a) / 1000).toFixed(0) : undefined);

export default function ThreadCard({ isFirst, thread, onClick, isLast, isSelected }: Props) {
  const duration = calcDuration(thread.startedAt, thread.endedAt);

  const latestRef = useRef({ s: thread.startedAt, e: thread.endedAt });
  latestRef.current = { s: thread.startedAt, e: thread.endedAt };

  return (
    <>
      <div
        className={clsx(
          thread.status == 'fail' ? 'text-red-400' : 'text-sub-text',
          'animate-fade-in-slow relative cursor-pointer px-3 text-xs'
        )}
        onClick={onClick}
      >
        <div
          className={clsx(
            isLast || isFirst ? 'h-1/2' : 'h-full',
            isFirst && 'top-1/2',
            'absolute top-0 left-[27.5px] w-[1px] bg-zinc-200'
          )}
        />
        <div
          className={clsx(
            isSelected && 'bg-hover-color',
            'transition-all flex gap-2 py-1 my-0.5 px-2 rounded-lg hover:bg-hover-color'
          )}
        >
          <div
            className={clsx(thread.status == 'running' && 'bg-default-text/20 ring', 'rounded-full p-1 relative z-10')}
          >
            <div
              className={clsx(
                thread.status == 'running' ? 'bg-default-text' : 'bg-zinc-200',
                'w-2 ring-3 ring-default-text/20 h-2 rounded-full'
              )}
            />
            {thread.status == 'running' && (
              <div className="absolute top-0 left-0 w-full h-full bg-default-text rounded-full animate-ping" />
            )}
          </div>
          <div className="flex-1 flex flex-col mx-1">
            <h2
              className={clsx(
                thread.status == 'running' && 'text-default-text',
                thread.status == 'running' && 'animate-pulse',
                'font-semibold'
              )}
            >
              {thread.name}
            </h2>
          </div>
          {duration && <span className={clsx('text-[10px]')}>{duration}s</span>}
        </div>
      </div>
      {thread.status == 'running' && thread.streamText && (
        <p className="px-12 text-[10px] text-sub-text overflow-hidden line-clamp-2 mb-2">
          {thread.streamText.slice(-120).trim()}
        </p>
      )}
    </>
  );
}
