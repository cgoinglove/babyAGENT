import { ChatMessage, WorkflowStatus } from '@ui/interface';
import { GraphNodeStructure } from 'ts-edge';
import { create } from 'zustand';

export interface AppState {
  workflowStatus: WorkflowStatus;
  selectedThread: string | undefined;
  structures: GraphNodeStructure[];
  histories: ChatMessage[];
  message: ChatMessage;
}

export interface AppDispatch {
  setWorkflowStatus: (status: WorkflowStatus) => void;
  setSelectedThread: (id: string | undefined) => void;
  setStructures: (structures: GraphNodeStructure[]) => void;
  addHistory: (history: ChatMessage) => void;
  setMessage: (message: Partial<ChatMessage>) => void;
  reset(): void;
  current(): AppState;
}

const initialState: AppState = {
  workflowStatus: 'ready',
  selectedThread: undefined,
  structures: [],
  histories: [],
  message: { prompt: { text: '' }, threads: [] },
};

export const useAppStore = create<AppState & AppDispatch>((set, get) => ({
  ...initialState,
  setWorkflowStatus: (status) => set({ workflowStatus: status }),
  setSelectedThread: (id) => set({ selectedThread: id }),
  setStructures: (structures) => set({ structures }),
  addHistory: (history) => set({ histories: [...get().histories, history] }),
  setMessage: (message) => set({ message: { ...get().message, ...message } }),
  reset: () => set(initialState),
  current: () => get(),
}));
