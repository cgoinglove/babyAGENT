import { createWorkflowActions } from './api/workflow/create-workflow-apis';

export type WorkflowStatus = 'ready' | 'running' | 'success' | 'fail' | 'stop';

export type NodeThread = {
  id: string;
  name: string;
  input: any;
  output?: any;
  status: WorkflowStatus;
  startedAt?: number;
  endedAt?: number;
  streamText: string;
  metadata?: Record<string, any>;
  error?: any;
};

export type Agent = {
  name: string;
  description: string;
  defaultPrompt: string;
  api: ReturnType<typeof createWorkflowActions>;
};

export type WorkflowStreamData =
  | {
      type: 'WORKFLOW_START';
    }
  | {
      type: 'WORKFLOW_END';
      output: string;
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
