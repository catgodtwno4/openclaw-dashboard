export interface Subtask {
  text: string;
  done: boolean;
}

export interface Task {
  title: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  subtasks: Subtask[];
  createdDate: string;
  dueDate: string;
  assignee: string;
  description: string;
  isOverdue: boolean;
  status?: 'done' | 'active' | 'in_progress' | 'pending' | 'blocked';
  auto?: boolean;
}

export interface ProgressEntry {
  timestamp: string;
  title: string;
  items: string[];
}

export interface L0Data {
  status: string;
  files: number;
  size_kb: number;
  names: string[];
}

export interface L1Data {
  status: string;
  summaries: number;
  model: string;
  db_size_kb: number;
}

export interface L2Data {
  status: string;
  lance_files: number;
  embedding_model: string;
  rerank: string;
  halflife_days: number;
  recency_weight: number;
  db_size_mb: number;
}

export interface L3Data {
  status: string;
  documents: number;
  engine: string;
}

export interface L2PlusData {
  status: string;
  api: string;
  search_latency_ms: number;
  llm_model: string;
  neo4j: string;
  qdrant: string;
}

export interface L4Data {
  status: string;
  api: string;
  search_latency_ms: number;
  llm_model: string;
}

export interface GatewayData {
  status: string;
  critical_issues: number;
}

export interface DiskData {
  root: string;
  users: string;
}

export interface MemoryRaw {
  timestamp: string;
  epoch: number;
  l0: L0Data;
  l1: L1Data;
  l2: L2Data;
  l3: L3Data;
  l2plus: L2PlusData;
  l4: L4Data;
  gateway: GatewayData;
  disk: DiskData;
}

export interface MemoryLayerInfo {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  files?: number;
  size?: string;
  searchLatency?: string;
  model?: string;
  engine?: string;
  details?: string;
  api?: string;
  neo4j?: string;
  qdrant?: string;
  dbSize?: string;
  embeddingModel?: string;
  rerank?: string;
  halflifeDays?: number;
  recencyWeight?: number;
  criticalIssues?: number;
  diskRoot?: string;
  diskUsers?: string;
  documents?: number;
  summaries?: number;
  lanceFiles?: number;
}

export interface User {
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'task_manager';
  createdAt: string;
}

export interface DashboardData {
  tasks: Task[];
  progress: ProgressEntry[];
  memory: {
    raw: MemoryRaw;
    layers_detail: {
      l0: MemoryLayerInfo;
      l1: MemoryLayerInfo;
      l2: MemoryLayerInfo;
      l3: MemoryLayerInfo;
      l2plus: MemoryLayerInfo;
      l4: MemoryLayerInfo;
      gateway: MemoryLayerInfo;
      disk: MemoryLayerInfo;
    };
  };
  users: User[];
}
