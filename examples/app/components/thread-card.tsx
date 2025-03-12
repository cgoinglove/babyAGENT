import { isNull } from '@shared/util';
import { NodeThread } from '@ui/actions/workflow/create-workflow-action';
import { Check, Pause, RefreshCw, X } from 'lucide-react';

interface Props {
  thread: NodeThread;

  onClick: () => void;
  isSelected: boolean;
  isLast: boolean;
}
export default function ThreadCard({ thread, onClick, isLast, isSelected }: Props) {
  return (
    <div className="animate-fade-in relative cursor-pointer py-2 px-3" onClick={onClick}>
      <div className={`${isLast ? 'h-1/2' : 'h-full'} absolute top-0 left-[34px] w-[2px] bg-sub-text/20 -z-10`} />
      <div
        className={`transition-all flex items-center gap-2 py-3 px-3 ring rounded-lg hover:bg-hover-color ${isSelected ? 'bg-hover-color' : 'bg-soft-background'}`}
      >
        <div className={`${thread.status == 'fail' ? 'ring-red-400/40' : ''} rounded-full ring p-1.5`}>
          <StatusIcon status={thread.status} />
        </div>
        <div className="flex-1 flex flex-col mx-1">
          <h2 className={`font-semibold ${thread.status == 'running' ? 'animate-pulse' : ''} `}>{thread.name}</h2>
          {/* {!isNull(thread.description) && <h2 className="text-xs text-sub-text mt-1">{thread.description}</h2>} */}
        </div>
        {thread.duration && <span className="text-xs text-sub-text">{thread.duration}s</span>}
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
