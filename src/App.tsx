import React from 'react';
import { TaskInput } from './components/TaskInput';
import { ApprovalModal } from './components/ApprovalModal';
import { useAgentStore } from './store/useAgentStore';
import { Activity, Database } from 'lucide-react';

function App() {
  const { taskState, isPolling, activeThreadId } = useAgentStore();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="text-blue-600 w-6 h-6" />
              Agent Orchestration System
            </h1>
            <p className="text-gray-500 text-sm mt-1">Multi-agent LangGraph execution with Human-in-the-Loop</p>
          </div>
          {isPolling && (
            <span className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Activity className="w-4 h-4 animate-pulse" />
              Executing Plan...
            </span>
          )}
        </header>

        {/* Input Area */}
        <TaskInput />

        {/* Live Trace / Messages Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[400px] flex flex-col">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Execution Trace</h2>
            {activeThreadId && <span className="text-xs text-gray-400 font-mono">Thread: {activeThreadId.split('-')[0]}</span>}
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-gray-50">
            {!taskState?.messages?.length ? (
              <div className="text-center text-gray-400 mt-20">
                Submit a task to see the agent's thought process.
              </div>
            ) : (
              taskState.messages.map((msg, idx) => (
                <div key={idx} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm text-sm text-gray-800 whitespace-pre-wrap font-mono">
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* HITL Modal Overlays the screen if triggered */}
      <ApprovalModal />
    </div>
  );
}

export default App;
