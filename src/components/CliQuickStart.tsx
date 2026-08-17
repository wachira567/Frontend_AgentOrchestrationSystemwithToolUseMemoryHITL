import React, { useState } from 'react';
import { Terminal, Copy, Check, CheckCircle2, ChevronRight, Play } from 'lucide-react';

export const CliQuickStart: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const steps = [
    {
      title: '1. Initialize Repository & Workspace Directories',
      description: 'Create the isolated module structure for API, core configs, agents, memory layers, tools, and background worker.',
      commands: `# Initialize root directories
mkdir -p backend/src backend/scripts config

# Create internal app architecture
mkdir -p backend/app/api backend/app/core backend/app/agents \\
         backend/app/memory backend/app/tools backend/app/worker

# Touch python module entry points
touch backend/app/__init__.py backend/app/main.py`,
    },
    {
      title: '2. Setup Python Virtual Environment (3.11+)',
      description: 'Activate your isolated virtual environment and install dependencies from requirements.txt.',
      commands: `# Create virtual environment
python -m venv venv

# Activate virtualenv (Linux / macOS)
source venv/bin/activate

# On Windows:
# venv\\Scripts\\activate

# Install dependencies (FastAPI, Celery, Redis, SQLAlchemy, ChromaDB)
pip install -r backend/requirements.txt`,
    },
    {
      title: '3. Boot Infrastructure Containers via Docker Compose',
      description: 'Launch PostgreSQL 16, Redis 7.2, and ChromaDB 0.5 with pre-configured healthchecks and persistent volumes.',
      commands: `# Copy environment configuration template
cp config/.env.template .env

# Launch core databases & caches in detached mode
docker compose up -d postgres redis chromadb

# Verify container health status
docker compose ps`,
    },
    {
      title: '4. Initialize Database Tables & Run Schema Migrations',
      description: 'Create task_executions and agent_audit_logs tables in PostgreSQL via SQLAlchemy async engine.',
      commands: `# Run the async database schema bootstrap script
python backend/scripts/init_db.py`,
    },
    {
      title: '5. Launch Celery Agent Worker Swarm',
      description: 'Start the distributed Celery worker listening on agents, memory, and default queues.',
      commands: `# Launch worker process with concurrency 4
cd backend
celery -A app.core.celery_app.celery worker --loglevel=info -Q default,agents,memory`,
    },
    {
      title: '6. Run FastAPI Orchestration Gateway',
      description: 'Start the ASGI server with hot-reload for local development and automatic LangGraph table setup.',
      commands: `# Run Uvicorn development server from inside backend/
uvicorn app.main:app --reload

# Test Healthcheck endpoint:
curl http://localhost:8000/health`,
    },
  ];

  const handleCopy = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              Terminal Setup & Execution Blueprint
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Step-by-step commands to initialize the isolated backend, bootstrap Python venv, spin up Docker infrastructure, and run agent workers.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
            Python 3.11+ · Docker 24+
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">{step.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
              </div>
              <button
                onClick={() => handleCopy(step.commands, idx)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors shrink-0 ml-3"
              >
                {copiedIndex === idx ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedIndex === idx ? 'Copied' : 'Copy Block'}</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-300 overflow-x-auto">
              <pre className="whitespace-pre">{step.commands}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
