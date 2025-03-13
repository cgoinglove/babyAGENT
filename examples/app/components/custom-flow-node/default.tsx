import { Handle, Node, Position, type NodeProps } from '@xyflow/react';

import clsx from 'clsx';
import { FlowNode } from '../helper/create-flow';
import { MousePointer2 } from 'lucide-react';

type Props = NodeProps<Node<FlowNode>>;

export default function CustomDefaultNode({ data, isConnectable }: Props) {
  return (
    <div
      className={clsx(
        data.status == 'fail' && 'ring-red-500 bg-red-50',
        data.status == 'running' && 'ring-sub-text',
        'hover:bg-hover-color relative px-4 py-3 rounded-lg ring shadow-sm min-w-[200px] max-w-[300px] bg-background transition-all'
      )}
    >
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

      <div className="flex items-center flex-col w-full">
        <div className="flex-1 font-semibold text-lg truncate text-center">{data.name}</div>
        {/* <p className="text-xs text-sub-text py-2">{data.metadata.description}</p> */}
      </div>
    </div>
  );
}
