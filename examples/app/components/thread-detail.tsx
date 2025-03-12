import { NodeThread } from '@ui/actions/workflow/create-workflow-action';
import { Code, Terminal } from 'lucide-react';

export default function ThreadDetail({ thread }: { thread: NodeThread }) {
  const duration = thread.startedAt && thread.endedAt ? ((thread.endedAt - thread.startedAt) / 1000).toFixed(2) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Thread Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="font-medium">{thread.status.charAt(0).toUpperCase() + thread.status.slice(1)}</p>
          </div>
          {duration && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Duration</p>
              <p className="font-medium">{duration} seconds</p>
            </div>
          )}
          {thread.threadId && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Thread ID</p>
              <p className="font-medium">{thread.threadId}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {thread.input && (
          <div className="overflow-hidden">
            <div className="bg-muted px-4 py-2 font-medium flex items-center">
              <Code className="mr-2 h-4 w-4" />
              Input
            </div>
            <div className="p-4">
              <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(thread.input, null, 2)}</pre>
            </div>
          </div>
        )}

        {thread.output && (
          <div className="overflow-hidden">
            <div className="bg-muted px-4 py-2 font-medium flex items-center">
              <Terminal className="mr-2 h-4 w-4" />
              Output
            </div>
            <div className="p-4">
              <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(thread.output, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
