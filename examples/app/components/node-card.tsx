import { NodeStatus } from '@ui/actions/workflow/workflow-action';
import { Check, Pause, RefreshCw, X } from 'lucide-react';

interface Props {
  node: NodeStatus;
  title: string;
  onClick: () => void;
  isSelected: boolean;
  isLast: boolean;
}
export default function NodeCard({ node, title, onClick, isLast, isSelected }: Props) {
  const duration = node.startedAt && node.endedAt ? ((node.endedAt - node.startedAt) / 1000).toFixed(2) : null;
  return (
    <div className="animate-fade-in relative cursor-pointer py-2 px-3" onClick={onClick}>
      <div className={`${isLast ? 'h-1/2' : 'h-full'} absolute top-0 left-[34px] w-[2px] bg-sub-text/20 -z-10`} />
      <div
        className={`transition-all flex items-center gap-2 py-3 px-3 ring rounded-lg hover:bg-hover-color ${isSelected ? 'bg-hover-color' : 'bg-soft-background'}`}
      >
        <div className={`${node.status == 'fail' ? 'ring-red-400/40' : ''} rounded-full ring p-1.5`}>
          <StatusIcon status={node.status} />
        </div>
        <div className="flex-1 flex flex-col mx-1">
          <h2 className={`font-semibold ${node.status == 'running' ? 'animate-pulse' : ''} `}>{title}</h2>
          {title == 'reasoning' ? <h2 className="text-xs text-sub-text mt-1">descriptions...</h2> : null}
        </div>
        {duration && <span className="text-xs text-sub-text">{duration}s</span>}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: NodeStatus['status'] }) {
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
