import { GraphEvent, GraphNodeStructure, GraphRunnable, StateGraphRunnable } from 'ts-edge';
import { Locker } from '@shared/util';
import { WorkflowStatus, WorkflowStreamData } from '@ui/interface';
import { STREAM_END_DELIMITER, STREAM_START_DELIMITER } from '@ui/helper/stream';

const createEventStream = () => {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });

  const write = (data: WorkflowStreamData) => {
    controller.enqueue(encoder.encode(STREAM_START_DELIMITER + JSON.stringify(data) + STREAM_END_DELIMITER));
  };

  return { stream, write, getController: () => controller };
};

export const createWorkflowActions = <Runnable extends GraphRunnable<any> | StateGraphRunnable<any>>(
  runner: Runnable,
  parser: {
    inputParser: (input: { text?: string; file?: File }) => Parameters<Runnable['run']>[0];
    outputParser: (output: Awaited<ReturnType<Runnable['run']>>['output']) => string;
  }
) => {
  let workflowStatus: WorkflowStatus = 'ready';
  const locker = new Locker();
  const structure: GraphNodeStructure[] = runner.getStructure();

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
    start(inputs: { text?: string; file?: File }) {
      reset();
      const { stream, write, getController } = createEventStream();

      const streamHandler = (event: GraphEvent) => {
        if (event.eventType == 'WORKFLOW_END') {
          write({
            type: 'WORKFLOW_END',
            isOk: event.isOk,
            error: {
              name: event.error?.name,
              message: event.error?.message,
              stack: event.error?.stack,
            },
            output: parser.outputParser(event.output),
          });
          workflowStatus = 'ready';
          runner.unsubscribe(streamHandler);
          getController().close();
        } else if (event.eventType == 'WORKFLOW_START') {
          write({ type: 'WORKFLOW_START' });
        } else if (event.eventType == 'NODE_START') {
          write({
            type: 'NODE_START',
            name: event.node.name,
            id: event.nodeExecutionId,
            input: event.node.input,
          });
        } else if (event.eventType == 'NODE_STREAM') {
          write({
            type: 'NODE_STREAM',
            name: event.node.name,
            id: event.nodeExecutionId,
            chunk: event.node.chunk,
          });
        } else if (event.eventType == 'NODE_END') {
          write({
            type: 'NODE_END',
            name: event.node.name,
            id: event.nodeExecutionId,
            output: event.node.output,
            isOk: event.isOk,
            error: {
              name: event.error?.name,
              message: event.error?.message,
              stack: event.error?.stack,
            },
          });
        }
      };
      runner.subscribe(streamHandler);
      runner.run(parser.inputParser(inputs)).then(() => {
        runner.unsubscribe(streamHandler);
      });
      return stream;
    },
  };
};
