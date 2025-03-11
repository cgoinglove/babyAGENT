import { NodeStatus } from '@ui/actions/workflow/workflow-action';
import { Clock, Play, Square, Terminal, X } from 'lucide-react';

interface Props {
  node: NodeStatus;
  title: string;
  onClick: () => void;
  isSelected: boolean;
}
export default function NodeCard({ node, title, onClick, isSelected }: Props) {
  const duration = node.startedAt && node.endedAt ? ((node.endedAt - node.startedAt) / 1000).toFixed(2) : null;

  return (
    <div
      className={`flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded-md cursor-pointer ${isSelected ? 'bg-muted' : ''}`}
      onClick={onClick}
    >
      <StatusIcon status={node.status} />
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{title}</span>
          {duration && <span className="text-xs text-muted-foreground">{duration}s</span>}
        </div>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: NodeStatus['status'] }) {
  switch (status) {
    case 'ready':
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    case 'running':
      return <Play className="h-4 w-4 text-blue-500" />;
    case 'success':
      return <Terminal className="h-4 w-4 text-green-500" />;
    case 'fail':
      return <X className="h-4 w-4 text-red-500" />;
    case 'stop':
      return <Square className="h-4 w-4 text-orange-500" />;
    default:
      return null;
  }
}
