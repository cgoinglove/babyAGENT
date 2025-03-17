'use client';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
export default function JsonView({
  label,
  data,
  open = true,
  onClick,
}: {
  label: string;
  data: any;
  open?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="w-full h-full ring py-4 px-8 rounded-xl cursor-pointer" onClick={onClick}>
      <div className="flex flex-row items-center justify-between">
        <p className="font-semibold">{label}</p>
        <button className="px-2 py-2 rounded-full hover:bg-hover-color transition-colors cursor-pointer flex justify-center items-center">
          <ChevronDown className={clsx('h-5 w-5', { 'rotate-180': open })} />
        </button>
      </div>
      {open && (
        <pre
          onClick={(e) => e.stopPropagation()}
          className="mt-4 cursor-default bg-background p-6 rounded-xl ring overflow-auto text-sm whitespace-pre-wrap break-all"
        >
          {!data ? (
            <span className="text-sub-text">No data</span>
          ) : (
            JSON.stringify(data, null, 2)?.replaceAll('\\n', '\n').replaceAll('\\"', '"')
          )}
        </pre>
      )}
    </div>
  );
}
