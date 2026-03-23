'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDashboardData } from './hooks/useDashboardData';
import { Task } from './types';

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-600',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

const STATUS_COLORS: Record<string, string> = {
  done: 'bg-emerald-600 text-emerald-100',
  in_progress: 'bg-indigo-600 text-indigo-100',
  pending: 'bg-slate-600 text-slate-100',
  blocked: 'bg-red-600 text-red-100',
};

const STATUS_LABELS: Record<string, string> = {
  done: '已完成',
  in_progress: '進行中',
  pending: '待處理',
  blocked: '已阻塞',
};

const filterLabels = ['全部', '高優先級', '進行中', '已完成', '已逾期'];

export default function TasksPage() {
  const { data, loading, refetch } = useDashboardData();
  const [filter, setFilter] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [subtaskFilter, setSubtaskFilter] = useState(0);

  // Auto-select first task when data loads
  useEffect(() => {
    if (data?.tasks && data.tasks.length > 0 && !selectedTask) {
      setSelectedTask(data.tasks[0]);
    }
  }, [data, selectedTask]);

  const stats = useMemo(() => {
    if (!data?.tasks) return { total: 0, done: 0, active: 0, pending: 0, blocked: 0, rate: 0 };
    const tasks = data.tasks;
    const done = tasks.filter(t => t.status === 'done').length;
    const active = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const blocked = tasks.filter(t => t.status === 'blocked').length;
    const rate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    return { total: tasks.length, done, active, pending, blocked, rate };
  }, [data]);

  const filteredTasks = useMemo(() => {
    if (!data?.tasks) return [];
    switch (filter) {
      case 1: return data.tasks.filter(t => t.priority === 'high');
      case 2: return data.tasks.filter(t => t.status === 'in_progress');
      case 3: return data.tasks.filter(t => t.status === 'done');
      case 4: return data.tasks.filter(t => t.isOverdue);
      default: return data.tasks;
    }
  }, [data, filter]);

  const filteredSubtasks = useMemo(() => {
    if (!selectedTask?.subtasks) return [];
    switch (subtaskFilter) {
      case 1: return selectedTask.subtasks.filter(s => !s.done);
      case 2: return selectedTask.subtasks.filter(s => s.done);
      default: return selectedTask.subtasks;
    }
  }, [selectedTask, subtaskFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 animate-pulse">載入中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {[
          { label: '總計', value: stats.total, color: 'bg-slate-700' },
          { label: '已完成', value: stats.done, color: 'bg-emerald-700' },
          { label: '進行中', value: stats.active, color: 'bg-indigo-700' },
          { label: '待處理', value: stats.pending, color: 'bg-slate-700' },
          { label: '已阻塞', value: stats.blocked, color: 'bg-red-700' },
          { label: '完成率', value: `${stats.rate}%`, color: 'bg-violet-700' },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-lg px-3 py-2 text-center`}>
            <div className="text-lg font-bold">{s.value}</div>
            <div className="text-xs text-slate-300">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 3-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Panel: Task List */}
        <div className="bg-slate-900 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">任務列表</h2>
            <button onClick={refetch} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">↻ 刷新</button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1 mb-3">
            {filterLabels.map((label, i) => (
              <button
                key={label}
                onClick={() => setFilter(i)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  filter === i
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Task Cards */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredTasks.map((task, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTask(task)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedTask?.title === task.title
                    ? 'border-indigo-500 bg-indigo-950/40'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${PRIORITY_COLORS[task.priority] || 'bg-slate-600'}`} />
                  <span className="font-medium text-sm truncate">{task.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status || 'pending']}`}>
                    {STATUS_LABELS[task.status || 'pending']}
                  </span>
                  <span className="text-xs text-slate-500">{task.assignee}</span>
                  {task.isOverdue && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/60 text-red-300">已逾期</span>
                  )}
                </div>
                <div className="flex gap-1 mt-2">
                  {task.subtasks.slice(0, 5).map((st, si) => (
                    <span key={si} className={`w-3 h-3 rounded-sm ${st.done ? 'bg-emerald-600' : 'bg-slate-700'}`} />
                  ))}
                  {task.subtasks.length > 5 && (
                    <span className="text-xs text-slate-500 ml-1">+{task.subtasks.length - 5}</span>
                  )}
                </div>
                <div className="flex gap-3 mt-2 text-xs text-slate-500">
                  <span>📅 {task.dueDate}</span>
                </div>
              </button>
            ))}
            {filteredTasks.length === 0 && (
              <p className="text-center text-slate-500 py-8 text-sm">無匹配任務</p>
            )}
          </div>
        </div>

        {/* Middle Panel: Subtask Checklist */}
        <div className="bg-slate-900 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">子任務</h2>

          {selectedTask ? (
            <>
              <div className="mb-3">
                <h3 className="font-medium text-sm text-indigo-300 mb-1">{selectedTask.title}</h3>
                <p className="text-xs text-slate-500">
                  {selectedTask.subtasks.filter((s: any) => s.done).length} / {selectedTask.subtasks.length} 完成
                </p>
              </div>

              {/* Subtask filters */}
              <div className="flex gap-1 mb-2">
                {['全部', '未完成', '已完成'].map((l, i) => (
                  <button
                    key={l}
                    onClick={() => setSubtaskFilter(i)}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      subtaskFilter === i ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {filteredSubtasks.map((st: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/60 transition-colors"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${st.done ? 'bg-emerald-600 border-emerald-600' : 'border-slate-600 bg-slate-800'}`}>
                      {st.done && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className={`text-sm ${st.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {st.text}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-sm text-center py-12">選擇左側任務查看子任務</p>
          )}
        </div>

        {/* Right Panel: Task Detail */}
        <div className="bg-slate-900 rounded-xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">任務詳情</h2>

          {selectedTask ? (
            <>
              {/* Top: Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedTask.title}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded text-xs text-white ${PRIORITY_COLORS[selectedTask.priority] || 'bg-slate-600'}`}>
                    {selectedTask.priority === 'high' ? '高' : selectedTask.priority === 'medium' ? '中' : '低'}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300">
                    {selectedTask.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[selectedTask.status || 'pending']}`}>
                    {STATUS_LABELS[selectedTask.status || 'pending']}
                  </span>
                  {selectedTask.isOverdue && (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-900/60 text-red-300">已逾期</span>
                  )}
                </div>
              </div>

              {/* Middle: Meta info */}
              <div className="space-y-2 text-sm">
                <div className="flex gap-4">
                  <span className="text-slate-400">負責人:</span>
                  <span>{selectedTask.assignee}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-slate-400">創建日期:</span>
                  <span>{selectedTask.createdDate}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-slate-400">截止日期:</span>
                  <span className={selectedTask.isOverdue ? 'text-red-400' : ''}>{selectedTask.dueDate}</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-slate-400">描述:</span>
                </div>
                <p className="text-slate-300 leading-relaxed -mt-1">{selectedTask.description}</p>
              </div>

              {/* Bottom: Timeline */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">相關活動</h4>
                <div className="space-y-3">
                  {data?.progress
                    ?.filter((p: any) => p.title === selectedTask.title)
                    .slice(0, 3)
                    .map((entry: any, i: number) => (
                      <div key={i} className="flex gap-3 text-xs">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1" />
                          {i < 2 && <div className="w-px h-8 bg-slate-700" />}
                        </div>
                        <div>
                          <p className="text-slate-400">{entry.timestamp}</p>
                          {entry.items.map((item: string, j: number) => (
                            <p key={j} className="text-slate-500">• {item}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  {(!data?.progress?.some((p: any) => p.title === selectedTask.title)) && (
                    <p className="text-slate-600 text-xs">暫無活動記錄</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-sm text-center py-12">選擇左側任務查看詳情</p>
          )}
        </div>
      </div>
    </div>
  );
}
