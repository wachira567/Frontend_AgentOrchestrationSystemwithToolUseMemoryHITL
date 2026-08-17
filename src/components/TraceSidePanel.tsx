import React, { useState } from 'react';
import { useAgentStore } from '../store/useAgentStore';
import {
  X,
  Copy,
  Check,
  Cpu,
  Coins,
  Wrench,
  MessageSquare,
  Sparkles,
  Layers,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Activity,
  RotateCcw,
  GitFork
} from 'lucide-react';

export const TraceSidePanel: React.FC = () => {
  const {
    isSidePanelOpen,
    closeSidePanel,
    selectedNodeId,
    selectedNodeDetails,
    isNodeDetailsLoading,
    nodeDetailsError,
    activeThreadId,
    openReplayModal
  } = useAgentStore();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeViewTab, setActiveViewTab] = useState<'details' | 'raw_json'>('details');

  if (!isSidePanelOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
            <Activity className="w-3 h-3 animate-pulse" /> Running
          </span>
        );
      case 'waiting_approval':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3" /> Waiting Approval
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      default:
        return (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity"
        onClick={closeSidePanel}
      />

      {/* Slide-over container */}
      <div className="relative w-screen max-w-xl bg-white shadow-2xl border-l border-gray-200 flex flex-col z-10 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-200 bg-gray-50/80 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedNodeDetails?.node_label || selectedNodeId}
              </h2>
              {getStatusBadge(selectedNodeDetails?.status)}
            </div>
            <p className="text-xs font-mono text-gray-500">
              Node ID: <span className="text-blue-600 font-semibold">{selectedNodeId}</span>
              {selectedNodeDetails?.step && ` • Step #${selectedNodeDetails.step}`}
              {selectedNodeDetails?.checkpoint_id && ` • Ckpt: ${selectedNodeDetails.checkpoint_id.slice(0, 8)}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedNodeDetails && (
              <button
                onClick={openReplayModal}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-1.5 shadow-xs transition-colors"
                title="Replay or Fork execution from this node state"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Replay from Step
              </button>
            )}
            <button
              onClick={closeSidePanel}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 bg-white px-5 pt-2">
          <button
            onClick={() => setActiveViewTab('details')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeViewTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Node Inspection
          </button>
          <button
            onClick={() => setActiveViewTab('raw_json')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeViewTab === 'raw_json'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Raw Checkpoint JSON
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50">
          {isNodeDetailsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-medium text-gray-500">Inspecting checkpoint state...</p>
            </div>
          ) : nodeDetailsError ? (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4" /> Trace Inspection Error
              </div>
              <p className="text-xs">{nodeDetailsError}</p>
              {!activeThreadId && (
                <p className="text-xs text-red-600 mt-1">
                  Tip: Execute a task first so LangGraph generates checkpoints for inspection.
                </p>
              )}
            </div>
          ) : selectedNodeDetails ? (
            activeViewTab === 'details' ? (
              <>
                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                      <Cpu className="w-3.5 h-3.5 text-indigo-500" /> Prompt Tokens
                    </div>
                    <span className="text-base font-bold text-gray-800">
                      {selectedNodeDetails.token_usage?.prompt_tokens ?? '--'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Output Tokens
                    </div>
                    <span className="text-base font-bold text-gray-800">
                      {selectedNodeDetails.token_usage?.completion_tokens ?? '--'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                      <Layers className="w-3.5 h-3.5 text-blue-500" /> Total Tokens
                    </div>
                    <span className="text-base font-bold text-gray-800">
                      {selectedNodeDetails.token_usage?.total_tokens ?? '--'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-xs">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-1">
                      <Coins className="w-3.5 h-3.5 text-emerald-500" /> Est. Cost
                    </div>
                    <span className="text-base font-bold text-emerald-600">
                      ${selectedNodeDetails.token_usage?.estimated_cost_usd?.toFixed(6) ?? '0.000000'}
                    </span>
                  </div>
                </div>

                {/* Subtask Context (if specialist) */}
                {selectedNodeDetails.subtask && (
                  <div className="bg-white rounded-lg border border-blue-200 p-4 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        Specialist: {selectedNodeDetails.subtask.assigned_specialist}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        Task #{selectedNodeDetails.subtask.task_id}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedNodeDetails.subtask.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">Expected Output:</span> {selectedNodeDetails.subtask.expected_output}
                    </div>
                  </div>
                )}

                {/* LLM Prompt Section */}
                {selectedNodeDetails.prompt && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                    <div className="px-4 py-2.5 bg-gray-100/70 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> LLM Prompt / Input
                      </div>
                      <button
                        onClick={() => handleCopy(selectedNodeDetails.prompt || '', 'prompt')}
                        className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
                      >
                        {copiedKey === 'prompt' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                        {copiedKey === 'prompt' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-3.5 bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-56">
                      {selectedNodeDetails.prompt}
                    </div>
                  </div>
                )}

                {/* LLM Response / Output Section */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-gray-100/70 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Node Response / Output
                    </div>
                    <button
                      onClick={() => handleCopy(selectedNodeDetails.response || '', 'response')}
                      className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === 'response' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === 'response' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-3.5 font-mono text-xs text-gray-800 bg-white overflow-x-auto whitespace-pre-wrap max-h-64 border-b border-gray-100">
                    {selectedNodeDetails.response || 'No response payload recorded.'}
                  </div>
                </div>

                {/* Tool Invocations */}
                {selectedNodeDetails.tool_calls && selectedNodeDetails.tool_calls.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                    <div className="px-4 py-2.5 bg-gray-100/70 border-b border-gray-200 flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <Wrench className="w-3.5 h-3.5 text-purple-600" />
                      Tool Invocations ({selectedNodeDetails.tool_calls.length})
                    </div>
                    <div className="p-3.5 space-y-3">
                      {selectedNodeDetails.tool_calls.map((tool, idx) => (
                        <div key={idx} className="p-3 bg-purple-50/50 rounded-md border border-purple-200 text-xs space-y-1.5 font-mono">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-800">{tool.name}</span>
                            <span className="text-[10px] text-purple-600 font-sans uppercase">Tool Call #{idx + 1}</span>
                          </div>
                          {tool.args && (
                            <div>
                              <span className="text-gray-500 font-sans text-[11px] block mb-0.5">Arguments:</span>
                              <pre className="bg-white p-2 rounded border border-purple-100 text-[11px] overflow-x-auto text-gray-800">
                                {typeof tool.args === 'object' ? JSON.stringify(tool.args, null, 2) : tool.args}
                              </pre>
                            </div>
                          )}
                          {tool.output && (
                            <div>
                              <span className="text-gray-500 font-sans text-[11px] block mb-0.5">Result:</span>
                              <pre className="bg-white p-2 rounded border border-purple-100 text-[11px] overflow-x-auto text-gray-800">
                                {tool.output}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* State Snapshot Info */}
                {selectedNodeDetails.state_snapshot && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3.5 shadow-xs space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-gray-500" /> Execution Metadata
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-gray-600 font-mono text-[11px]">
                      <div>Total Messages: <span className="font-semibold text-gray-900">{selectedNodeDetails.state_snapshot.total_messages ?? 0}</span></div>
                      <div>Task Index: <span className="font-semibold text-gray-900">{selectedNodeDetails.state_snapshot.current_task_index ?? 0}</span></div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Raw Checkpoint JSON View */
              <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-100/70 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-gray-700">JSON Payload</span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedNodeDetails, null, 2), 'raw_json')}
                    className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
                  >
                    {copiedKey === 'raw_json' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'raw_json' ? 'Copied' : 'Copy JSON'}
                  </button>
                </div>
                <pre className="p-4 bg-gray-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[600px] leading-relaxed">
                  {JSON.stringify(selectedNodeDetails, null, 2)}
                </pre>
              </div>
            )
          ) : (
            <div className="text-center text-gray-400 py-20 text-sm">
              Click any node in the Trace Explorer to inspect its execution checkpoint.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
