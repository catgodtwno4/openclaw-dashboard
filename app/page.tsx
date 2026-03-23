/**
 * Tasks page — Server Component
 * Fetches data at request time and embeds it in the HTML.
 * The client component receives `initialData` so no client-side fetch is needed on first load.
 */
import { fetchDashboardData } from './lib/ssr-data';
import TasksClient from './components/TasksClient';
import type { DashboardData } from './types';

const LAYER_NAMES: Record<string, string> = {
  l0: 'L0 - Ephemeral',
  l1: 'L1 - Working',
  l2: 'L2 - Semantic',
  l3: 'L3 - Episodic',
  l2plus: 'L2+ Procedural',
  l4: 'L4 - Archive',
  gateway: 'Gateway',
  disk: 'Disk',
};

function transformMemory(raw: any): DashboardData['memory'] {
  const statusMap: Record<string, 'healthy' | 'warning' | 'error'> = {
    ok: 'healthy',
    warn: 'warning',
    error: 'error',
  };
  const toStatus = (s: string) => statusMap[s] ?? 'warning';

  const layers_detail: DashboardData['memory']['layers_detail'] = {
    l0: { name: LAYER_NAMES.l0, status: toStatus(raw.l0?.status), files: raw.l0?.files, size: `${raw.l0?.size_kb} KB`, details: `${raw.l0?.files} files` },
    l1: { name: LAYER_NAMES.l1, status: toStatus(raw.l1?.status), summaries: raw.l1?.summaries, model: raw.l1?.model, dbSize: `${raw.l1?.db_size_kb} KB`, details: `Model: ${raw.l1?.model}` },
    l2: { name: LAYER_NAMES.l2, status: toStatus(raw.l2?.status), lanceFiles: raw.l2?.lance_files, embeddingModel: raw.l2?.embedding_model, rerank: raw.l2?.rerank, halflifeDays: raw.l2?.halflife_days, recencyWeight: raw.l2?.recency_weight, dbSize: `${raw.l2?.db_size_mb} MB`, details: `Embedding: ${raw.l2?.embedding_model}, Rerank: ${raw.l2?.rerank}` },
    l3: { name: LAYER_NAMES.l3, status: toStatus(raw.l3?.status), documents: raw.l3?.documents, engine: raw.l3?.engine, details: `Engine: ${raw.l3?.engine}` },
    l2plus: { name: LAYER_NAMES.l2plus, status: toStatus(raw.l2plus?.status), api: raw.l2plus?.api, searchLatency: `${raw.l2plus?.search_latency_ms}ms`, model: raw.l2plus?.llm_model, neo4j: raw.l2plus?.neo4j, qdrant: raw.l2plus?.qdrant, details: `API: ${raw.l2plus?.api}` },
    l4: { name: LAYER_NAMES.l4, status: toStatus(raw.l4?.status), api: raw.l4?.api, searchLatency: `${raw.l4?.search_latency_ms}ms`, model: raw.l4?.llm_model, details: `API: ${raw.l4?.api}` },
    gateway: { name: LAYER_NAMES.gateway, status: toStatus(raw.gateway?.status), criticalIssues: raw.gateway?.critical_issues, details: `${raw.gateway?.critical_issues} critical issues` },
    disk: { name: LAYER_NAMES.disk, status: 'healthy', diskRoot: raw.disk?.root, diskUsers: raw.disk?.users, details: `Root: ${raw.disk?.root}, Users: ${raw.disk?.users}` },
  };

  return { raw, layers_detail };
}

export default async function TasksPage() {
  const raw = await fetchDashboardData();

  const initialData: DashboardData | null = raw
    ? {
        tasks: raw.tasks || [],
        progress: raw.progress || [],
        memory: transformMemory(raw.memory),
        users: raw.users || [],
      }
    : null;

  return <TasksClient initialData={initialData} />;
}
