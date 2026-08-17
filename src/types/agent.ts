export interface SubTask {
  task_id: string;
  description: string;
  assigned_specialist: string;
  expected_output: string;
}

export interface ExecutionPlan {
  subtasks: SubTask[];
  confidence_score: number;
  requires_human_approval: boolean;
}

export interface TaskStateResponse {
  status: 'pending_human_approval' | 'running_or_completed';
  next_nodes: string[];
  current_plan: ExecutionPlan | null;
  messages: string[];
}

export interface TaskCreationResponse {
  thread_id: string;
  message: string;
}

export interface ToolInvocation {
  id?: string;
  name: string;
  args: Record<string, any> | string;
  output?: string;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost_usd?: number;
}

export interface NodeTraceDetails {
  node_id: string;
  node_label: string;
  status: 'completed' | 'active' | 'pending' | 'waiting_approval' | 'skipped';
  step?: number;
  timestamp?: string;
  prompt?: string | null;
  response?: string | null;
  tool_calls?: ToolInvocation[];
  token_usage?: TokenUsage | null;
  subtask?: SubTask | null;
  state_snapshot?: Record<string, any>;
  error?: string | null;
}
