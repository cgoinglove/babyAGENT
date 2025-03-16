import { NodeThread, WorkflowStatus } from '@ui/actions/workflow/create-workflow-action';
import { create } from 'zustand';

type Setter<T> = T | ((prev: T) => T);

const setter = <T>(prev: T, next: Setter<T>): T => {
  return typeof next != 'function' ? next : (next as (prev: T) => T)(prev);
};

export interface StoreState {
  prompt: {
    text: string;
    file?: File;
  };
  threads: Record<NodeThread['id'], NodeThread>;
  selectedThreadId: NodeThread['id'];
  workflowStatus: WorkflowStatus;
  prompts: StoreState['prompt'][];
}

export interface StoreDispatch {
  setPrompt: (prompt: Setter<StoreState['prompt']>) => void;
  selectThread: (threadId: string) => void;
  updateThread: (threadId: string, thread: Setter<NodeThread>) => void;
  setWorkflowStatus: (status: Setter<StoreState['workflowStatus']>) => void;
  pushPrompt: () => void;
  reset: () => void;
  isWorkflowRunning(): boolean;
  isWorkflowLock(): boolean;
}

const initialState: StoreState = {
  prompt: {
    text: '',
    file: undefined,
  },
  threads: {},
  selectedThreadId: '',
  workflowStatus: 'ready',
  prompts: [],
};

export const useStore = create<StoreState & StoreDispatch>((set, get) => {
  return {
    ...initialState,
    isWorkflowLock() {
      return get().workflowStatus === 'stop';
    },
    isWorkflowRunning() {
      return ['running', 'stop'].includes(get().workflowStatus);
    },
    setPrompt(prompt) {
      set((state) => {
        return {
          prompt: setter(state.prompt, prompt),
        };
      });
    },
    reset() {
      set({ ...initialState });
    },
    selectThread(threadId) {
      set({
        selectedThreadId: threadId,
      });
    },
    updateThread(threadId, thread) {
      set((state) => {
        const prev: NodeThread = state.threads[threadId] ?? {
          id: threadId,
          status: 'ready',
          name: '',
          input: [],
        };
        return {
          threads: { ...state.threads, [threadId]: setter(prev, thread) },
        };
      });
    },
    pushPrompt() {
      const prompt = get().prompt;
      const prev = get().prompts;
      set({ prompt: { text: '' }, prompts: [...prev, prompt] });
    },
    setWorkflowStatus(status) {
      set({ workflowStatus: setter(get().workflowStatus, status) });
    },
  };
});
