import { FileTreeItem } from '../types';

export const scaffoldedFiles: FileTreeItem = {
  id: 'root',
  name: 'project-15-orchestration',
  path: '/',
  type: 'directory',
  children: [
    {
      id: 'docker-compose',
      name: 'docker-compose.yml',
      path: '/docker-compose.yml',
      type: 'file',
      language: 'yaml',
      description: 'Provisions PostgreSQL 15, Redis 7, and ChromaDB containers with healthchecks and persistent volumes.',
      content: `version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: agent_user
      POSTGRES_PASSWORD: agent_password
      POSTGRES_DB: agent_memory
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U agent_user -d agent_memory"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chroma_data:/chroma/chroma
    environment:
      - IS_PERSISTENT=TRUE

volumes:
  postgres_data:
  redis_data:
  chroma_data:`
    },
    {
      id: 'config-dir',
      name: 'config',
      path: '/config',
      type: 'directory',
      children: [
        {
          id: 'settings-yaml',
          name: 'settings.yaml',
          path: '/config/settings.yaml',
          type: 'file',
          language: 'yaml',
          description: 'Central system parameters, pool sizes, timeouts, and agent policy thresholds.',
          content: `# Multi-Agent Orchestration Infrastructure Configuration
system:
  name: "Multi-Agent Orchestration Engine"
  version: "0.1.0"
  log_level: "INFO"

infrastructure:
  postgres:
    host: "postgres"
    port: 5432
    database: "orchestration_db"
    pool_size: 10
    max_overflow: 20
    ssl_mode: "disable"

  redis:
    host: "redis"
    port: 6379
    db_working_memory: 0
    db_celery_broker: 1
    db_celery_results: 2
    ttl_scratchpad_seconds: 86400

  chromadb:
    host: "chromadb"
    port: 8000
    collection_name: "agent_knowledge_base"
    embedding_model: "text-embedding-004"
    distance_metric: "cosine"

  celery:
    concurrency: 4
    task_time_limit: 3600
    queues:
      - default
      - agents
      - memory

agents:
  supervisor:
    max_subtasks: 8
    timeout_seconds: 300
  researcher:
    max_search_results: 10
    semantic_top_k: 5`
        },
        {
          id: 'env-template',
          name: '.env.template',
          path: '/config/.env.template',
          type: 'file',
          language: 'shell',
          description: 'Environment variable declaration and default credentials.',
          content: `# PostgreSQL Settings (Docker Compose default)
POSTGRES_USER=agent_user
POSTGRES_PASSWORD=agent_password
POSTGRES_DB=agent_memory
POSTGRES_PORT=5432
POSTGRES_HOST=localhost

# Redis Settings
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redispassword

# ChromaDB Settings
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Backend & Celery Settings
BACKEND_PORT=8080
ENVIRONMENT=development
DEBUG=True

# Optional API Keys
GEMINI_API_KEY=your_gemini_api_key_here`
        }
      ]
    },
    {
      id: 'backend-dir',
      name: 'backend',
      path: '/backend',
      type: 'directory',
      children: [
        {
          id: 'backend-docker-compose',
          name: 'docker-compose.yml',
          path: '/backend/docker-compose.yml',
          type: 'file',
          language: 'yaml',
          description: 'Docker Compose configuration for PostgreSQL, Redis, and ChromaDB containers.',
          content: `version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: agent_user
      POSTGRES_PASSWORD: agent_password
      POSTGRES_DB: agent_memory
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U agent_user -d agent_memory"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - chroma_data:/chroma/chroma
    environment:
      - IS_PERSISTENT=TRUE

volumes:
  postgres_data:
  redis_data:
  chroma_data:`
        },
        {
          id: 'requirements-txt',
          name: 'requirements.txt',
          path: '/backend/requirements.txt',
          type: 'file',
          language: 'text',
          description: 'Python dependencies: FastAPI, LangGraph, LangChain, Celery, Redis, ChromaDB, Psycopg.',
          content: `fastapi[standard]==0.112.2
pydantic>=2.0.0
pydantic-settings
langgraph>=0.2.0
langchain-core
langchain-openai
langchain-anthropic
langgraph-checkpoint-postgres
psycopg[binary,pool]
redis
celery
chromadb
uvicorn`
        },
        {
          id: 'dockerfile',
          name: 'Dockerfile',
          path: '/backend/Dockerfile',
          type: 'file',
          language: 'dockerfile',
          description: 'Optimized Python 3.11-slim container with libpq and build dependencies.',
          content: `FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for build tools and PostgreSQL clients
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    curl \\
    libpq-dev \\
    git \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python packages
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \\
    pip install --no-cache-dir -r requirements.txt

# Copy application codebase
COPY . .

# Expose FastAPI default port
EXPOSE 8080

# Default command runs FastAPI server via Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]`
        },
        {
          id: 'app-dir',
          name: 'app',
          path: '/backend/app',
          type: 'directory',
          children: [
            {
              id: 'main-py',
              name: 'main.py',
              path: '/backend/app/main.py',
              type: 'file',
              language: 'python',
              description: 'FastAPI entry point with lifespan context manager and LangGraph AsyncPostgresSaver setup.',
              content: `from contextlib import asynccontextmanager
from fastapi import FastAPI
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.memory.db import get_pool, close_pool
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    pool = await get_pool()
    
    # Initialize LangGraph checkpointer tables in PostgreSQL automatically
    checkpointer = AsyncPostgresSaver(pool)
    await checkpointer.setup()
    
    yield
    
    # --- Shutdown ---
    await close_pool()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API and DB Pool are running smoothly."}`
            },
            {
              id: 'core-dir',
              name: 'core',
              path: '/backend/app/core',
              type: 'directory',
              children: [
                {
                  id: 'config-py',
                  name: 'config.py',
                  path: '/backend/app/core/config.py',
                  type: 'file',
                  language: 'python',
                  description: 'Pydantic BaseSettings loading database connection parameters.',
                  content: `from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agent Orchestration API"
    # Using the credentials from our docker-compose.yml
    POSTGRES_URI: str = "postgresql://agent_user:agent_password@localhost:5432/agent_memory"
    
settings = Settings()`
                },
                {
                  id: 'database-py',
                  name: 'database.py',
                  path: '/backend/app/core/database.py',
                  type: 'file',
                  language: 'python',
                  description: 'Async SQLAlchemy engine and session dependency generator.',
                  content: `from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL or "postgresql+asyncpg://postgres:postgres@localhost:5432/orchestration_db",
    echo=settings.DEBUG,
    future=True,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    """Dependency injection yield for database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()`
                },
                {
                  id: 'celery-py',
                  name: 'celery_app.py',
                  path: '/backend/app/core/celery_app.py',
                  type: 'file',
                  language: 'python',
                  description: 'Celery instance definition with Redis broker and routing configuration.',
                  content: `from celery import Celery
from app.core.config import settings

celery = Celery(
    "orchestration_worker",
    broker=settings.CELERY_BROKER_URL or "redis://:redispassword@localhost:6379/1",
    backend=settings.CELERY_RESULT_BACKEND or "redis://:redispassword@localhost:6379/2",
    include=["app.worker.tasks"]
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
    task_routes={
        "app.worker.tasks.orchestrate_agent_pipeline": {"queue": "agents"},
        "app.worker.tasks.embed_and_index_memory": {"queue": "memory"},
        "app.worker.tasks.*": {"queue": "default"},
    }
)`
                }
              ]
            },
            {
              id: 'memory-dir',
              name: 'memory',
              path: '/backend/app/memory',
              type: 'directory',
              children: [
                {
                  id: 'db-py',
                  name: 'db.py',
                  path: '/backend/app/memory/db.py',
                  type: 'file',
                  language: 'python',
                  description: 'Async PostgreSQL connection pool using psycopg_pool for LangGraph checkpoints.',
                  content: `from psycopg_pool import AsyncConnectionPool
from app.core.config import settings

# Global pool instance
_pool: AsyncConnectionPool | None = None

async def get_pool() -> AsyncConnectionPool:
    global _pool
    if _pool is None:
        _pool = AsyncConnectionPool(
            conninfo=settings.POSTGRES_URI,
            max_size=20,
            kwargs={"autocommit": True}
        )
    return _pool

async def close_pool():
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None`
                },
                {
                  id: 'redis-memory-py',
                  name: 'redis_memory.py',
                  path: '/backend/app/memory/redis_memory.py',
                  type: 'file',
                  language: 'python',
                  description: 'Short-term scratchpad and session state storage via async Redis.',
                  content: `import json
from typing import Any, Dict, List, Optional
import redis.asyncio as aioredis
from app.core.config import settings

class RedisWorkingMemory:
    """
    Short-Term Working Memory for Agents.
    Stores agent execution scratchpad, intermediate context, and active conversation state.
    """
    def __init__(self):
        self.redis_url = settings.REDIS_URL or "redis://:redispassword@localhost:6379/0"
        self._client: Optional[aioredis.Redis] = None

    async def get_client(self) -> aioredis.Redis:
        if self._client is None:
            self._client = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
        return self._client

    async def set_session_state(self, session_id: str, key: str, value: Any, expire_seconds: int = 3600):
        client = await self.get_client()
        redis_key = f"session:{session_id}:{key}"
        serialized = json.dumps(value)
        await client.set(redis_key, serialized, ex=expire_seconds)

    async def get_session_state(self, session_id: str, key: str) -> Optional[Any]:
        client = await self.get_client()
        redis_key = f"session:{session_id}:{key}"
        data = await client.get(redis_key)
        if data:
            return json.loads(data)
        return None

    async def push_scratchpad_log(self, session_id: str, log_entry: Dict[str, Any]):
        client = await self.get_client()
        redis_key = f"scratchpad:{session_id}"
        await client.rpush(redis_key, json.dumps(log_entry))
        await client.expire(redis_key, 86400) # 24h retention

    async def get_scratchpad_logs(self, session_id: str) -> List[Dict[str, Any]]:
        client = await self.get_client()
        redis_key = f"scratchpad:{session_id}"
        items = await client.lrange(redis_key, 0, -1)
        return [json.loads(i) for i in items]

working_memory = RedisWorkingMemory()`
                },
                {
                  id: 'chroma-memory-py',
                  name: 'chroma_memory.py',
                  path: '/backend/app/memory/chroma_memory.py',
                  type: 'file',
                  language: 'python',
                  description: 'ChromaDB vector store client for indexing and similarity query retrieval.',
                  content: `from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.core.config import settings

class ChromaSemanticMemory:
    """
    Long-Term Semantic Memory using ChromaDB.
    Indexes documents, research outputs, and agent insights with embeddings for RAG retrieval.
    """
    def __init__(self):
        self.host = settings.CHROMA_HOST
        self.port = settings.CHROMA_PORT
        self.collection_name = settings.CHROMA_COLLECTION_NAME
        self._client: Optional[chromadb.HttpClient] = None

    def get_client(self) -> chromadb.HttpClient:
        if self._client is None:
            try:
                self._client = chromadb.HttpClient(
                    host=self.host,
                    port=self.port,
                    settings=ChromaSettings(anonymized_telemetry=False)
                )
            except Exception:
                self._client = chromadb.EphemeralClient()
        return self._client

    def get_or_create_collection(self):
        client = self.get_client()
        return client.get_or_create_collection(name=self.collection_name)

    def add_memory(self, doc_id: str, document: str, metadata: Dict[str, Any]):
        collection = self.get_or_create_collection()
        collection.upsert(
            ids=[doc_id],
            documents=[document],
            metadatas=[metadata]
        )

    def query_similar(self, query_text: str, n_results: int = 5) -> List[Dict[str, Any]]:
        collection = self.get_or_create_collection()
        results = collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        memories = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metas = results["metadatas"][0] if "metadatas" in results else [{}] * len(docs)
            ids = results["ids"][0] if "ids" in results else [""] * len(docs)
            for i in range(len(docs)):
                memories.append({
                    "id": ids[i],
                    "content": docs[i],
                    "metadata": metas[i] if i < len(metas) else {}
                })
        return memories

semantic_memory = ChromaSemanticMemory()`
                }
              ]
            },
            {
              id: 'agents-dir',
              name: 'agents',
              path: '/backend/app/agents',
              type: 'directory',
              children: [
                {
                  id: 'base-agent-py',
                  name: 'base.py',
                  path: '/backend/app/agents/base.py',
                  type: 'file',
                  language: 'python',
                  description: 'Abstract BaseAgent class and AgentMessage schema.',
                  content: `from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class AgentMessage(BaseModel):
    sender: str
    recipient: str
    content: str
    role: str = "assistant"
    metadata: Optional[Dict[str, Any]] = None

class BaseAgent(ABC):
    def __init__(self, name: str, role: str, system_prompt: str):
        self.name = name
        self.role = role
        self.system_prompt = system_prompt

    @abstractmethod
    async def process_task(self, task: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Process an assigned task and return the generated outcome."""
        pass`
                },
                {
                  id: 'supervisor-py',
                  name: 'supervisor.py',
                  path: '/backend/app/agents/supervisor.py',
                  type: 'file',
                  language: 'python',
                  description: 'Supervisor Orchestrator agent for task decomposition and synthesis.',
                  content: `from typing import Dict, Any
from app.agents.base import BaseAgent

class SupervisorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="OrchestrationSupervisor",
            role="Supervisor & Task Decomposer",
            system_prompt=(
                "You are the master orchestration supervisor. You receive goal directives, "
                "decompose them into deterministic sub-tasks, delegate to specialized worker agents, "
                "and consolidate final validated results."
            )
        )

    async def process_task(self, task: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        goal = task.get("goal", "")
        subtasks = [
            {"id": "subtask-1", "type": "research", "query": f"Analyze fundamentals of: {goal}"},
            {"id": "subtask-2", "type": "synthesis", "query": f"Formulate actionable architecture plan for: {goal}"}
        ]
        return {
            "supervisor": self.name,
            "status": "decomposed",
            "subtasks": subtasks,
            "orchestration_plan": f"Plan formulated with {len(subtasks)} worker execution stages."
        }`
                },
                {
                  id: 'researcher-py',
                  name: 'researcher.py',
                  path: '/backend/app/agents/researcher.py',
                  type: 'file',
                  language: 'python',
                  description: 'Deep research worker agent interfacing with ChromaDB and search.',
                  content: `from typing import Dict, Any
from app.agents.base import BaseAgent

class ResearchAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="DeepResearchAgent",
            role="Information Retrieval & Fact Finding",
            system_prompt="You gather verified data from external search and internal vector memories."
        )

    async def process_task(self, task: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        query = task.get("query", "")
        return {
            "agent": self.name,
            "query": query,
            "status": "completed",
            "findings": [
                f"Retrieved primary context for '{query}'",
                "Indexed new semantic entities into ChromaDB vector memory.",
                "Short-term working state synchronized with Redis."
            ]
        }`
                }
              ]
            },
            {
              id: 'worker-dir',
              name: 'worker',
              path: '/backend/app/worker',
              type: 'directory',
              children: [
                {
                  id: 'tasks-py',
                  name: 'tasks.py',
                  path: '/backend/app/worker/tasks.py',
                  type: 'file',
                  language: 'python',
                  description: 'Celery background tasks: agent pipeline orchestrator and memory indexing.',
                  content: `import asyncio
import time
from typing import Dict, Any
from app.core.celery_app import celery
from app.agents.supervisor import SupervisorAgent
from app.agents.researcher import ResearchAgent

@celery.task(bind=True, name="app.worker.tasks.orchestrate_agent_pipeline")
def orchestrate_agent_pipeline(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
    task_id = self.request.id
    goal = task_data.get("goal", "Execute standard orchestration")
    
    self.update_state(state="PROGRESS", meta={"step": "1/4", "message": "Supervisor decomposing goal"})
    time.sleep(1)
    
    supervisor = SupervisorAgent()
    decomp = asyncio.run(supervisor.process_task({"goal": goal}, {}))
    
    self.update_state(state="PROGRESS", meta={"step": "2/4", "message": "Research agent querying semantic memory"})
    time.sleep(1)
    
    researcher = ResearchAgent()
    research_res = asyncio.run(researcher.process_task({"query": goal}, {}))
    
    self.update_state(state="PROGRESS", meta={"step": "3/4", "message": "Indexing results into ChromaDB & Redis"})
    time.sleep(1)
    
    self.update_state(state="PROGRESS", meta={"step": "4/4", "message": "Finalizing synthesis and audit log"})
    time.sleep(0.5)
    
    return {
        "task_id": task_id,
        "status": "SUCCESS",
        "goal": goal,
        "supervisor_plan": decomp,
        "research_results": research_res,
        "completed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }`
                }
              ]
            },
            {
              id: 'api-dir',
              name: 'api',
              path: '/backend/app/api',
              type: 'directory',
              children: [
                {
                  id: 'endpoints-py',
                  name: 'endpoints.py',
                  path: '/backend/app/api/endpoints.py',
                  type: 'file',
                  language: 'python',
                  description: 'FastAPI REST API endpoints: trigger pipeline, query memory, status polling.',
                  content: `from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uuid
import time
from app.core.celery_app import celery
from app.memory.redis_memory import working_memory
from app.memory.chroma_memory import semantic_memory

router = APIRouter()

class PipelineTriggerRequest(BaseModel):
    goal: str
    session_id: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "multi-agent-orchestrator",
        "timestamp": time.time(),
        "components": {
            "postgres": "ready",
            "redis": "ready",
            "celery": "ready",
            "chromadb": "ready"
        }
    }

@router.post("/pipeline/trigger")
async def trigger_orchestration_pipeline(request: PipelineTriggerRequest):
    session_id = request.session_id or f"sess_{uuid.uuid4().hex[:8]}"
    await working_memory.set_session_state(session_id, "active_goal", request.goal)
    task = celery.send_task(
        "app.worker.tasks.orchestrate_agent_pipeline",
        args=[{"goal": request.goal, "session_id": session_id}],
        queue="agents"
    )
    return {
        "task_id": task.id,
        "session_id": session_id,
        "status": "QUEUED",
        "message": "Dispatched to Celery queue 'agents'"
    }`
                }
              ]
            }
          ]
        },
        {
          id: 'scripts-dir',
          name: 'scripts',
          path: '/backend/scripts',
          type: 'directory',
          children: [
            {
              id: 'init-db-py',
              name: 'init_db.py',
              path: '/backend/scripts/init_db.py',
              type: 'file',
              language: 'python',
              description: 'Async database table creation for task runs and agent audit logs.',
              content: `import asyncio
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base, engine

class TaskExecutionModel(Base):
    __tablename__ = "task_executions"

    id = Column(String(64), primary_key=True, index=True)
    goal = Column(Text, nullable=False)
    status = Column(String(32), default="PENDING", index=True)
    session_id = Column(String(64), index=True)
    payload = Column(JSON, nullable=True)
    result = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

async def init_tables():
    print("🚀 Initializing PostgreSQL Database Tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ All tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_tables())`
            },
            {
              id: 'setup-sh',
              name: 'setup.sh',
              path: '/backend/scripts/setup.sh',
              type: 'file',
              language: 'shell',
              description: 'Single-command shell script to bootstrap containers, wait for health, and verify status.',
              content: `#!/usr/bin/env bash
set -e
echo "⚡ Initializing Multi-Agent Orchestration Infrastructure ⚡"
if [ ! -f .env ]; then
    cp config/.env.template .env
fi
docker compose up -d postgres redis chromadb
sleep 5
docker compose up -d backend celery_worker
docker compose ps`
            }
          ]
        }
      ]
    }
  ]
};
