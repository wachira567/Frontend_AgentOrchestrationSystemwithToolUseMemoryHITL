import React, { useState } from 'react';
import { useAgentStore } from '../store/useAgentStore';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const ApprovalModal: React.FC = () => {
  const { taskState, approveTask, isLoading } = useAgentStore();
  const [feedback, setFeedback] = useState('');

  // Only render if the backend explicitly paused for human approval
  if (taskState?.status !== 'pending_human_approval') return null;

  const handleApprove = () => approveTask(true);
  const handleReject = () => approveTask(false, feedback || "Human operator rejected the plan.");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-yellow-200">
        <div className="flex items-center gap-3 text-yellow-600 mb-4">
          <AlertTriangle className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Human Approval Required</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          The Supervisor agent has flagged this task as sensitive or has low confidence. Please review the proposed execution plan before proceeding.
        </p>

        {taskState.current_plan && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">
              Proposed Plan (Confidence: {Math.round(taskState.current_plan.confidence_score * 100)}%)
            </h3>
            <ul className="space-y-3">
              {taskState.current_plan.subtasks.map((task, idx) => (
                <li key={task.task_id} className="text-sm">
                  <span className="font-semibold text-blue-600">Step {idx + 1} ({task.assigned_specialist}): </span>
                  <span className="text-gray-700">{task.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Optional Feedback (if modifying or rejecting)
          </label>
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            placeholder="e.g., Skip the python execution and just write a summary..."
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleReject}
            disabled={isLoading}
            className="px-4 py-2 flex items-center gap-2 text-red-700 bg-red-50 hover:bg-red-100 rounded-md font-medium transition-colors"
          >
            <XCircle className="w-4 h-4" /> Reject & Revise
          </button>
          <button
            onClick={handleApprove}
            disabled={isLoading}
            className="px-4 py-2 flex items-center gap-2 text-white bg-green-600 hover:bg-green-700 rounded-md font-medium transition-colors"
          >
            <CheckCircle className="w-4 h-4" /> Approve Execution
          </button>
        </div>
      </div>
    </div>
  );
};
