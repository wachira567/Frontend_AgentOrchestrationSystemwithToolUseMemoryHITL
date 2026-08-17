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
