import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, CheckCircle2, Clock, Terminal, Cpu, Database, HardDrive, ArrowRight, Sparkles } from 'lucide-react';
import { SimulationStep } from '../types';

export const PipelineSimulator: React.FC = () => {
  const [goal, setGoal] = useState('Analyze AI orchestrator infrastructure patterns and index vector benchmarks');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const presets = [
    'Analyze AI orchestrator infrastructure patterns and index vector benchmarks',
    'Extract financial metrics from filings and store semantic citations in ChromaDB',
    'Generate deterministic unit test suite for asynchronous Celery worker tasks',
  ];

  const steps: SimulationStep[] = [
    {
      id: 'step-1',
      stepNumber: 1,
      stage: 'REST Gateway Ingestion',
      service: 'FastAPI (Port :8080)',
      action: 'Receive POST /api/v1/pipeline/trigger, validate Pydantic schema, generate session_id',
      status: 'pending',
      timestamp: '00:00.000',
      durationMs: 400,
    },
    {
      id: 'step-2',
      stepNumber: 2,
      stage: 'Working Memory Init',
      service: 'Redis DB 0',
      action: 'Set session state session:sess_9f3a1:active_goal and push event to scratchpad list',
      status: 'pending',
      timestamp: '00:00.400',
      durationMs: 600,
    },
    {
      id: 'step-3',
      stepNumber: 3,
      stage: 'Queue Task Dispatch',
      service: 'Celery Broker (Redis DB 1)',
      action: "Publish task app.worker.tasks.orchestrate_agent_pipeline to 'agents' queue",
      status: 'pending',
      timestamp: '00:01.000',
      durationMs: 500,
    },
    {
      id: 'step-4',
      stepNumber: 4,
      stage: 'Supervisor Decomposition',
      service: 'Celery Worker Swarm',
      agent: 'OrchestrationSupervisor',
      action: 'Decompose goal into 2 deterministic subtasks (Semantic Fact-Finding & Architecture Formulation)',
      status: 'pending',
      timestamp: '00:01.500',
      durationMs: 1200,
    },
    {
      id: 'step-5',
      stepNumber: 5,
      stage: 'Vector Memory Retrieval',
      service: 'ChromaDB (Port :8000)',
      agent: 'DeepResearchAgent',
      action: 'Query cosine similarity embeddings in agent_knowledge_base collection',
      status: 'pending',
      timestamp: '00:02.700',
      durationMs: 1000,
    },
    {
      id: 'step-6',
      stepNumber: 6,
      stage: 'Persistent State Commit',
      service: 'PostgreSQL 16 (Port :5432)',
      action: 'SQLAlchemy AsyncSession commit to task_executions & agent_audit_logs tables',
      status: 'pending',
      timestamp: '00:03.700',
      durationMs: 600,
    },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && currentStepIndex < steps.length) {
      const step = steps[currentStepIndex];
      timer = setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [${step.service}] ${step.action}`,
        ]);

        if (currentStepIndex === steps.length - 1) {
          setIsRunning(false);
          setExecutionResult({
            task_id: 'celery_task_9c82b1fa',
            session_id: 'sess_9f3a1e48',
            status: 'SUCCESS',
            goal: goal,
            metrics: {
              total_latency_ms: 4300,
              redis_scratchpad_keys: 4,
              chroma_vectors_queried: 5,
              postgres_rows_committed: 2,
            },
            supervisor_decomposition: {
              subtasks: [
                { id: 'subtask-1', type: 'semantic_research', query: `Analyze fundamentals of: ${goal}` },
                { id: 'subtask-2', type: 'architecture_synthesis', query: `Formulate actionable infrastructure plan` },
              ],
            },
            completed_at: new Date().toISOString(),
          });
        } else {
          setCurrentStepIndex((prev) => prev + 1);
        }
      }, step.durationMs);
    }
    return () => clearTimeout(timer);
  }, [isRunning, currentStepIndex]);

  const handleStartSimulation = () => {
    setLogs([`[${new Date().toLocaleTimeString()}] 🚀 Initiating multi-agent orchestration pipeline...`]);
    setExecutionResult(null);
    setCurrentStepIndex(0);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentStepIndex(-1);
    setLogs([]);
    setExecutionResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-slate-100">Interactive Pipeline Simulator</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Simulates Celery Worker & Redis/Chroma/Postgres Interop</span>
        </div>

        {/* Goal Input & Presets */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-slate-300 block">Agent Directives / User Goal</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={isRunning}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-50"
              placeholder="Enter orchestration goal..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleStartSimulation}
                disabled={isRunning || !goal.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-emerald-500/20"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isRunning ? 'Orchestrating...' : 'Trigger Pipeline'}</span>
              </button>
              <button
                onClick={handleReset}
                disabled={isRunning && currentStepIndex === -1}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400">Presets:</span>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setGoal(preset)}
                disabled={isRunning}
                className="text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/60 truncate max-w-xs transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Pipeline Stages */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Pipeline Execution Stages
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {steps.map((step, idx) => {
            const isCompleted = currentStepIndex > idx || (currentStepIndex === steps.length - 1 && !isRunning && executionResult);
            const isCurrent = currentStepIndex === idx && isRunning;
            const isPending = currentStepIndex < idx;

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                    : isCompleted
                    ? 'bg-slate-900/80 border-slate-700/80 text-slate-200'
                    : 'bg-slate-900/30 border-slate-800/50 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono font-semibold text-slate-400">
                    Step {step.stepNumber}
                  </span>
                  {isCurrent ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono animate-pulse">
                      <Clock className="w-3 h-3" /> Running
                    </span>
                  ) : isCompleted ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">Pending</span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-200">{step.stage}</h4>
                <div className="text-[11px] text-emerald-400/90 font-mono mt-0.5">{step.service}</div>
                {step.agent && (
                  <span className="inline-block text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono mt-1">
                    Agent: {step.agent}
                  </span>
                )}
                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{step.action}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Logs & Output Payload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Terminal Log Console */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-semibold text-slate-300">Live Orchestration Logs</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{logs.length} events</span>
          </div>
          <div className="p-4 font-mono text-xs text-slate-300 space-y-1.5 max-h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-slate-400 italic">Click "Trigger Pipeline" to view real-time log events...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="leading-relaxed border-l-2 border-slate-800 pl-2">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Final Execution Result Payload */}
        <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-semibold text-slate-300">Persisted Response Payload</span>
            </div>
            {executionResult && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                SUCCESS
              </span>
            )}
          </div>
          <div className="p-4 font-mono text-xs text-slate-300 max-h-64 overflow-y-auto">
            {executionResult ? (
              <pre className="text-emerald-300 whitespace-pre-wrap">
                {JSON.stringify(executionResult, null, 2)}
              </pre>
            ) : (
              <div className="text-slate-400 italic">Awaiting task completion for JSON payload...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
