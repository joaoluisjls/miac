'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type PreventivePlan = {
  id: string;
  title: string;
  description: string | null;
  periodicityMonths: number | null;
  lastExecution: string | null;
  nextExecution: string | null;
  responsible: string | null;
  status: string;
  observations: string | null;
  machine: { id: string; name: string };
};

type Machine = { id: string; name: string };

export default function PreventivePage() {
  const [plans, setPlans] = useState<PreventivePlan[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    machineId: '', title: '', description: '', periodicityMonths: '', responsible: '', observations: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, mRes] = await Promise.all([fetch('/api/preventive'), fetch('/api/machines')]);
      const pData = await pRes.json();
      const mData = await mRes.json();
      setPlans(pData);
      setMachines(mData);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.machineId || !form.title) { toast.error('Máquina e título são obrigatórios'); return; }
    setSaving(true);
    try {
      const payload = { ...form, periodicityMonths: form.periodicityMonths ? parseInt(form.periodicityMonths) : null };
      const res = await fetch('/api/preventive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success('Plano preventivo criado!');
      setShowForm(false);
      setForm({ machineId: '', title: '', description: '', periodicityMonths: '', responsible: '', observations: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar plano');
    } finally {
      setSaving(false);
    }
  };

  const now = new Date();
  const overdue = plans.filter((p) => p.nextExecution && new Date(p.nextExecution) < now && p.status !== 'RESOLVED');
  const upcoming = plans.filter((p) => {
    if (!p.nextExecution) return false;
    const d = new Date(p.nextExecution);
    return d >= now && d <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  });
  const ok = plans.filter((p) => {
    if (!p.nextExecution) return true;
    return new Date(p.nextExecution) > new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  });

  const filtered = filterStatus === 'overdue' ? overdue : filterStatus === 'upcoming' ? upcoming : filterStatus === 'ok' ? ok : plans;

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';
  const daysUntil = (d: string) => {
    const diff = Math.ceil((new Date(d).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} dias atrasado`;
    if (diff === 0) return 'Hoje';
    return `${diff} dias`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-900">Manutenção Preventiva</h1>
          <p className="text-industrial-500">{plans.length} planos cadastrados</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-miac-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          {showForm ? '✕ Fechar' : '+ Novo Plano'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={() => setFilterStatus(filterStatus === 'overdue' ? '' : 'overdue')} className={`text-left rounded-xl p-5 border-2 transition-all ${filterStatus === 'overdue' ? 'border-red-500 bg-red-50' : 'bg-white border-gray-200 hover:border-red-300'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🔴</span>
            <span className="text-3xl font-bold text-red-600">{overdue.length}</span>
          </div>
          <h3 className="font-bold text-industrial-900">Atrasadas</h3>
          <p className="text-sm text-red-600">Necessitam ação imediata</p>
        </button>
        <button onClick={() => setFilterStatus(filterStatus === 'upcoming' ? '' : 'upcoming')} className={`text-left rounded-xl p-5 border-2 transition-all ${filterStatus === 'upcoming' ? 'border-orange-500 bg-orange-50' : 'bg-white border-gray-200 hover:border-orange-300'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🟠</span>
            <span className="text-3xl font-bold text-orange-600">{upcoming.length}</span>
          </div>
          <h3 className="font-bold text-industrial-900">Próximas</h3>
          <p className="text-sm text-orange-600">Próximos 30 dias</p>
        </button>
        <button onClick={() => setFilterStatus(filterStatus === 'ok' ? '' : 'ok')} className={`text-left rounded-xl p-5 border-2 transition-all ${filterStatus === 'ok' ? 'border-green-500 bg-green-50' : 'bg-white border-gray-200 hover:border-green-300'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🟢</span>
            <span className="text-3xl font-bold text-green-600">{ok.length}</span>
          </div>
          <h3 className="font-bold text-industrial-900">Em Dia</h3>
          <p className="text-sm text-green-600">Próxima manutenção longe</p>
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={createPlan} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-industrial-900 mb-4">Novo Plano Preventivo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Máquina *</label>
              <select value={form.machineId} onChange={(e) => setForm({ ...form, machineId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent">
                <option value="">Selecione...</option>
                {machines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Título *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Periodicidade (meses)</label>
              <input type="number" value={form.periodicityMonths} onChange={(e) => setForm({ ...form, periodicityMonths: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Responsável</label>
              <input type="text" value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-industrial-600 mb-1">Descrição</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="bg-miac-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Criar Plano'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-industrial-600 hover:bg-gray-100">Cancelar</button>
          </div>
        </form>
      )}

      {/* Plans list */}
      {loading ? (
        <div className="text-center py-12 text-industrial-500">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-4xl mb-4 block">📅</span>
          <p className="text-industrial-500">Nenhum plano encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((plan) => {
            const isOverdue = plan.nextExecution && new Date(plan.nextExecution) < now;
            const isUpcoming = plan.nextExecution && !isOverdue && new Date(plan.nextExecution) <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            const borderClass = isOverdue ? 'border-red-300' : isUpcoming ? 'border-orange-300' : 'border-gray-200';
            return (
              <div key={plan.id} className={`bg-white rounded-xl shadow-sm border ${borderClass} p-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-2xl">{isOverdue ? '🔴' : isUpcoming ? '🟠' : '🟢'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-industrial-900">{plan.title}</h3>
                      {isOverdue && <span className="status-badge bg-red-100 text-red-700">Atrasado</span>}
                      {isUpcoming && <span className="status-badge bg-orange-100 text-orange-700">Próximo</span>}
                    </div>
                    <p className="text-sm text-industrial-500">🏭 {plan.machine.name}</p>
                    {plan.description && <p className="text-sm text-industrial-400 mt-0.5 truncate">{plan.description}</p>}
                  </div>
                  <div className="text-right text-sm shrink-0">
                    <p className="text-industrial-900 font-medium">📅 {formatDate(plan.nextExecution)}</p>
                    {plan.nextExecution && <p className={`text-xs ${isOverdue ? 'text-red-600' : isUpcoming ? 'text-orange-600' : 'text-green-600'}`}>{daysUntil(plan.nextExecution)}</p>}
                    {plan.periodicityMonths && <p className="text-xs text-industrial-400">A cada {plan.periodicityMonths} meses</p>}
                    {plan.responsible && <p className="text-xs text-industrial-400">👤 {plan.responsible}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
