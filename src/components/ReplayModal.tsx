import React, { useState, useEffect } from 'react';
import { useAgentStore } from '../store/useAgentStore';
import { RotateCcw, GitFork, AlertTriangle, X, Play, Loader2, Edit3, Code } from 'lucide-react';

export const ReplayModal: React.FC = () => {
  const {
    isReplayModalOpen,
    closeReplayModal,
    selectedNodeDetails,
    replayCheckpoint,
    isReplaying,
    activeThreadId
  } = useAgentStore();

  const [modifiedPrompt, setModifiedPrompt] = useState('');
  const [modifiedResponse, setModifiedResponse] = useState('');
  const [stateJson, setStateJson] = useState('{}');
  const [forkNewThread, setForkNewThread] = useState(true);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'quick' | 'advanced'>('quick');

  useEffect(() => {
    if (selectedNodeDetails) {
      setModifiedPrompt(selectedNodeDetails.prompt || '');
      setModifiedResponse(selectedNodeDetails.response || '');
      setStateJson(JSON.stringify(selectedNodeDetails.state_snapshot || {}, null, 2));
    }
  }, [selectedNodeDetails, isReplayModalOpen]);

  if (!isReplayModalOpen || !selectedNodeDetails) return null;

  const handleReplay = async () => {
    let parsedState: Record<string, any> = {};
    if (activeTab === 'advanced' && stateJson.trim()) {
      try {
        parsedState = JSON.parse(stateJson);
        setJsonError(null);
      } catch (err: any) {
        setJsonError('Invalid JSON format in state updates payload');
        return;
      }
    }

    await replayCheckpoint({
      modified_prompt: modifiedPrompt !== (selectedNodeDetails.prompt || '') ? modifiedPrompt : undefined,
      modified_response: modifiedResponse !== (selectedNodeDetails.response || '') ? modifiedResponse : undefined,
      state_updates: Object.keys(parsedState).length > 0 ? parsedState : undefined,
      fork_new_thread: forkNewThread
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-indigo-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 bg-indigo-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-indigo-300" />
              <h2 className="text-lg font-bold">Time-Travel & Replay Execution</h2>
            </div>
            <p className="text-xs text-indigo-200">
              Fork or resume LangGraph state from <span className="font-semibold text-white">{selectedNodeDetails.node_label}</span> (Checkpoint: {selectedNodeDetails.checkpoint_id?.slice(0, 8) || 'active'})
            </p>
          </div>
          <button
            onClick={closeReplayModal}
            className="p-1 rounded-md text-indigo-300 hover:text-white hover:bg-indigo-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-5 pt-3">
          <button
            onClick={() => setActiveTab('quick')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'quick'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Prompt & Context Modification
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'advanced'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> State Payload (JSON)
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
          
          {/* Thread Forking Control */}
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <GitFork className="w-4 h-4 text-indigo-600" /> Fork into Isolated Thread
              </span>
              <p className="text-xs text-gray-500">
                Preserves original trace history and creates a fresh branch for this execution experiment.
              </p>
            </div>
            <input
              type="checkbox"
              id="forkCheckbox"
              checked={forkNewThread}
              onChange={(e) => setForkNewThread(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
            />
          </div>

          {activeTab === 'quick' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Input Prompt / Human Guidance (Optional Edit)
                </label>
                <textarea
                  rows={4}
                  value={modifiedPrompt}
                  onChange={(e) => setModifiedPrompt(e.target.value)}
                  className="w-full text-xs font-mono p-3 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-gray-800"
                  placeholder="Modify the prompt passed to the graph..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Inject Simulated Specialist Output (Optional)
                </label>
                <textarea
                  rows={4}
                  value={modifiedResponse}
                  onChange={(e) => setModifiedResponse(e.target.value)}
                  className="w-full text-xs font-mono p-3 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-gray-800"
                  placeholder="Inject an alternate agent response before replaying downstream nodes..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Graph State Dict Updates (JSON)
              </label>
              <textarea
                rows={9}
                value={stateJson}
                onChange={(e) => setStateJson(e.target.value)}
                className={`w-full text-xs font-mono p-3 bg-gray-900 text-emerald-400 border rounded-md outline-none ${
                  jsonError ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {jsonError && <p className="text-xs text-red-600 font-semibold">{jsonError}</p>}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2.5 items-start text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Replaying will invoke the downstream nodes from this checkpoint forward. All checkpoints are stored persistently in PostgreSQL.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={closeReplayModal}
            disabled={isReplaying}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReplay}
            disabled={isReplaying}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            {isReplaying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Forking & Replaying...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Confirm & Replay Step
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
