import React, { useState } from 'react';
import { Database, Copy, Check, Download, Sliders, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';

export const DockerComposeViewer: React.FC = () => {
  const [pgPort, setPgPort] = useState(5432);
  const [redisPort, setRedisPort] = useState(6379);
  const [chromaPort, setChromaPort] = useState(8000);
  const [backendPort, setBackendPort] = useState(8080);
  const [celeryConcurrency, setCeleryConcurrency] = useState(4);
  const [dbName, setDbName] = useState('agent_memory');
  const [dbUser, setDbUser] = useState('agent_user');
  const [dbPassword, setDbPassword] = useState('agent_password');
  const [composeMode, setComposeMode] = useState<'infrastructure' | 'full'>('infrastructure');
  const [copied, setCopied] = useState(false);

  const generateDockerCompose = () => {
    if (composeMode === 'infrastructure') {
      return `version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${dbUser}
      POSTGRES_PASSWORD: ${dbPassword}
      POSTGRES_DB: ${dbName}
    ports:
      - "${pgPort}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${dbUser} -d ${dbName}"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "${redisPort}:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "${chromaPort}:8000"
    volumes:
      - chroma_data:/chroma/chroma
    environment:
      - IS_PERSISTENT=TRUE

volumes:
  postgres_data:
  redis_data:
  chroma_data:`;
    }

    return `version: '3.8'

services:
  # 1. PostgreSQL - Persistent State, LangGraph Checkpoints, Task Records
  postgres:
    image: postgres:15-alpine
    container_name: orchestration_postgres
    restart: always
    environment:
      POSTGRES_USER: ${dbUser}
      POSTGRES_PASSWORD: ${dbPassword}
      POSTGRES_DB: ${dbName}
    ports:
      - "${pgPort}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${dbUser} -d ${dbName}"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 2. Redis - Celery Broker/Backend & Fast Working Memory (Short-Term Scratchpad)
  redis:
    image: redis:7-alpine
    container_name: orchestration_redis
    restart: always
    command: redis-server --appendonly yes
    ports:
      - "${redisPort}:6379"
    volumes:
      - redis_data:/data

  # 3. ChromaDB - Long-Term Semantic Vector Store & Agent Memory Retrieval
  chromadb:
    image: chromadb/chroma:latest
    container_name: orchestration_chromadb
    restart: always
    environment:
      - IS_PERSISTENT=TRUE
    ports:
      - "${chromaPort}:8000"
    volumes:
      - chroma_data:/chroma/chroma

  # 4. FastAPI Backend Service - Orchestration Gateway & Agent REST Endpoints
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: orchestration_backend
    restart: on-failure
    environment:
      - DATABASE_URL=postgresql+psycopg://${dbUser}:${dbPassword}@postgres:5432/${dbName}
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
      - CELERY_RESULT_BACKEND=redis://redis:6379/2
      - CHROMA_HOST=chromadb
      - CHROMA_PORT=8000
    ports:
      - "${backendPort}:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      chromadb:
        condition: service_started
    volumes:
      - ./backend/app:/app/app

  # 5. Celery Worker - Distributed Background Agent Task Executor
  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: orchestration_celery_worker
    restart: on-failure
    command: celery -A app.core.celery_app.celery worker --loglevel=info --concurrency=${celeryConcurrency} -Q default,agents,memory
    environment:
      - DATABASE_URL=postgresql+psycopg://${dbUser}:${dbPassword}@postgres:5432/${dbName}
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/1
      - CELERY_RESULT_BACKEND=redis://redis:6379/2
      - CHROMA_HOST=chromadb
      - CHROMA_PORT=8000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
      chromadb:
        condition: service_started
    volumes:
      - ./backend/app:/app/app

volumes:
  postgres_data:
  redis_data:
  chroma_data:`;
  };

  const dynamicYaml = generateDockerCompose();

  const handleCopy = () => {
    navigator.clipboard.writeText(dynamicYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([dynamicYaml], { type: 'text/yaml' });
    element.href = URL.createObjectURL(file);
    element.download = 'docker-compose.yml';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Parameter Tuner */}
      <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Compose Configurator</h3>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
            Live Spec
          </span>
        </div>

        <div className="space-y-3.5 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1.5">Compose Architecture Mode</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setComposeMode('infrastructure')}
                className={`py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
                  composeMode === 'infrastructure'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Core Infra (3 Services)
              </button>
              <button
                type="button"
                onClick={() => setComposeMode('full')}
                className={`py-1.5 px-2 rounded text-[11px] font-medium transition-all ${
                  composeMode === 'full'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Full Stack (5 Services)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-300 font-medium block mb-1">PostgreSQL Port</label>
              <input
                type="number"
                value={pgPort}
                onChange={(e) => setPgPort(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Redis Port</label>
              <input
                type="number"
                value={redisPort}
                onChange={(e) => setRedisPort(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">ChromaDB Port</label>
            <input
              type="number"
              value={chromaPort}
              onChange={(e) => setChromaPort(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {composeMode === 'full' && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
              <div>
                <label className="text-slate-300 font-medium block mb-1">FastAPI Port</label>
                <input
                  type="number"
                  value={backendPort}
                  onChange={(e) => setBackendPort(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Worker Concurrency</label>
                <input
                  type="number"
                  value={celeryConcurrency}
                  onChange={(e) => setCeleryConcurrency(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-300 font-medium block mb-1">Postgres Database Name</label>
            <input
              type="text"
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Postgres User</label>
              <input
                type="text"
                value={dbUser}
                onChange={(e) => setDbUser(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium block mb-1">Postgres Password</label>
              <input
                type="text"
                value={dbPassword}
                onChange={(e) => setDbPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
          <div className="text-emerald-400 font-semibold">Service Healthchecks:</div>
          <div>• Postgres: pg_isready verification</div>
          <div>• Redis: AUTH redis-cli ping check</div>
          <div>• ChromaDB: REST /api/v1/heartbeat</div>
        </div>
      </div>

      {/* Right Column: Generated docker-compose.yml YAML */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-slate-200">docker-compose.yml</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">v3.8 YAML</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy YAML'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-950 p-4 font-mono text-xs overflow-x-auto max-h-[560px] text-slate-300">
          <pre className="whitespace-pre text-slate-200">{dynamicYaml}</pre>
        </div>
      </div>
    </div>
  );
};
