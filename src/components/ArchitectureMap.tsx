import React, { useState } from 'react';
import { Database, Server, Cpu, HardDrive, CheckCircle2, ArrowRight, Copy, Check, Terminal, ExternalLink } from 'lucide-react';
import { ServiceNode } from '../types';

export const ArchitectureMap: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string>('redis');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const services: ServiceNode[] = [
    {
      id: 'postgres',
      name: 'PostgreSQL 16',
      category: 'database',
      image: 'postgres:16-alpine',
      port: 5432,
      internalPort: 5432,
      status: 'healthy',
      role: 'Persistent State & Audit Logs',
      details: {
        purpose: 'Stores durable task executions, finalized agent run summaries, audit trails, and transactional schemas.',
        connectionString: 'postgresql+asyncpg://postgres:postgres@localhost:5432/orchestration_db',
        keyConfigs: {
          'Storage Volume': 'postgres_data -> /var/lib/postgresql/data',
          'ORM Model': 'SQLAlchemy 2.0 AsyncSession (asyncpg)',
          'Default DB': 'orchestration_db',
          'Connection Pool': '10 active, max 20 overflow',
        },
      },
    },
    {
      id: 'redis',
      name: 'Redis 7.2',
      category: 'cache',
      image: 'redis:7.2-alpine',
      port: 6379,
      internalPort: 6379,
      status: 'healthy',
      role: 'Celery Broker & Short-Term Working Memory',
      details: {
        purpose: 'Provides ultra-fast in-memory scratchpad for active agent conversations (DB 0), Celery message queue broker (DB 1), and task results backend (DB 2).',
        connectionString: 'redis://:redispassword@localhost:6379/0',
        memoryType: 'Short-Term Ephemeral Scratchpad (TTL: 86400s)',
        keyConfigs: {
          'DB 0': 'Agent Working Memory & Active Session Scratchpad',
          'DB 1': 'Celery Task Queue Message Broker',
          'DB 2': 'Celery AsyncResult Backend',
          'Persistence': 'AOF (appendonly yes) enabled in Docker',
        },
      },
    },
    {
      id: 'chromadb',
      name: 'ChromaDB 0.5',
      category: 'vector',
      image: 'chromadb/chroma:0.5.5',
      port: 8000,
      internalPort: 8000,
      status: 'healthy',
      role: 'Long-Term Semantic Vector Memory',
      details: {
        purpose: 'High-performance vector database storing document embeddings, past research findings, and agent memories for RAG retrieval.',
        connectionString: 'http://localhost:8000/api/v1/heartbeat',
        memoryType: 'Long-Term Persistent Vector Store (Cosine Similarity)',
        keyConfigs: {
          'Storage Volume': 'chroma_data -> /chroma/chroma',
          'Default Collection': 'agent_knowledge_base',
          'Embedding Format': '768/1536-dim vector indexing',
          'Query Interface': 'HTTP REST Client via Chromadb SDK',
        },
      },
    },
    {
      id: 'backend',
      name: 'FastAPI Gateway',
      category: 'api',
      image: 'Dockerfile (Python 3.11)',
      port: 8080,
      internalPort: 8080,
      status: 'healthy',
      role: 'Orchestration Gateway & REST API',
      details: {
        purpose: 'Accepts incoming agent goal requests, manages session keys, coordinates memory retrievals, and dispatches tasks to Celery.',
        connectionString: 'http://localhost:8080/api/v1',
        keyConfigs: {
          'Framework': 'FastAPI 0.115 + Uvicorn ASGI',
          'API Docs': 'Swagger UI at /api/v1/docs',
          'Healthcheck': 'GET /api/v1/health',
          'CORS': 'Configured for local dev & previews',
        },
      },
    },
    {
      id: 'celery_worker',
      name: 'Celery Worker Swarm',
      category: 'worker',
      image: 'Dockerfile (Celery 5.4)',
      port: 'Dynamic',
      internalPort: 0,
      status: 'healthy',
      role: 'Distributed Background Agent Execution',
      details: {
        purpose: 'Executes autonomous multi-agent pipelines asynchronously: supervisor decomposition, research fact-finding, and memory indexing.',
        connectionString: 'celery -A app.core.celery_app.celery worker',
        keyConfigs: {
          'Concurrency': '4 Worker Threads per container',
          'Queues': 'default, agents, memory',
          'Task Serialization': 'JSON with UTC timestamping',
          'Timeout Limit': '3600 seconds per execution',
        },
      },
    },
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const selectedNode = services.find((s) => s.id === selectedService) || services[0];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              Isolated Multi-Agent Infrastructure Topology
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Deterministic separation of persistent transactional state, fast working scratchpad, long-term vector embeddings, and background workers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 font-mono">
              Bridge Network: orchestration_network
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Topology Graph Visualizer */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Layer: API Gateway & Celery Swarm */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* FastAPI Gateway */}
            <div
              onClick={() => setSelectedService('backend')}
              className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                selectedService === 'backend'
                  ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">FastAPI Gateway</h3>
                    <p className="text-xs text-slate-400">Port :8080 · Entrypoint</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-3 line-clamp-2">
                REST Endpoints, Swagger UI docs, session orchestrator, and pipeline dispatcher.
              </p>
            </div>

            {/* Celery Worker Swarm */}
            <div
              onClick={() => setSelectedService('celery_worker')}
              className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
                selectedService === 'celery_worker'
                  ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Celery Worker Swarm</h3>
                    <p className="text-xs text-slate-400">Concurrency: 4 · 3 Queues</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-3 line-clamp-2">
                Asynchronous agent runners: Supervisor task decomposition & Deep Research workers.
              </p>
            </div>
          </div>

          {/* Middle Flow Indicator */}
          <div className="md:col-span-3 flex items-center justify-center py-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800">
              <span>Async Task Dispatch & Shared Infrastructure Interconnect</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Bottom Layer: 3 Distinct Storage & Memory Engines */}
          {/* 1. PostgreSQL */}
          <div
            onClick={() => setSelectedService('postgres')}
            className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
              selectedService === 'postgres'
                ? 'bg-slate-900 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">PostgreSQL 16</h3>
                  <p className="text-xs text-slate-400">Port :5432 · Persistent</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono font-semibold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                Persistent State
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Task runs, finalized outputs, execution schemas, and audit logs.
            </p>
          </div>

          {/* 2. Redis */}
          <div
            onClick={() => setSelectedService('redis')}
            className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
              selectedService === 'redis'
                ? 'bg-slate-900 border-rose-500 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Redis 7.2</h3>
                  <p className="text-xs text-slate-400">Port :6379 · In-Memory</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono font-semibold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">
                Working Memory
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Short-term agent scratchpad logs & Celery task message broker.
            </p>
          </div>

          {/* 3. ChromaDB */}
          <div
            onClick={() => setSelectedService('chromadb')}
            className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
              selectedService === 'chromadb'
                ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">ChromaDB 0.5</h3>
                  <p className="text-xs text-slate-400">Port :8000 · Vector Store</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
                Semantic Memory
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Long-term vector knowledge base with cosine similarity search.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Service Inspector Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-semibold text-slate-100">{selectedNode.name}</h3>
              <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono">
                {selectedNode.image}
              </span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                {selectedNode.role}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{selectedNode.details.purpose}</p>
          </div>

          {selectedNode.details.memoryType && (
            <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300">
              Memory Tier: {selectedNode.details.memoryType}
            </div>
          )}
        </div>

        {/* Connection String & Key Specs */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Connection String URI</h4>
            <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-emerald-300 break-all">
              <span>{selectedNode.details.connectionString}</span>
              <button
                onClick={() => handleCopy(selectedNode.details.connectionString, 'conn')}
                className="ml-2 p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Copy URI"
              >
                {copiedKey === 'conn' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2">Key Configuration Parameters</h4>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 space-y-1 text-xs">
              {Object.entries(selectedNode.details.keyConfigs).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center py-0.5 border-b border-slate-800/60 last:border-0">
                  <span className="text-slate-400 font-mono">{key}:</span>
                  <span className="text-slate-200 font-mono font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
