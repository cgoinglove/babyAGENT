'use client';

import { useAppStore } from '@ui/store';
import { useEffect, useMemo, useRef } from 'react';
import ChatThread from './chat-thread';
import TextStream from './shared/text-stream';
import ThreadDetail from './thread-detail';
export default function RightSide() {
  const store = useAppStore();
  const ref = useRef<HTMLDivElement>(null);

  const threads = useMemo(() => {
    if (store.message.prompt.text || store.message.answer || store.message.threads.length > 0) {
      return store.histories.concat(store.message);
    }
    return store.histories;
  }, [store.histories, store.message]);

  useEffect(() => {
    if (!ref.current || store.selectedThread) return;

    // Use setTimeout to ensure the DOM has updated before scrolling
    const scrollToBottom = () => {
      if (ref.current) {
        ref.current.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' });
      }
    };

    scrollToBottom();

    // Also create a MutationObserver to detect height changes within the content
    const observer = new MutationObserver(() => {
      scrollToBottom();
    });

    // Observe changes to the content div's children and their attributes
    if (ref.current.firstElementChild) {
      observer.observe(ref.current.firstElementChild, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }

    // Clean up the observer on unmount
    return () => {
      observer.disconnect();
    };
  }, [store.selectedThread]);
  return (
    <div className="h-full">
      <div className="w-full h-full overflow-y-auto" ref={ref}>
        {store.selectedThread ? (
          <ThreadDetail />
        ) : threads.length > 0 ? (
          <div className="flex flex-col gap-6 p-8">
            {threads.map((thread, index) => (
              <ChatThread key={index} message={thread} isRunning={thread == store.message} />
            ))}
          </div>
        ) : (
          <div className="h-full flex px-6 items-center justify-center font-semibold text-5xl ">
            <TextStream text={`How can I help you today?`} />
          </div>
        )}
      </div>
    </div>
  );
}
