export type TabType = 'architecture' | 'files' | 'simulator' | 'memory' | 'docker' | 'cli';

export interface ServiceNode {
  id: string;
  name: string;
  category: 'database' | 'cache' | 'vector' | 'api' | 'worker';
  image: string;
  port: number | string;
  internalPort: number;
  status: 'healthy' | 'starting' | 'idle';
  role: string;
  details: {
    purpose: string;
    connectionString: string;
    keyConfigs: Record<string, string>;
    memoryType?: string;
  };
}

export interface FileTreeItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeItem[];
  content?: string;
  language?: string;
  description?: string;
}

export interface SimulationStep {
  id: string;
  stepNumber: number;
  stage: string;
  service: string;
  agent?: string;
  action: string;
  payload?: any;
  status: 'pending' | 'active' | 'completed' | 'failed';
  timestamp: string;
  durationMs: number;
}

export interface MemoryRecord {
  id: string;
  type: 'short-term' | 'long-term';
  source: string;
  content: string;
  metadata: Record<string, any>;
  score?: number;
  timestamp: string;
}
