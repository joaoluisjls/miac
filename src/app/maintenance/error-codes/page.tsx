'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PRIORITY_LEVELS } from '@/lib/constants';

type ErrorCode = {
  id: string;
  code: string;
  name: string;
  description: string;
  probableCause: string | null;
  diagnosticProcedure: string | null;
  solution: string | null;
  riskLevel: string;
  requiredEquipment: string | null;
  requiredTools: string | null;
  observations: string | null;
  safetyInfo: string | null;
  machine: { id: string; name: string } | null;
};

type Machine = { id: string; name: string };

export default function ErrorCodesPage() {
  const [codes, setCodes] = useState<ErrorCode[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '', name: '', description: '', machineId: '', riskLevel: 'MEDIUM',
    probableCause: '', solution: '', requiredEquipment: '', requiredTools: '', observations: '', safetyInfo: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, mRes] = await Promise.all([fetch('/api/error-codes'), fetch('/api/machines')]);
      const cData = await cRes.json();
      const mData = await mRes.json();
      setCodes(cData);
      setMachines(mData);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const createCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name || !form.description) { toast.error('Campos obrigatórios não preenchidos'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/error-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success('Código de erro criado!');
      setShowForm(false);
      setForm({ code: '', name: '', description: '', machineId: '', riskLevel: 'MEDIUM', probableCause: '', solution: '', requiredEquipment: '', requiredTools: '', observations: '', safetyInfo: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar código');
    } finally {
      setSaving(false);
    }
  };

  const filtered = search
    ? codes.filter((c) =>
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      )
    : codes;

  const getRiskInfo = (rl: string) => (PRIORITY_LEVELS as any)[rl] || { label: rl, bg: 'bg-gray-100', color: 'text-gray-500' };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-900">Códigos de Erro</h1>
          <p className="text-industrial-500">{codes.length} códigos cadastrados</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-miac-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          {showForm ? '✕ Fechar' : '+ Novo Código'}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Buscar por código, nome ou descrição..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent"
        />
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={createCode} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-industrial-900 mb-4">Novo Código de Erro</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Código *</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" placeholder="Ex: E-001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Nome *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Máquina</label>
              <select value={form.machineId} onChange={(e) => setForm({ ...form, machineId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent">
                <option value="">Todas</option>
                {machines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-industrial-600 mb-1">Descrição *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Nível de Risco</label>
              <select value={form.riskLevel} onChange={(e) => setForm({ ...form, riskLevel: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent">
                {Object.entries(PRIORITY_LEVELS).map(([k, v]) => <option key={k} value={k}>{(v as any).label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Causa Provável</label>
              <input type="text" value={form.probableCause} onChange={(e) => setForm({ ...form, probableCause: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Solução</label>
              <input type="text" value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Equipamento Necessário</label>
              <input type="text" value={form.requiredEquipment} onChange={(e) => setForm({ ...form, requiredEquipment: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Ferramentas</label>
              <input type="text" value={form.requiredTools} onChange={(e) => setForm({ ...form, requiredTools: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Info de Segurança</label>
              <input type="text" value={form.safetyInfo} onChange={(e) => setForm({ ...form, safetyInfo: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Observações</label>
              <input type="text" value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="bg-miac-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Criar Código'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-industrial-600 hover:bg-gray-100">Cancelar</button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-industrial-500">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <p className="text-industrial-500">Nenhum código encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ec) => {
            const ri = getRiskInfo(ec.riskLevel);
            const isOpen = expanded === ec.id;
            return (
              <div key={ec.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : ec.id)}
                  className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-mono text-sm font-bold text-miac-primary">{ec.code}</span>
                  <span className={`status-badge ${ri.bg} ${ri.color}`}>{ri.label}</span>
                  <span className="font-medium text-industrial-900 flex-1">{ec.name}</span>
                  {ec.machine && <span className="text-xs text-industrial-400 hidden sm:block">🏭 {ec.machine.name}</span>}
                  <span className="text-industrial-400 text-sm">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3 text-sm">
                    <div><span className="text-industrial-500 font-medium">Descrição:</span><p className="text-industrial-900 mt-0.5">{ec.description}</p></div>
                    {ec.probableCause && <div><span className="text-industrial-500 font-medium">Causa Provável:</span><p className="text-industrial-900 mt-0.5">{ec.probableCause}</p></div>}
                    {ec.solution && <div><span className="text-industrial-500 font-medium">Solução:</span><p className="text-industrial-900 mt-0.5">{ec.solution}</p></div>}
                    {ec.requiredEquipment && <div><span className="text-industrial-500 font-medium">Equipamento:</span><p className="text-industrial-900 mt-0.5">{ec.requiredEquipment}</p></div>}
                    {ec.requiredTools && <div><span className="text-industrial-500 font-medium">Ferramentas:</span><p className="text-industrial-900 mt-0.5">{ec.requiredTools}</p></div>}
                    {ec.safetyInfo && <div><span className="text-red-600 font-medium">⚠️ Segurança:</span><p className="text-red-700 mt-0.5">{ec.safetyInfo}</p></div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
