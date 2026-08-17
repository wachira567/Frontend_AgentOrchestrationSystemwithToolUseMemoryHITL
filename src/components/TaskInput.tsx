import React, { useState } from 'react';
import { useAgentStore } from '../store/useAgentStore';
import { Send, Loader2 } from 'lucide-react';

export const TaskInput: React.FC = () => {
  const [input, setInput] = useState('');
  const submitTask = useAgentStore((state) => state.submitTask);
  const isLoading = useAgentStore((state) => state.isLoading);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      submitTask(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-2">
        Assign a complex task to the Supervisor Agent
      </label>
      <div className="flex gap-3">
        <input
          id="task"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Research the current weather in Nairobi, run a python script to convert to Fahrenheit..."
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isLoading ? 'Processing...' : 'Execute'}
        </button>
      </div>
    </form>
  );
};
