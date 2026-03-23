'use client';

import { useState, useEffect, useCallback } from 'react';
import { MemoryLayerInfo, DashboardData } from '../types';

const STATUS_DOT: Record<string, string> = {
  healthy: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
};

const LAYER_KEYS = ['l0', 'l1', 'l2', 'l3', 'l2plus', 'l4', 'gateway', 'disk'] as const;

const LAYER_SHORT: Record<string, string> = {
  l0: 'L0',
  l1: 'L1',
  l2: 'L2',
  l3: 'L3',
  l2plus: 'L2+',
  l4: 'L4',
  gateway: 'GW',
  disk: 'Disk',
};

interface MemoryClientProps {
  initialData: DashboardData | null;
}

export default function MemoryClient({ initialData }: MemoryClientProps) {
  const [data, setData] = useState<DashboardData | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [selectedLayer, setSelectedLayer] = useState<string>('l2');
  const [l0Files, setL0Files] = useState<any[]>([]);
  const [l0Loading, setL0Loading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileLoading, setFileLoading] = useState(false);
  const [mobileExpandedLayer, setMobileExpandedLayer] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(prev => ({
        tasks: json.tasks || [],
        progress: json.progress || [],
        memory: prev?.memory ?? { raw: json.memory, layers_detail: {} },
        users: json.users || [],
      }) as DashboardData);
    } catch (e) {
      console.error('Failed to refetch:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchL0Files = useCallback(async () => {
    if (selectedLayer !== 'l0') return;
    setL0Loading(true);
    try {
      const res = await fetch('/api/memory/files');
      if (res.ok) {
        const json = await res.json();
        setL0Files(json);
      }
    } catch {
      // ignore
    } finally {
      setL0Loading(false);
    }
  }, [selectedLayer]);

  useEffect(() => {
    fetchL0Files();
  }, [fetchL0Files]);

  const fetchFileContent = useCallback(async (path: string) => {
    setFileLoading(true);
    setFileContent('');
    try {
      const res = await fetch(`/api/memory/file?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const text = await res.text();
        setFileContent(text.slice(0, 2000));
      } else {
        setFileContent('無法載入文件內容');
      }
    } catch {
      setFileContent('載入失敗');
    } finally {
      setFileLoading(false);
    }
  }, []);

  const layers = data?.memory?.layers_detail;
  const selected = layers?.[selectedLayer as keyof typeof layers] as MemoryLayerInfo | undefined;

  // Stats
  const stats = {
    total: 8,
    healthy: layers ? LAYER_KEYS.filter(k => (layers as any)[k]?.status === 'healthy').length : 0,
    issues: layers ? LAYER_KEYS.filter(k => (layers as any)[k]?.status !== 'healthy').length : 0,
    l2Latency: layers?.l2?.details?.match(/\d+ms/)?.[0] || '—',
    l2plusLatency: layers?.l2plus?.searchLatency || '—',
    l4Latency: layers?.l4?.searchLatency || '—',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-4 fade-in-up">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { label: '層數', value: stats.total, accent: 'stats-card-slate' },
          { label: '健康', value: stats.healthy, accent: 'stats-card-green' },
          { label: '異常', value: stats.issues, accent: 'stats-card-red' },
          { label: 'L2 延遲', value: stats.l2Latency, accent: 'stats-card-blue' },
          { label: 'L2+ 延遲', value: stats.l2plusLatency, accent: 'stats-card-purple' },
          { label: 'L4 延遲', value: stats.l4Latency, accent: 'stats-card-amber' },
        ].map((s, i) => (
          <div key={s.label} className={`stats-card ${s.accent} fade-in-up stagger-${i + 1}`} style={{ animationFillMode: 'both' }}>
            <div className="text-lg font-bold">{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 3-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Layer List */}
        <div className="panel-card card-accent fade-in-up stagger-2" style={{ animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">記憶層</h2>
            <button onClick={fetchData} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">↻ 刷新</button>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {LAYER_KEYS.map(key => {
              const layer = (layers as any)?.[key];
              if (!layer) return null;
              const isSelected = selectedLayer === key;
              const statusColor =
                layer.status === 'healthy' ? 'bg-emerald-500' :
                layer.status === 'warning' ? 'bg-amber-500' : 'bg-red-500';
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedLayer(key);
                    setSelectedFile(null);
                    setFileContent('');
                    if (window.innerWidth < 768) {
                      setMobileExpandedLayer(mobileExpandedLayer === key ? null : key);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all card-hover ${
                    isSelected ? 'task-card-selected' : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`status-dot ${layer.status === 'healthy' ? 'dot-ok' : layer.status === 'warning' ? 'dot-warn' : 'dot-err'}`} />
                      <span className="text-sm font-medium">{layer.name}</span>
                    </div>
                    <span className="text-xs text-slate-500 uppercase font-mono">{LAYER_SHORT[key]}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">{layer.details || '—'}</div>
                  {/* Mobile expand indicator */}
                  <div className="lg:hidden mt-1">
                    <span className="text-xs text-indigo-400">{mobileExpandedLayer === key ? '▲ 收合' : '▼ 展開配置'}</span>
                  </div>

                  {/* Mobile inline expanded config */}
                  {window.innerWidth < 768 && mobileExpandedLayer === key && layer && (
                    <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                      {layer.files !== undefined && <div className="flex justify-between text-xs"><span className="text-slate-500">文件數</span><span>{layer.files}</span></div>}
                      {layer.size && <div className="flex justify-between text-xs"><span className="text-slate-500">大小</span><span>{layer.size}</span></div>}
                      {layer.dbSize && <div className="flex justify-between text-xs"><span className="text-slate-500">資料庫</span><span>{layer.dbSize}</span></div>}
                      {layer.model && <div className="flex justify-between text-xs"><span className="text-slate-500">模型</span><span className="truncate max-w-[180px]">{layer.model}</span></div>}
                      {layer.searchLatency && <div className="flex justify-between text-xs"><span className="text-slate-500">搜尋延遲</span><span>{layer.searchLatency}</span></div>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle: Layer Config */}
        <div className="hidden lg:block panel-card card-accent fade-in-up stagger-3" style={{ animationFillMode: 'both' }}>
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">配置</h2>
          {selected ? (
            <div className="space-y-3 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${STATUS_DOT[selected.status] || 'bg-slate-500'}`} />
                <span className="text-sm capitalize">
                  {selected.status === 'healthy' ? '健康' : selected.status === 'warning' ? '警告' : '錯誤'}
                </span>
              </div>

              {selected.files !== undefined && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">文件數</div>
                  <div className="font-semibold">{selected.files}</div>
                </div>
              )}

              {selected.size && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">大小</div>
                  <div className="font-semibold">{selected.size}</div>
                </div>
              )}

              {selected.dbSize && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">資料庫大小</div>
                  <div className="font-semibold">{selected.dbSize}</div>
                </div>
              )}

              {selected.model && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">模型</div>
                  <div className="font-semibold text-xs">{selected.model}</div>
                </div>
              )}

              {selected.embeddingModel && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Embedding</div>
                  <div className="font-semibold text-xs">{selected.embeddingModel}</div>
                </div>
              )}

              {selected.rerank && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Rerank</div>
                  <div className="font-semibold text-xs">{selected.rerank}</div>
                </div>
              )}

              {selected.halflifeDays !== undefined && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">衰減週期</div>
                  <div className="font-semibold">{selected.halflifeDays} 天</div>
                </div>
              )}

              {selected.engine && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">引擎</div>
                  <div className="font-semibold">{selected.engine}</div>
                </div>
              )}

              {selected.api && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">API</div>
                  <div className="font-semibold text-xs break-all">{selected.api}</div>
                </div>
              )}

              {selected.neo4j && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Neo4j</div>
                  <div className="font-semibold text-xs">{selected.neo4j}</div>
                </div>
              )}

              {selected.qdrant && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Qdrant</div>
                  <div className="font-semibold text-xs">{selected.qdrant}</div>
                </div>
              )}

              {selected.searchLatency && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">搜尋延遲</div>
                  <div className="font-semibold">{selected.searchLatency}</div>
                </div>
              )}

              {selected.criticalIssues !== undefined && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">Critical Issues</div>
                  <div className="font-semibold">{selected.criticalIssues}</div>
                </div>
              )}

              {selected.diskRoot && (
                <div className="bg-slate-800/60 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-1">磁碟使用</div>
                  <div className="font-semibold">Root: {selected.diskRoot} | Users: {selected.diskUsers}</div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-12">選擇左側層級查看配置</p>
          )}
        </div>

        {/* Right: Detail / L0 File Browser */}
        <div className="hidden lg:block panel-card card-accent fade-in-up stagger-4" style={{ animationFillMode: 'both' }}>
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            {selectedLayer === 'l0' ? 'L0 文件列表' : '詳情'}
          </h2>

          {selectedLayer === 'l0' ? (
            <>
              {/* L0 file browser */}
              <div className="space-y-1 max-h-[200px] overflow-y-auto mt-3">
                {l0Loading ? (
                  <p className="text-slate-500 text-xs">載入中...</p>
                ) : (
                  l0Files.map((f, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedFile(f.name); fetchFileContent(f.name); }}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                        selectedFile === f.name ? 'bg-indigo-900/60 text-indigo-200' : 'hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-emerald-400 mr-2">📄</span>
                      {f.name}
                      <span className="text-slate-600 ml-2">{Math.round(f.size / 1024)}KB</span>
                    </button>
                  ))
                )}
              </div>

              {/* File content preview */}
              {selectedFile && (
                <div className="mt-3">
                  <div className="text-xs text-slate-500 mb-1">📄 {selectedFile}</div>
                  <div className="bg-slate-800/60 rounded-lg p-3 max-h-[280px] overflow-y-auto">
                    {fileLoading ? (
                      <p className="text-slate-500 text-xs">載入中...</p>
                    ) : (
                      <pre className="text-xs text-slate-400 whitespace-pre-wrap break-all font-mono leading-relaxed">
                        {fileContent || '（空文件）'}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : selected ? (
            <>
              <div className="mt-3">
                <h3 className="text-base font-semibold mb-2">{selected.name}</h3>
                <div className="flex gap-2 mb-3">
                  <span
                    className="badge"
                    style={{
                      backgroundColor: selected.status === 'healthy' ? 'rgba(34,197,94,0.15)' : selected.status === 'warning' ? 'rgba(245,158,11,0.15)' : 'rgba(244,63,94,0.15)',
                      color: selected.status === 'healthy' ? '#4ade80' : selected.status === 'warning' ? '#fbbf24' : '#fb7185',
                      borderColor: selected.status === 'healthy' ? 'rgba(34,197,94,0.3)' : selected.status === 'warning' ? 'rgba(245,158,11,0.3)' : 'rgba(244,63,94,0.3)',
                    }}
                  >
                    {selected.status === 'healthy' ? '健康' : selected.status === 'warning' ? '警告' : '錯誤'}
                  </span>
                </div>
              </div>

              {/* Latency gauge for searchable layers */}
              {(selected.searchLatency || selected.details?.match(/\d+ms/)) && (
                <div className="mb-4">
                  <div className="text-xs text-slate-500 mb-2">搜尋延遲</div>
                  <LatencyGauge latency={selected.searchLatency || selected.details?.match(/(\d+)ms/)?.[1] + 'ms' || '—'} />
                </div>
              )}

              <div className="border-t border-slate-700 pt-4 space-y-2 text-sm">
                {selected.details && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">說明</div>
                    <p className="text-slate-300 text-xs leading-relaxed">{selected.details}</p>
                  </div>
                )}

                {selected.documents !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">文檔數</span>
                    <span>{selected.documents}</span>
                  </div>
                )}

                {selected.summaries !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">摘要數</span>
                    <span>{selected.summaries}</span>
                  </div>
                )}

                {selected.lanceFiles !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lance 文件</span>
                    <span>{selected.lanceFiles}</span>
                  </div>
                )}

                {selected.recencyWeight !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">新近度權重</span>
                    <span>{selected.recencyWeight}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-sm text-center py-12">選擇左側層級查看詳情</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Latency gauge component
function LatencyGauge({ latency }: { latency: string }) {
  const ms = parseInt(latency.replace(/\D/g, ''), 10) || 0;
  const pct = Math.min((ms / 3000) * 100, 100);
  const color = ms < 500 ? 'gauge-ok' : ms < 2000 ? 'gauge-warn' : 'gauge-err';
  return (
    <div className="latency-gauge">
      <div className="gauge-bar-wrap">
        <div className={`gauge-bar-fill ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-slate-400 shrink-0">{latency}</span>
    </div>
  );
}
