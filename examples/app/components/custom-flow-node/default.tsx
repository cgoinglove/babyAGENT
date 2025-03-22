'use client';
import { Handle, Node, Position, type NodeProps } from '@xyflow/react';

import clsx from 'clsx';
import { FlowNode } from '@ui/helper/create-flow';
import { MousePointer2 } from 'lucide-react';
import { memo } from 'react';

type Props = NodeProps<Node<FlowNode>>;

export default memo(function CustomDefaultNode({ data, isConnectable }: Props) {
  return (
    <div className={clsx(data.status == 'running' && 'wobbling-square', 'relative')}>
      {data.level == 0 && (
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
      {!data.edge && (
        <div className="absolute flex left-0 bottom-[-45px] w-full justify-center">
          <h2 className="shadow-xl shadow-default-text/30 bg-default-text text-soft-background px-4 py-2 rounded-full font-bold text-xs text-center">
            End Point
          </h2>
        </div>
      )}

      <Handle id="top" type="target" position={Position.Top} isConnectable={isConnectable} className="opacity-0" />

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={isConnectable}
        className="opacity-0"
      />

      <Handle type="source" position={Position.Left} id="left" className="opacity-0" />
      <Handle type="target" position={Position.Left} id="left" className="opacity-0" />
      <Handle type="source" position={Position.Right} id="right" className="opacity-0" />
      <Handle type="target" position={Position.Right} id="right" className="opacity-0" />

      <div
        className={clsx(
          data.status == 'fail'
            ? 'ring-red-400/40 bg-red-50'
            : data.status == 'running'
              ? 'bg-background text-default-text ring-3'
              : data.masterStatus != 'running'
                ? 'bg-background'
                : 'bg-background opacity-30',
          'hover:opacity-80 flex items-center justify-center rounded-lg ring-1 shadow-lg min-w-[140px] py-2 px-1 transition-all'
        )}
      >
        <div className={clsx(data.status == 'fail' && 'text-red-400', 'w-ful font-semibold truncate text-center')}>
          {data.name}
        </div>
      </div>
    </div>
  );
});
