'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { ROLES, ROLE_LABELS } from '@/lib/constants';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  _count: { assignedTickets: number; createdTickets: number };
};

export default function UsersPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'OPERATOR' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Nome, email e senha são obrigatórios');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success('Usuário criado!');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'OPERATOR' });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar usuário');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (userId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(currentActive ? 'Usuário desativado' : 'Usuário ativado');
      fetchUsers();
    } catch {
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-700',
      TECHNICIAN: 'bg-blue-100 text-blue-700',
      OPERATOR: 'bg-green-100 text-green-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  if (userRole !== 'ADMIN') {
    return (
      <div className="text-center py-20">
        <span className="text-5xl mb-4 block">🔒</span>
        <h2 className="text-xl font-bold text-industrial-900 mb-2">Acesso Restrito</h2>
        <p className="text-industrial-500">Apenas administradores podem acessar esta página</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-900">Usuários</h1>
          <p className="text-industrial-500">{users.length} usuários cadastrados</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-miac-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          {showForm ? '✕ Fechar' : '+ Novo Usuário'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={createUser} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-industrial-900 mb-4">Novo Usuário</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Nome *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Senha *</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Perfil</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent">
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="bg-miac-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Criar Usuário'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-industrial-600 hover:bg-gray-100">Cancelar</button>
          </div>
        </form>
      )}

      {/* Users table */}
      {loading ? (
        <div className="text-center py-12 text-industrial-500">Carregando...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-industrial-600">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-industrial-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-industrial-600">Perfil</th>
                  <th className="text-center px-4 py-3 font-medium text-industrial-600">Chamados</th>
                  <th className="text-center px-4 py-3 font-medium text-industrial-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-industrial-600">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 ${!user.active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-industrial-100 rounded-full flex items-center justify-center text-xs font-bold text-industrial-700">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-industrial-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-industrial-500">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${getRoleBadge(user.role)}`}>
                        {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-industrial-500">
                      {user._count.createdTickets} criados / {user._count.assignedTickets} atendidos
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`status-badge ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.active ? '✅ Ativo' : '❌ Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(user.id, user.active)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          user.active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.active ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
