import { GraphEvent, GraphNodeStartEvent, GraphNodeStructure, GraphNodeWithOutOutput, GraphRegistry } from 'ts-edge';
import { Locker } from '@shared/util';
import { safe } from 'ts-safe';

const normalize = (data: any) => JSON.parse(JSON.stringify(data));

type Parser<T> = (original: T) => { label: string; value: any }[];

type AgenticActionOptions<Workflow> = {
  graphDirection: 'TB' | 'LR';
  inputViewParser: Workflow extends GraphRegistry<infer Node> ? Parser<GraphNodeWithOutOutput<Node>> : never;
  outputViewParser: Workflow extends GraphRegistry<infer Node> ? Parser<Node> : never;
};

export type WorkflowStatus = 'ready' | 'running' | 'success' | 'fail' | 'stop';

export type NodeThread = {
  status: WorkflowStatus;
  startedAt?: number;
  endedAt?: number;
  threadId?: string;
  description?: string;
  input?: any;
  output?: any;
  name: string;
  id: string;
  duration?: string;
};

export type NodeStructure = GraphNodeStructure & {
  status: WorkflowStatus;
  duration?: string;
  toMergeNode: boolean;
  isStartNode: boolean;
};

const isStart = (e: GraphEvent): e is GraphNodeStartEvent => e.eventType == 'NODE_START';

const calcDuration = (thread: Partial<NodeThread>) =>
  thread.startedAt ? (((thread.endedAt ?? Date.now()) - thread.startedAt) / 1000).toFixed(2) : undefined;

export const createWorkflowActions = <Workflow extends GraphRegistry<any>>(
  workflow: Workflow,
  start: Workflow extends GraphRegistry<infer T> ? T['name'] : never,
  options?: Partial<AgenticActionOptions<Workflow>>
) => {
  let workflowStatus: WorkflowStatus = 'ready';
  const locker = new Locker();

  const runner = workflow.compile(start);

  const structure = runner.getStructure().reduce((prev, node) => ({ ...prev, [node.name]: node }), {});
  const mergeNodes = runner
    .getStructure()
    .filter((node) => node.isMergeNode)
    .map((node) => node.name);
  runner.use(async () => {
    await locker.wait();
  });

  const inputParser = (v: any) =>
    safe(v)
      .map(options?.inputViewParser ?? (() => [{ label: 'value', value: v }]))
      .map(normalize)
      .orElse([{ label: 'value', value: v }]);
  const outputParser = (v: any) =>
    safe(v)
      .map(options?.outputViewParser ?? (() => [{ label: 'value', value: v }]))
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
    const nodeThread: NodeThread = {
      status: isStart(event) ? 'running' : event.isOk ? 'success' : 'fail',
      threadId: event.threadId,
      startedAt: event.startedAt,
      description: structure[event.node.name].description,
      endedAt: isStart(event) ? undefined : event.endedAt,
      input: inputParser(event.node),
      output: outputParser(isStart(event) ? {} : normalize(event.node)),
      name: event.node.name,
      id: event.nodeExecutionId,
      duration: calcDuration(event),
    };
    const prev = threads.find((v) => v.id == event.nodeExecutionId);
    if (prev) Object.assign(prev, nodeThread);
    else threads.push(nodeThread);
  };

  const getFlowInfo = () => {
    const nodeStructures = runner.getStructure().map((node) => {
      const latestThread: Partial<NodeThread> = [...threads].reverse().find((status) => status.name == node.name) ?? {};
      return {
        ...node,
        toMergeNode: node.edge?.name.some((n) => mergeNodes.includes(n)),
        duration: calcDuration(latestThread as NodeThread),
        status: latestThread.status || 'ready',
      } as NodeStructure;
    });
    return {
      nodeStructures,
      threads,
      workflowStatus,
      startThread: {
        name: start,
        description: structure[start as string].description,
        status: 'ready',
        id: start,
      } as NodeThread,
    };
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
    getFlowInfo() {
      return getFlowInfo();
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
