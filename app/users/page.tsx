'use client';

import { useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { User } from '../types';

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

export default function UsersPage() {
  const { data, loading, refetch } = useDashboardData();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<User['role']>('viewer');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        // PUT /api/users/:email
        const res = await fetch(`/api/users/${encodeURIComponent(editingUser.email)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formEmail, role: formRole }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showMsg('success', '用戶已更新');
      } else {
        // POST /api/users
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formEmail, role: formRole }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        showMsg('success', '用戶已添加');
      }
      setShowModal(false);
      refetch();
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
      refetch();
    } catch (e) {
      showMsg('error', `刪除失敗: ${e instanceof Error ? e.message : '未知錯誤'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 animate-pulse">載入中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">用戶管理</h1>
        <div className="flex items-center gap-3">
          {message && (
            <span className={`text-sm ${message.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {message.text}
            </span>
          )}
          <button onClick={refetch} className="px-3 py-2 text-xs rounded bg-slate-700 hover:bg-slate-600 transition-colors">
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

      {/* Users Table */}
      <div className="bg-slate-900 rounded-xl overflow-hidden">
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
              <tr key={user.email} className={`border-b border-slate-800 ${idx % 2 === 0 ? '' : 'bg-slate-800/30'}`}>
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
                      className="px-3 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDelete(user.email)}
                      className="px-3 py-1 text-xs rounded bg-red-900/60 hover:bg-red-800 transition-colors"
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

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '管理員', value: displayUsers.filter(u => u.role === 'admin').length, color: 'bg-red-900/50' },
          { label: '編輯', value: displayUsers.filter(u => u.role === 'editor').length, color: 'bg-amber-900/50' },
          { label: '任務管理', value: displayUsers.filter(u => u.role === 'task_manager').length, color: 'bg-violet-900/50' },
          { label: '訪客', value: displayUsers.filter(u => u.role === 'viewer').length, color: 'bg-slate-800' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-lg px-4 py-3 text-center`}>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h2 className="text-lg font-semibold">
              {editingUser ? '編輯用戶' : '添加用戶'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">郵箱</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">角色</label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as User['role'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {ALL_ROLES.map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                disabled={saving}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formEmail}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
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
