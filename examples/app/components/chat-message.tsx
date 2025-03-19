import { ChatMessage, NodeThread } from '@ui/interface';
import ThreadCard from './thread-card';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatMessageView({
  message,
  onClick,
}: {
  message: ChatMessage;
  onClick: (thread: NodeThread) => void;
}) {
  if (!message.prompt.text && !message.threads.length) return;

  return (
    <div>
      <div className="text-sm font-semibold animate-fade-in-slow rounded-lg bg-hover-color px-6 py-2">
        {message.prompt.text}
      </div>
      <div className="ring rounded-lg flex flex-col my-3 py-1">
        {message.threads.map((thread, index) => (
          <ThreadCard
            key={`${thread.name}-${index}`}
            thread={thread}
            onClick={onClick.bind(null, thread)}
            isLast={index + 1 == message.threads.length}
            isFirst={index == 0}
          />
        ))}
        {message.answer && (
          <div className="my-4 w-full text-sm font-semibold animate-fade-in-slow text-sub-text  px-6 py-2">
            <Markdown remarkPlugins={[remarkGfm]}>{message.answer.text}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
}
