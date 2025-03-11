import { GraphEvent, GraphNodeStartEvent, GraphRunnable } from 'ts-edge';

const normalize = (data: any) => JSON.parse(JSON.stringify(data));

// type AgenticActionOptions<Runnable extends GraphRunnable> = {
//   runner: Runnable;
// };

type NodeStatus = {
  status: 'ready' | 'running' | 'success' | 'fail' | 'stop';
  startedAt?: number;
  endedAt?: number;
  threadId?: string;
  input?: any;
  output?: any;
};

const getDefaultNodeStatus = (): NodeStatus => ({
  status: 'ready',
});

export const createWorkflowActions = <Runnable extends GraphRunnable>(
  runner: Runnable
  // options?: AgenticActionOptions<Runnable>
) => {
  const nodeStatus: Map<string, NodeStatus> = new Map();

  const updateStatus = (event: GraphEvent) => {
    if (event.eventType == 'WORKFLOW_START' || event.eventType == 'WORKFLOW_END') return;

    const isStart = (e: any): e is GraphNodeStartEvent => e.eventType == 'NODE_START';
    const prev = nodeStatus.get(event.node.name) ?? getDefaultNodeStatus();

    nodeStatus.set(event.node.name, {
      ...prev,
      status: isStart(event) ? 'running' : event.isOk ? 'success' : 'fail',
      threadId: event.threadId,
      startedAt: event.startedAt,
      endedAt: isStart(event) ? undefined : event.endedAt,
      input: normalize(event.node.input),
      output: isStart(event) ? {} : normalize(event.node.output),
    });
  };

  const getFlow = () => {
    const structure = runner.getStructure();
    return structure.map((node) => ({
      ...node,
      ...(nodeStatus.get(node.name) ?? getDefaultNodeStatus()),
    }));
  };

  return {
    stop() {},
    resume() {},
    getFlow,
    start(...params: Parameters<Runnable['run']>) {
      nodeStatus.clear();
      runner.subscribe(updateStatus);
      return runner.run(params[0], params[1]).finally(() => {
        runner.unsubscribe(updateStatus);
      });
    },
  };
};
