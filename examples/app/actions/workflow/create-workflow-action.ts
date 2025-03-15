import { GraphEvent, GraphNodeEndEvent, GraphNodeStartEvent, GraphNodeStructure, GraphRegistry } from 'ts-edge';
import { Locker } from '@shared/util';
import { safe } from 'ts-safe';

type Data = { label: string; value: any };

const normalize = (data: any) => JSON.parse(JSON.stringify(data));

type Parser<T> = (event: T) => Data[];

type AgenticActionOptions<Workflow> = {
  dataViewParser: Workflow extends GraphRegistry<infer Node>
    ? Parser<GraphNodeStartEvent<Node> | GraphNodeEndEvent<Node>>
    : never;
};

export type WorkflowStatus = 'ready' | 'running' | 'success' | 'fail' | 'stop';

export type NodeThread = {
  status: WorkflowStatus;
  startedAt?: number;
  endedAt?: number;
  threadId?: string;
  input: Data[];
  output?: Data[];
  name: string;
  id: string;
  duration?: string;
};

export type NodeStructure = GraphNodeStructure & {
  toMergeNode: boolean;
  isStartNode: boolean;
  inEdgeCount: number;
  outEdgeCount: number;
};

const isStart = (e: GraphEvent): e is GraphNodeStartEvent => e.eventType == 'NODE_START';

const calcDuration = (thread: Partial<NodeThread>) =>
  thread.startedAt ? (((thread.endedAt || Date.now()) - thread.startedAt) / 1000).toFixed(2) : undefined;

export const createWorkflowActions = <Workflow extends GraphRegistry<any>>(
  workflow: Workflow,
  start: Workflow extends GraphRegistry<infer T> ? T['name'] : never,
  options?: Partial<AgenticActionOptions<Workflow>>
) => {
  let workflowStatus: WorkflowStatus = 'ready';
  const locker = new Locker();

  const runner = workflow.compile(start);

  const { inEdgeCountMap, mergeNodeList } = runner.getStructure().reduce(
    (prev, node) => {
      if (node.isMergeNode) prev.mergeNodeList.push(node.name);
      node.edge?.name.forEach((out) => {
        prev.inEdgeCountMap[out] = (prev.inEdgeCountMap[out] ?? 0) + 1;
      });
      return prev;
    },
    {
      mergeNodeList: [] as string[],
      inEdgeCountMap: {} as Record<string, number>,
    }
  );

  const structure: NodeStructure[] = runner.getStructure().map((node) => ({
    ...node,
    inEdgeCount: inEdgeCountMap[node.name] ?? 0,
    outEdgeCount: node.edge?.name.length || 0,
    isStartNode: node.name == start,
    toMergeNode: mergeNodeList.includes(node.name),
  }));

  runner.use(async () => {
    await locker.wait();
  });

  const dataViewParser = (v: any) =>
    safe(v)
      .map(options?.dataViewParser ?? (() => [{ label: 'value', value: v }]))
      .map(normalize)
      .orElse([{ label: 'value', value: v }]);

  const threads: NodeThread[] = [];

  const updateThread = (event: GraphEvent) => {
    if (event.eventType == 'WORKFLOW_START') {
      workflowStatus = 'running';
      return;
    }
    if (event.eventType == 'WORKFLOW_END') {
      workflowStatus = event.isOk ? 'success' : 'fail';
      runner.unsubscribe(updateThread);
      return;
    }
    const nodeThread: Partial<NodeThread> = {
      status: isStart(event) ? 'running' : event.isOk ? 'success' : 'fail',
      threadId: event.threadId,
      startedAt: event.startedAt,
      endedAt: isStart(event) ? undefined : event.endedAt,
      name: event.node.name,
      id: event.nodeExecutionId,
      duration: calcDuration(event),
    };
    if (isStart(event)) {
      nodeThread.input = dataViewParser(event);
    } else {
      nodeThread.output = dataViewParser(event);
    }
    const prev = threads.find((v) => v.id == event.nodeExecutionId);
    if (prev) Object.assign(prev, nodeThread);
    else threads.push(nodeThread as NodeThread);
  };
  const reset = () => {
    locker.unLock();
    threads.length = 0;
    workflowStatus = 'ready';
  };
  return {
    stop() {
      if (workflowStatus != 'running') return;
      workflowStatus = 'stop';
      locker.lock();
    },
    resume() {
      if (workflowStatus != 'stop') return;
      workflowStatus = 'running';
      locker.unLock();
    },
    getNodeStructures() {
      return structure;
    },
    getStatus() {
      return {
        threads,
        workflowStatus,
      };
    },
    reset() {
      reset();
      runner.exit();
    },
    async start(...params: Parameters<typeof runner.run>) {
      locker.unLock();
      threads.length = 0;
      workflowStatus = 'running';
      runner.subscribe(updateThread);
      await runner.run(params[0], params[1]);
    },
  };
};
