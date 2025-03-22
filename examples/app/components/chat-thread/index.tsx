'use client';

import { ChatMessage } from '@ui/interface';
import UserMessage from './user-message';
import AgentMessage from './agent-message';

export default function ChatThread({ message }: { message: ChatMessage; isRunning?: boolean }) {
  return (
    <div className="w-full flex flex-col gap-4">
      {message.prompt.text && <UserMessage message={message.prompt.text} />}
      {message.answer?.text || message.threads.length > 0 ? (
        <AgentMessage message={message.answer?.text || ''} threads={message.threads} />
      ) : null}
    </div>
  );
}
