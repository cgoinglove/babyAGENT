import { NodeStatus } from '@ui/actions/workflow/workflow-action';
import { Code, Terminal } from 'lucide-react';

export default function NodeDetail({ node }: { node: NodeStatus }) {
  const duration = node.startedAt && node.endedAt ? ((node.endedAt - node.startedAt) / 1000).toFixed(2) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Node Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="font-medium">{node.status.charAt(0).toUpperCase() + node.status.slice(1)}</p>
          </div>
          {duration && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Duration</p>
              <p className="font-medium">{duration} seconds</p>
            </div>
          )}
          {node.threadId && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Thread ID</p>
              <p className="font-medium">{node.threadId}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {node.input && (
          <div className="overflow-hidden">
            <div className="bg-muted px-4 py-2 font-medium flex items-center">
              <Code className="mr-2 h-4 w-4" />
              Input
            </div>
            <div className="p-4">
              <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(node.input, null, 2)}</pre>
            </div>
          </div>
        )}

        {node.output && (
          <div className="overflow-hidden">
            <div className="bg-muted px-4 py-2 font-medium flex items-center">
              <Terminal className="mr-2 h-4 w-4" />
              Output
            </div>
            <div className="p-4">
              <pre className="text-sm overflow-auto whitespace-pre-wrap">{JSON.stringify(node.output, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
