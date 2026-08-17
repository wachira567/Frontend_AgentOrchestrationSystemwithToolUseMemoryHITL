import axios from 'axios';
import {
  TaskCreationResponse,
  TaskStateResponse,
  NodeTraceDetails,
  ReplayPayload,
  ReplayResponse
} from '../types/agent';

// Create a centralized Axios instance
// We don't need a full localhost URL because Vite proxies '/api' to FastAPI
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const agentService = {
  /**
   * Submit a new complex task to the supervisor agent.
   */
  startTask: async (task: string): Promise<TaskCreationResponse> => {
    const response = await apiClient.post<TaskCreationResponse>('/tasks', { task });
    return response.data;
  },

  /**
   * Poll or fetch the current state, memory, and plan of the agent graph.
   */
  getTaskState: async (threadId: string): Promise<TaskStateResponse> => {
    const response = await apiClient.get<TaskStateResponse>(`/tasks/${threadId}/state`);
    return response.data;
  },

  /**
   * Resume the graph after Human-in-the-Loop review.
   */
  approveTask: async (
    threadId: string, 
    approved: boolean, 
    feedback: string = ""
  ): Promise<{ message: string }> => {
    const response = await apiClient.post(`/tasks/${threadId}/approve`, {
      approved,
      feedback,
    });
    return response.data;
  },

  /**
   * Fetch detailed execution trace, LLM prompts/responses, and token metrics for a specific node.
   */
  getNodeTrace: async (threadId: string, nodeId: string): Promise<NodeTraceDetails> => {
    const response = await apiClient.get<NodeTraceDetails>(`/tasks/${threadId}/trace/${nodeId}`);
    return response.data;
  },

  /**
   * Replay and Time-Travel Debug: Fork/load a checkpoint, apply state edits, and resume execution.
   */
  replayFromCheckpoint: async (
    threadId: string,
    checkpointId: string,
    payload: ReplayPayload
  ): Promise<ReplayResponse> => {
    const response = await apiClient.post<ReplayResponse>(
      `/tasks/${threadId}/replay/${checkpointId}`,
      payload
    );
    return response.data;
  }
};
