import { create } from 'zustand';
import { agentService } from '../services/api';
import { TaskStateResponse, NodeTraceDetails, ReplayPayload } from '../types/agent';

interface AgentState {
  activeThreadId: string | null;
  taskState: TaskStateResponse | null;
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;

  // Node Trace & Inspection State
  selectedNodeId: string | null;
  selectedNodeDetails: NodeTraceDetails | null;
  isSidePanelOpen: boolean;
  isNodeDetailsLoading: boolean;
  nodeDetailsError: string | null;

  // Replay & Time Travel State
  isReplayModalOpen: boolean;
  isReplaying: boolean;
  replaySuccessMessage: string | null;

  // Actions
  submitTask: (task: string) => Promise<void>;
  fetchState: (threadId: string) => Promise<void>;
  startPolling: (threadId: string) => void;
  stopPolling: () => void;
  approveTask: (approved: boolean, feedback?: string) => Promise<void>;
  fetchNodeDetails: (threadId: string, nodeId: string) => Promise<void>;
  closeSidePanel: () => void;
  openSidePanel: (nodeId: string) => void;
  openReplayModal: () => void;
  closeReplayModal: () => void;
  replayCheckpoint: (payload: ReplayPayload) => Promise<void>;
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

export const useAgentStore = create<AgentState>()((set, get) => ({
  activeThreadId: null,
  taskState: null,
  isLoading: false,
  isPolling: false,
  error: null,

  selectedNodeId: null,
  selectedNodeDetails: null,
  isSidePanelOpen: false,
  isNodeDetailsLoading: false,
  nodeDetailsError: null,

  isReplayModalOpen: false,
  isReplaying: false,
  replaySuccessMessage: null,

  submitTask: async (task: string) => {
    set({ 
      isLoading: true, 
      error: null, 
      taskState: null,
      selectedNodeDetails: null,
      selectedNodeId: null,
      isSidePanelOpen: false,
      isReplayModalOpen: false,
      replaySuccessMessage: null
    });
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
  },

  fetchNodeDetails: async (threadId: string, nodeId: string) => {
    set({
      selectedNodeId: nodeId,
      isSidePanelOpen: true,
      isNodeDetailsLoading: true,
      nodeDetailsError: null
    });
    try {
      const details = await agentService.getNodeTrace(threadId, nodeId);
      set({ selectedNodeDetails: details, isNodeDetailsLoading: false });
    } catch (error: any) {
      set({
        nodeDetailsError: error.response?.data?.detail || error.message || 'Failed to load trace details',
        isNodeDetailsLoading: false
      });
    }
  },

  closeSidePanel: () => {
    set({ isSidePanelOpen: false });
  },

  openSidePanel: (nodeId: string) => {
    const { activeThreadId, fetchNodeDetails } = get();
    set({ selectedNodeId: nodeId, isSidePanelOpen: true });
    if (activeThreadId) {
      fetchNodeDetails(activeThreadId, nodeId);
    }
  },

  openReplayModal: () => {
    set({ isReplayModalOpen: true, replaySuccessMessage: null });
  },

  closeReplayModal: () => {
    set({ isReplayModalOpen: false });
  },

  replayCheckpoint: async (payload: ReplayPayload) => {
    const { activeThreadId, selectedNodeDetails, startPolling, stopPolling } = get();
    if (!activeThreadId) return;

    const checkpointId = selectedNodeDetails?.checkpoint_id || selectedNodeDetails?.node_id || 'latest';

    set({ isReplaying: true, error: null, replaySuccessMessage: null });
    try {
      stopPolling();
      const res = await agentService.replayFromCheckpoint(activeThreadId, checkpointId, payload);
      
      const newThreadId = res.thread_id;
      set({
        activeThreadId: newThreadId,
        isReplaying: false,
        isReplayModalOpen: false,
        isSidePanelOpen: false,
        replaySuccessMessage: res.message
      });

      // Clear previous message logs and immediately start polling the forked/resumed execution
      get().fetchState(newThreadId);
      startPolling(newThreadId);
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || error.message || 'Failed to replay from checkpoint',
        isReplaying: false
      });
    }
  }
}));
