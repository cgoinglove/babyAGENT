import { Handle, Node, Position, type NodeProps } from '@xyflow/react';
import { GitMerge, Flag } from 'lucide-react';
import { NodeStructure } from '@ui/actions/workflow/create-workflow-action';
import clsx from 'clsx';

type Props = NodeProps<Node<NodeStructure>>;

export default function CustomDefaultNode({ data, isConnectable }: Props) {
  return (
    <div
      className={clsx(
        'px-4 py-3 rounded-lg border shadow-sm bg-white dark:bg-slate-800 w-[220px]',
        data.isMergeNode && 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-slate-800',
        data.status === 'fail' && 'border-red-300 dark:border-red-700',
        data.status === 'running' && 'border-blue-300 dark:border-blue-700 animate-pulse'
      )}
    >
      {/* Handles for connections */}
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-gray-400" />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-gray-400" />

      <div className="flex items-center gap-2">
        {data.isStartNode && <Flag className="h-4 w-4 text-green-500" />}
        {data.isMergeNode && <GitMerge className="h-4 w-4 text-indigo-500" />}
        <div className="flex-1 font-medium truncate">{data.name}</div>
        {/* <div>{getStatusIcon()}</div> */}
      </div>

      {data.metadata.description && (data.status === 'fail' || data.status === 'running') && (
        <div
          className={clsx(
            'mt-2 text-xs p-2 rounded',
            data.status === 'fail'
              ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
              : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          )}
        >
          {data.metadata.description}
        </div>
      )}

      {data.edge && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span className="font-medium">Edge:</span>
            <span>{data.edge.type}</span>
          </div>
          {data.edge.name.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {data.edge.name.map((name, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {data.toMergeNode && (
        <div className="mt-2 flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
          <GitMerge className="h-3 w-3" />
          <span>Connects to merge node</span>
        </div>
      )}
    </div>
  );
}
