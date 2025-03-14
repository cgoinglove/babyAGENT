import { Handle, Node, Position, type NodeProps } from '@xyflow/react';

import clsx from 'clsx';
import { FlowNode } from '../helper/create-flow';
import { MousePointer2 } from 'lucide-react';

type Props = NodeProps<Node<FlowNode>>;

export default function CustomDefaultNode({ data, isConnectable }: Props) {
  return (
    <div className={clsx(data.status == 'running' && 'wobbling-square', 'relative')}>
      {data.isStartNode && (
        <div className="shadow-xl shadow-default-text/30 diagonal-arrow absolute flex left-[-125px] top-[-30px] bg-default-text text-soft-background px-4 py-2 rounded-full">
          <h2 className="font-bold text-xs">
            Start Here. 😉
            <div className="">
              <MousePointer2
                className=" fill-default-text stroke-default-text rotate-180 absolute right-[-4px] bottom-[-2px]"
                size={14}
              />
            </div>
          </h2>
        </div>
      )}

      {data.inEdgeCount ? (
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-gray-400" />
      ) : null}
      {data.outEdgeCount ? (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          className="w-2 h-2 bg-gray-400"
        />
      ) : null}

      <div
        className={clsx(
          data.status == 'fail'
            ? 'ring-red-400/40 bg-red-50'
            : data.status == 'running'
              ? 'bg-soft-background'
              : data.masterStatus == 'running'
                ? 'bg-background opacity-60'
                : 'bg-background',
          'hover:opacity-80 flex items-center justify-center rounded-3xl ring-16 shadow-lg w-[150px] h-[150px] transition-all'
        )}
      >
        <div className={clsx(data.status == 'fail' && 'text-red-400', 'w-ful font-semibold truncate text-center')}>
          {data.name}
        </div>
      </div>
    </div>
  );
}
