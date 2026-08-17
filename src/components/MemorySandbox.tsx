import React, { useState } from 'react';
import { HardDrive, Database, Search, Plus, Sparkles, Tag, Layers, RefreshCw } from 'lucide-react';
import { MemoryRecord } from '../types';

export const MemorySandbox: React.FC = () => {
  const [activeMemoryTab, setActiveMemoryTab] = useState<'chroma' | 'redis'>('chroma');
  const [searchQuery, setSearchQuery] = useState('');
  const [newDocText, setNewDocText] = useState('');
  const [newDocTag, setNewDocTag] = useState('research');

  // Long-term Semantic vector memories (ChromaDB)
  const [vectorMemories, setVectorMemories] = useState<MemoryRecord[]>([
    {
      id: 'mem_01a8f9c2',
      type: 'long-term',
      source: 'research_agent',
      content: 'Multi-agent orchestration architecture requires strict isolation between fast ephemeral state (Redis) and durable ACID state (PostgreSQL).',
      metadata: { collection: 'agent_knowledge_base', domain: 'architecture', confidence: 0.96 },
      score: 0.94,
      timestamp: '2026-08-17 10:45:12',
    },
    {
      id: 'mem_02b9d3e1',
      type: 'long-term',
      source: 'crawler_tool',
      content: 'ChromaDB provides native HNSW indexing for rapid cosine and Euclidean distance vector retrieval across million-scale embeddings.',
      metadata: { collection: 'agent_knowledge_base', domain: 'vector_search', confidence: 0.91 },
      score: 0.88,
      timestamp: '2026-08-17 10:46:05',
    },
    {
      id: 'mem_03c7e4f0',
      type: 'long-term',
      source: 'supervisor_agent',
      content: 'Celery worker task routing to dedicated queues (agents, memory, default) prevents memory index spikes from blocking time-sensitive agent reasoning.',
      metadata: { collection: 'agent_knowledge_base', domain: 'queues', confidence: 0.98 },
      score: 0.82,
      timestamp: '2026-08-17 10:47:19',
    },
  ]);

  // Short-term Working Memory Scratchpad (Redis)
  const [workingLogs, setWorkingLogs] = useState([
    { id: '1', key: 'session:sess_9f3a1:active_goal', value: '"Analyze AI orchestrator infrastructure patterns"', ttl: '3540s' },
    { id: '2', key: 'session:sess_9f3a1:supervisor_state', value: '{"phase": "delegated", "worker_count": 2}', ttl: '3540s' },
    { id: '3', key: 'scratchpad:sess_9f3a1:[0]', value: '{"timestamp": 1723891500, "event": "INIT", "agent": "supervisor"}', ttl: '86200s' },
    { id: '4', key: 'scratchpad:sess_9f3a1:[1]', value: '{"timestamp": 1723891512, "event": "VECTOR_QUERY", "agent": "researcher"}', ttl: '86200s' },
  ]);

  const handleAddVectorMemory = () => {
    if (!newDocText.trim()) return;
    const newRecord: MemoryRecord = {
      id: `mem_${Math.random().toString(36).substring(2, 10)}`,
      type: 'long-term',
      source: 'user_ingestion',
      content: newDocText,
      metadata: { collection: 'agent_knowledge_base', domain: newDocTag, confidence: 1.0 },
      score: 0.99,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setVectorMemories([newRecord, ...vectorMemories]);
    setNewDocText('');
  };

  const filteredMemories = vectorMemories.filter((m) =>
    searchQuery ? m.content.toLowerCase().includes(searchQuery.toLowerCase()) || (m.metadata?.domain && m.metadata.domain.toLowerCase().includes(searchQuery.toLowerCase())) : true
  );

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveMemoryTab('chroma')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMemoryTab === 'chroma'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span>ChromaDB: Long-Term Semantic Memory</span>
          </button>
          <button
            onClick={() => setActiveMemoryTab('redis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeMemoryTab === 'redis'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HardDrive className="w-4 h-4 text-rose-400" />
            <span>Redis: Short-Term Working Scratchpad</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center text-xs font-mono text-slate-400">
          Dual Memory Architecture v1.0
        </div>
      </div>

      {activeMemoryTab === 'chroma' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Semantic Ingestion Form */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-200">Index New Semantic Knowledge</h3>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">
                Vector Embeddings
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Document / Finding Text</label>
                <textarea
                  value={newDocText}
                  onChange={(e) => setNewDocText(e.target.value)}
                  rows={4}
                  placeholder="Paste context, research notes, or tool execution outcomes..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Knowledge Domain Tag</label>
                <input
                  type="text"
                  value={newDocTag}
                  onChange={(e) => setNewDocTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="e.g. architecture, benchmarks, apis"
                />
              </div>

              <button
                onClick={handleAddVectorMemory}
                disabled={!newDocText.trim()}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-amber-500/20"
              >
                Store in ChromaDB Collection
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
              <div className="text-amber-400 font-semibold">ChromaDB Specs:</div>
              <div>• Distance Metric: Cosine Similarity</div>
              <div>• Collection: agent_knowledge_base</div>
              <div>• Persistence: /chroma/chroma (Mounted Volume)</div>
            </div>
          </div>

          {/* Right Column: Search & Memory Inspection */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Semantic Search & Vector Results</h3>
                <p className="text-xs text-slate-400">Query top-K nearest neighbors using cosine similarity</p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search semantic memory..."
                  className="bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono w-full sm:w-56"
                />
              </div>
            </div>

            {/* Memory List */}
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {filteredMemories.map((mem) => (
                <div key={mem.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">{mem.id}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        {mem.metadata.domain}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Cosine Sim: {(mem.score! * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{mem.content}</p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                    <span>Source: {mem.source}</span>
                    <span>{mem.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Redis Working Memory View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Redis Ephemeral Session Scratchpad (DB 0)</h3>
              <p className="text-xs text-slate-400">Fast in-memory key-value cache holding active agent context and logs</p>
            </div>
            <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
              Active Keys: {workingLogs.length}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-900/90 px-4 py-2.5 text-xs font-mono font-semibold text-slate-400 border-b border-slate-800">
              <div className="col-span-4">Redis Key Pattern</div>
              <div className="col-span-6">In-Memory Payload (JSON)</div>
              <div className="col-span-2 text-right">TTL</div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {workingLogs.map((log) => (
                <div key={log.id} className="grid grid-cols-12 px-4 py-3 text-xs font-mono items-center hover:bg-slate-900/40">
                  <div className="col-span-4 text-rose-300 font-semibold truncate pr-2">{log.key}</div>
                  <div className="col-span-6 text-slate-300 truncate pr-2">{log.value}</div>
                  <div className="col-span-2 text-right text-slate-400 font-mono">{log.ttl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
