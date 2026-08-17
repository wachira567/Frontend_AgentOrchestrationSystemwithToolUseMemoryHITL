import { create } from 'zustand';
import { agentService } from '../services/api';
import { TaskStateResponse } from '../types/agent';

interface AgentState {
  activeThreadId: string | null;
  taskState: TaskStateResponse | null;
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;

  // Actions
  submitTask: (task: string) => Promise<void>;
  fetchState: (threadId: string) => Promise<void>;
  startPolling: (threadId: string) => void;
  stopPolling: () => void;
  approveTask: (approved: boolean, feedback?: string) => Promise<void>;
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

export const useAgentStore = create<AgentState>()((set, get) => ({
  activeThreadId: null,
  taskState: null,
  isLoading: false,
  isPolling: false,
  error: null,

  submitTask: async (task: string) => {
    set({ isLoading: true, error: null, taskState: null });
    try {
      const response = await agentService.startTask(task);
      set({ activeThreadId: response.thread_id, isLoading: false });
      // Automatically start polling once the task is queued
      get().startPolling(response.thread_id);
    } catch (error: any) {
      set({ error: error.message || 'Failed to start task', isLoading: false });
    }
  },

  fetchState: async (threadId: string) => {
    try {
      const state = await agentService.getTaskState(threadId);
      set({ taskState: state });

      // If the graph is paused for human review, stop polling automatically
      if (state.status === 'pending_human_approval') {
        get().stopPolling();
      }
    } catch (error: any) {
      console.error('Error fetching state:', error);
      // We don't necessarily set the global error state here to avoid flashing UI during polling
    }
  },

  startPolling: (threadId: string) => {
    const { fetchState, stopPolling } = get();
    set({ isPolling: true });
    
    // Clear any existing interval first
    stopPolling();
    
    // Poll every 2 seconds
    pollInterval = setInterval(() => {
      fetchState(threadId);
    }, 2000);
  },

  stopPolling: () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    set({ isPolling: false });
  },

  approveTask: async (approved: boolean, feedback: string = "") => {
    const { activeThreadId, startPolling } = get();
    if (!activeThreadId) return;

    set({ isLoading: true, error: null });
    try {
      await agentService.approveTask(activeThreadId, approved, feedback);
      set({ isLoading: false });
      // Resume polling to watch the agent continue its work
      startPolling(activeThreadId);
    } catch (error: any) {
      set({ error: error.message || 'Failed to submit approval', isLoading: false });
    }
  }
}));
