'use client';
import JsonView from '../shared/json-view';

export default function UserMessage({ message }: { message: string }) {
  return (
    <div className="w-full animate-fade-in ">
      <div className="p-4 bg-hover-color rounded-xl  ">
        <p className="text-xs text-sub-text font-semibold">USER</p>
        <div className="text-default-text my-2">
          <JsonView data={message} />
        </div>
      </div>
    </div>
  );
}
