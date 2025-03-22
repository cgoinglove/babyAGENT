'use client';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import JsonView from '../shared/json-view';

export default function ReportItem({ label, data }: { label: string; data: any }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="w-full h-full ring py-4 px-8 rounded-xl bg-soft-background">
      <div className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setOpen(!open)}>
        <p className="font-semibold">{label}</p>
        <button className="px-2 py-2 rounded-full hover:bg-hover-color transition-colors cursor-pointer flex justify-center items-center">
          <ChevronDown className={clsx('h-5 w-5', { 'rotate-180': open })} />
        </button>
      </div>
      {open && <JsonView data={data} />}
    </div>
  );
}
