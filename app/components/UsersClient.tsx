'use client';

import { useState, useCallback } from 'react';
import { DashboardData, User } from '../types';

const ROLE_LABELS: Record<string, string> = {
  admin: '管理員',
  editor: '編輯',
  viewer: '訪客',
  task_manager: '任務管理',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-700',
  editor: 'bg-amber-700',
  viewer: 'bg-slate-700',
  task_manager: 'bg-violet-700',
};

const ALL_ROLES = ['admin', 'editor', 'viewer', 'task_manager'] as const;

interface UsersClientProps {
  initialData: DashboardData | null;
}

export default function UsersClient({ initialData }: UsersClientProps) {
  const [data, setData] = useState<DashboardData | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<User['role']>('viewer');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const displayUsers = data?.users || [];

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const openAdd = () => {
    setEditingUser(null);
    setFormEmail('');
    setFormRole('viewer');
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setFormEmail(user.email);
    setFormRole(user.role);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formEmail) return;
    setSaving(true);
    try {
      if (editingUser) {
        const res = await fetch(`/api/users/${encodeURIComponent(editingUser.email)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formEmail, role: formRole }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showMsg('success', '用戶已更新');
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formEmail, role: formRole }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showMsg('success', '用戶已添加');
      }
      setShowModal(false);
      fetchData();
    } catch (e) {
      showMsg('error', `保存失敗: ${e instanceof Error ? e.message : '未知錯誤'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (email: string) => {
    if (!confirm(`確定刪除用戶 ${email}？`)) return;
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(email)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showMsg('success', '用戶已刪除');
      fetchData();
    } catch (e) {
      showMsg('error', `刪除失敗: ${e instanceof Error ? e.message : '未知錯誤'}`);
    }
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-semibold">用戶管理</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {message && (
            <span className={`text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {message.text}
            </span>
          )}
          <button onClick={fetchData} className="px-3 py-2 text-xs rounded bg-slate-700 hover:bg-slate-600 transition-colors">
            ↻ 刷新
          </button>
          <button
            onClick={openAdd}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium transition-colors"
          >
            + 添加用戶
          </button>
        </div>
      </div>

      {/* CF Access Note */}
      <div className="cf-access-note">
        <span className="note-icon">ℹ️</span>
        <div>
          此頁面使用 Cloudflare Access 認證。用戶列表由 Gateway 的 <code className="text-indigo-300">CF_Authorization</code> cookie 驗證。
          請確保瀏覽器已登入 Cloudflare Access。
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">郵箱</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">角色</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">創建日期</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">操作</th>
            </tr>
          </thead>
          <tbody>
            {displayUsers.map((user, idx) => (
              <tr key={user.email} className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-800/30'}`}>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm">{user.email}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs text-white ${ROLE_COLORS[user.role] || 'bg-slate-700'}`}>
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">{user.createdAt?.split('T')[0]}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(user)}
                      className="btn-sm"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDelete(user.email)}
                      className="btn-sm btn-sm-danger"
                    >
                      刪除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {displayUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-500">暫無用戶</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {displayUsers.map((user) => (
          <div key={user.email} className="panel-card card-hover">
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">郵箱</div>
                <div className="font-mono text-sm text-slate-100">{user.email}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">角色</div>
                <span className={`px-2 py-0.5 rounded text-xs text-white inline-block ${ROLE_COLORS[user.role] || 'bg-slate-700'}`}>
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">創建日期</div>
                <div className="text-sm text-slate-300">{user.createdAt?.split('T')[0]}</div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-700">
                <button
                  onClick={() => openEdit(user)}
                  className="flex-1 px-3 py-2 text-xs rounded bg-slate-700 hover:bg-slate-600 transition-colors"
                >
                  編輯
                </button>
                <button
                  onClick={() => handleDelete(user.email)}
                  className="flex-1 px-3 py-2 text-xs rounded bg-red-900/60 hover:bg-red-800 transition-colors"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        ))}
        {displayUsers.length === 0 && (
          <p className="text-center text-slate-500 py-12 text-sm">暫無用戶</p>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '管理員', value: displayUsers.filter(u => u.role === 'admin').length, accent: 'stats-card-red' },
          { label: '編輯', value: displayUsers.filter(u => u.role === 'editor').length, accent: 'stats-card-amber' },
          { label: '任務管理', value: displayUsers.filter(u => u.role === 'task_manager').length, accent: 'stats-card-purple' },
          { label: '訪客', value: displayUsers.filter(u => u.role === 'viewer').length, accent: 'stats-card-slate' },
        ].map((s, i) => (
          <div key={s.label} className={`stats-card ${s.accent} fade-in-up stagger-${i + 1}`} style={{ animationFillMode: 'both' }}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => !saving && setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">
              {editingUser ? '編輯用戶' : '添加用戶'}
            </h2>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">郵箱</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="form-input"
                  disabled={saving}
                />
              </div>
              <div className="form-group">
                <label className="form-label">角色</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as User['role'])}
                  className="form-select"
                  disabled={saving}
                >
                  {ALL_ROLES.map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowModal(false)}
                className="btn-ghost"
                disabled={saving}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formEmail}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
