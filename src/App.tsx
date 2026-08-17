import React, { useState } from 'react';
import { TaskInput } from './components/TaskInput';
import { ApprovalModal } from './components/ApprovalModal';
import { TraceViewer } from './components/TraceViewer';
import { TraceSidePanel } from './components/TraceSidePanel';
import { ReplayModal } from './components/ReplayModal';
import { useAgentStore } from './store/useAgentStore';
import { Activity, Database, Terminal, GitMerge, RotateCcw } from 'lucide-react';

function App() {
  const { taskState, isPolling, activeThreadId, replaySuccessMessage } = useAgentStore();
  const [activeTab, setActiveTab] = useState<'log' | 'trace'>('trace');

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans flex flex-col relative">
      <div className="max-w-6xl mx-auto w-full space-y-6 flex-1 flex flex-col">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Database className="text-blue-600 w-6 h-6" />
              Agent Orchestration System
            </h1>
            <p className="text-gray-500 text-sm mt-1">Multi-agent LangGraph execution with Time-Travel Replay & Memory</p>
          </div>
          <div className="flex items-center gap-3">
            {replaySuccessMessage && (
              <span className="flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                <RotateCcw className="w-3.5 h-3.5" /> Replay Active
              </span>
            )}
            {isPolling && (
              <span className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                <Activity className="w-4 h-4 animate-pulse" />
                Executing Plan...
              </span>
            )}
          </div>
        </header>

        {/* Input Area */}
        <TaskInput />

        {/* Workspace Area */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden min-h-[600px]">
          
          {/* Tab Navigation */}
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('trace')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'trace' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <GitMerge className="w-4 h-4" /> Trace Explorer
              </button>
              <button
                onClick={() => setActiveTab('log')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'log' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Terminal className="w-4 h-4" /> Message Log
              </button>
            </div>
            {activeThreadId && <span className="text-xs text-gray-400 font-mono">Thread: {activeThreadId.split('-')[0]}</span>}
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 relative bg-gray-50">
            {activeTab === 'trace' ? (
              <TraceViewer />
            ) : (
              <div className="absolute inset-0 p-6 overflow-y-auto space-y-4">
                {!taskState?.messages?.length ? (
                  <div className="text-center text-gray-400 mt-20">
                    Submit a task to view the execution log.
                  </div>
                ) : (
                  taskState.messages.map((msg, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {msg}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* HITL Modal Overlays the screen if triggered */}
      <ApprovalModal />

      {/* Node Detail Slide-Over Panel */}
      <TraceSidePanel />

      {/* Replay & Time-Travel Debugging Modal */}
      <ReplayModal />
    </div>
  );
}

export default App;
