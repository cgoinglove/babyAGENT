import { NodeThread } from '@ui/actions/workflow/create-workflow-action';
import clsx from 'clsx';
import { Check, Pause, RefreshCw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Props {
  thread: NodeThread;
  onClick: () => void;
  isSelected: boolean;
  isLast: boolean;
}
const calcDuration = (a?: number, b?: number) => (a ? (((b || Date.now()) - a) / 1000).toFixed(2) : undefined);

export default function ThreadCard({ thread, onClick, isLast, isSelected }: Props) {
  const [duration, setDuration] = useState<string>();

  const latestRef = useRef({ s: thread.startedAt, e: thread.endedAt });
  latestRef.current = { s: thread.startedAt, e: thread.endedAt };

  useEffect(() => {
    if (!thread.startedAt) return;
    if (thread.endedAt) {
      setDuration(calcDuration(thread.startedAt, thread.endedAt));
    }

    const key = setInterval(() => {
      setDuration(calcDuration(latestRef.current.s, latestRef.current.e));
    }, 200);
    return () => clearInterval(key);
  }, [thread.startedAt, thread.endedAt]);

  return (
    <div className="animate-fade-in relative cursor-pointer py-2 px-3" onClick={onClick}>
      <div
        className={clsx(
          isLast ? 'h-1/2' : 'h-full',

          'absolute top-0 left-[34px] w-[2px] bg-sub-text/20 -z-10'
        )}
      />
      <div
        className={clsx(
          thread.status == 'fail' && 'ring-red-400/60',
          thread.status == 'running' && 'ring-sub-text',
          isSelected ? 'bg-hover-color' : 'bg-soft-background',
          'transition-all flex items-center gap-2 py-3 px-3 ring rounded-lg hover:bg-hover-color'
        )}
      >
        <div
          className={clsx(
            thread.status == 'running' && 'ring-sub-text animate-pulse',
            thread.status == 'fail' && 'ring-red-400/60',
            'rounded-full ring p-1.5'
          )}
        >
          <StatusIcon status={thread.status} />
        </div>
        <div className="flex-1 flex flex-col mx-1">
          <h2
            className={clsx(
              thread.status == 'fail' && 'text-red-400',
              thread.status == 'running' && 'animate-pulse',
              'font-semibold'
            )}
          >
            {thread.name}
          </h2>
        </div>
        {duration && (
          <span className={clsx(thread.status == 'fail' ? 'text-red-400' : 'text-sub-text', 'text-xs ')}>
            {duration}s
          </span>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: NodeThread['status'] }) {
  switch (status) {
    case 'running':
      return <RefreshCw className="animate-spin h-2.5 w-2.5" />;
    case 'success':
      return <Check className="h-2.5 w-2.5 stroke-3 stroke-sub-text/60" />;
    case 'fail':
      return <X className="h-2.5 w-2.5 stroke-3 stroke-red-400/60" />;
    case 'stop':
      return <Pause className="h-2.5 w-2.5 stroke-sub-text/60" />;
    default:
      return null;
  }
}
