import { GraphEvent, GraphNodeStructure, GraphRegistry, StateGraphRegistry } from 'ts-edge';
import { Locker } from '@shared/util';

export type WorkflowStatus = 'ready' | 'running' | 'success' | 'fail' | 'stop';

export type NodeThread = {
  status: WorkflowStatus;
  startedAt?: number;
  endedAt?: number;
  threadId?: string;
  input: any;
  output?: any;
  name: string;
  id: string;
  duration?: string;
};

export type WorkflowStreamData =
  | {
      type: 'WORKFLOW_START';
    }
  | {
      type: 'WORKFLOW_END';
      isOk: boolean;
      error?: any;
    }
  | {
      type: 'NODE_START';
      name: string;
      id: string;
      input: any;
    }
  | {
      type: 'NODE_STREAM';
      name: string;
      id: string;
      chunk: string;
    }
  | {
      type: 'NODE_END';
      name: string;
      id: string;
      output: any;
      isOk: boolean;
      error?: any;
    };

export type NodeStructure = GraphNodeStructure & {
  isStartNode: boolean;
};

const createEventStream = () => {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });

  const write = (data: WorkflowStreamData) => {
    controller.enqueue(encoder.encode(JSON.stringify(data)));
  };

  return { stream, write, getController: () => controller };
};

export const createWorkflowActions = <Workflow extends GraphRegistry<any> | StateGraphRegistry<any, any>>(
  workflow: Workflow,
  start: Workflow extends GraphRegistry<infer T>
    ? T['name']
    : Workflow extends StateGraphRegistry<any, infer U>
      ? U
      : never
) => {
  let workflowStatus: WorkflowStatus = 'ready';
  const locker = new Locker();

  const runner = workflow.compile(start);

  const structure: NodeStructure[] = runner.getStructure().map((node) => ({
    ...node,
    isStartNode: node.name == start,
  }));

  runner.use(async () => {
    await locker.wait();
  });

  const reset = () => {
    locker.unLock();
    workflowStatus = 'ready';
    runner.exit();
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
      return workflowStatus;
    },
    reset() {
      reset();
    },
    start(...params: Parameters<typeof runner.run>) {
      reset();
      const { stream, write, getController } = createEventStream();
      const streamHandler = (event: GraphEvent) => {
        if (event.eventType == 'WORKFLOW_END') {
          write({ type: 'WORKFLOW_END', isOk: event.isOk, error: event.error });
          workflowStatus = 'ready';
          runner.unsubscribe(streamHandler);
          getController().close();
        } else if (event.eventType == 'WORKFLOW_START') {
          write({ type: 'WORKFLOW_START' });
        } else if (event.eventType == 'NODE_START') {
          write({ type: 'NODE_START', name: event.node.name, id: event.nodeExecutionId, input: event.node.input });
        } else if (event.eventType == 'NODE_STREAM') {
          write({ type: 'NODE_STREAM', name: event.node.name, id: event.nodeExecutionId, chunk: event.node.chunk });
        } else if (event.eventType == 'NODE_END') {
          write({
            type: 'NODE_END',
            name: event.node.name,
            id: event.nodeExecutionId,
            output: event.node.output,
            isOk: event.isOk,
            error: event.error,
          });
        }
      };

      runner.subscribe(streamHandler);
      runner.run(params[0], params[1]);
      return stream;
    },
  };
};
