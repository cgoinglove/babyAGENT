import { GraphEvent, GraphNodeStartEvent, GraphNodeWithOutOutput, GraphRunnable } from 'ts-edge';
import { Locker } from '@shared/util';
import { safe } from 'ts-safe';

const normalize = (data: any) => JSON.parse(JSON.stringify(data));

type Parser<T> = (original: T) => {
  input: any;
} & {
  [key: string]: any;
};

type AgenticActionOptions<Runnable> = {
  inputParser: Runnable extends GraphRunnable<infer Node> ? Parser<GraphNodeWithOutOutput<Node>> : never;
  outputParser: Runnable extends GraphRunnable<infer Node> ? Parser<Node> : never;
};

export type NodeStatus = {
  status: 'ready' | 'running' | 'success' | 'fail' | 'stop';
  startedAt?: number;
  endedAt?: number;
  threadId?: string;
  input?: any;
  output?: any;
  name: string;
  id: string;
};

export const createWorkflowActions = <Runnable extends GraphRunnable<any>>(
  runner: Runnable,
  options?: Partial<AgenticActionOptions<Runnable>>
) => {
  let isRunning = false;
  const locker = new Locker();

  runner.use(async () => {
    await locker.wait();
  });

  const inputParser = (v: any) =>
    safe(v)
      .map(options?.inputParser ?? (() => ({ input: v })))
      .map(normalize)
      .orElse({ input: v });
  const outputParser = (v: any) =>
    safe(v)
      .map(options?.outputParser ?? (() => ({ input: v })))
      .map(normalize)
      .orElse({ input: v });

  const histories: NodeStatus[] = [];

  const addHistory = (event: GraphEvent) => {
    if (event.eventType == 'WORKFLOW_START') return;
    if (event.eventType == 'WORKFLOW_END') {
      isRunning = false;
      runner.unsubscribe(addHistory);
      return;
    }
    const isStart = (e: GraphEvent): e is GraphNodeStartEvent => e.eventType == 'NODE_START';
    const history: NodeStatus = {
      status: isStart(event) ? 'running' : event.isOk ? 'success' : 'fail',
      threadId: event.threadId,
      startedAt: event.startedAt,
      endedAt: isStart(event) ? undefined : event.endedAt,
      input: inputParser(event.node),
      output: outputParser(isStart(event) ? {} : normalize(event.node)),
      name: event.node.name,
      id: event.nodeExecutionId,
    };
    const prev = histories.find((v) => v.id == event.nodeExecutionId);
    if (prev) Object.assign(prev, history);
    else histories.push(history);
  };

  const getFlow = () => {
    const structure = runner.getStructure().map((node) => {
      const latestHistory: Partial<NodeStatus> =
        [...histories].reverse().find((status) => status.name == node.name) ?? {};
      return {
        ...node,
        ...latestHistory,
      };
    });
    return {
      structure,
      histories,
      isRunning,
    };
  };

  return {
    stop() {
      if (!isRunning) return;
      locker.lock();
    },
    resume() {
      if (!isRunning) return;
      locker.unLock();
    },
    getFlow() {
      return getFlow();
    },
    async start(...params: Parameters<Runnable['run']>) {
      locker.unLock();
      histories.length = 0;
      isRunning = true;
      runner.subscribe(addHistory);
      await runner.run(params[0], params[1]);
    },
  };
};
