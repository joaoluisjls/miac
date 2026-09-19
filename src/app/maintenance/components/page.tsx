'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type Component = {
  id: string;
  name: string;
  code: string | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  installationDate: string;
  lastReplacement: string | null;
  usefulLifeMonths: number | null;
  usefulLifeHours: number | null;
  quantity: number;
  location: string | null;
  supplier: string | null;
  observations: string | null;
  machine: { id: string; name: string };
};

type Machine = { id: string; name: string };

export default function ComponentsPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterMachine, setFilterMachine] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    machineId: '', name: '', code: '', manufacturer: '', model: '', serialNumber: '',
    installationDate: '', usefulLifeMonths: '', quantity: '1', location: '', supplier: '', observations: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, mRes] = await Promise.all([fetch('/api/components'), fetch('/api/machines')]);
      const cData = await cRes.json();
      const mData = await mRes.json();
      setComponents(cData);
      setMachines(mData);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const createComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.machineId || !form.name || !form.installationDate) {
      toast.error('Máquina, nome e data de instalação são obrigatórios');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, usefulLifeMonths: form.usefulLifeMonths ? parseInt(form.usefulLifeMonths) : null, quantity: parseInt(form.quantity) || 1 };
      const res = await fetch('/api/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success('Componente criado!');
      setShowForm(false);
      setForm({ machineId: '', name: '', code: '', manufacturer: '', model: '', serialNumber: '', installationDate: '', usefulLifeMonths: '', quantity: '1', location: '', supplier: '', observations: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar componente');
    } finally {
      setSaving(false);
    }
  };

  const calcLifePercent = (installDate: string, lastReplacement: string | null, usefulLifeMonths: number | null) => {
    if (!usefulLifeMonths) return null;
    const start = new Date(lastReplacement || installDate);
    const now = new Date();
    const elapsed = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return Math.min(100, Math.round((elapsed / usefulLifeMonths) * 100));
  };

  const getBarColor = (pct: number) => {
    if (pct < 40) return 'bg-green-500';
    if (pct < 70) return 'bg-yellow-500';
    if (pct < 90) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getBarLabel = (pct: number) => {
    if (pct < 40) return { text: 'Normal', color: 'text-green-600' };
    if (pct < 70) return { text: 'Atenção', color: 'text-yellow-600' };
    if (pct < 90) return { text: 'Planejar Manutenção', color: 'text-orange-600' };
    return { text: 'Substituição Urgente', color: 'text-red-600' };
  };

  const filtered = filterMachine ? components.filter((c) => c.machine.id === filterMachine) : components;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-900">Componentes</h1>
          <p className="text-industrial-500">{components.length} componentes cadastrados</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-miac-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          {showForm ? '✕ Fechar' : '+ Novo Componente'}
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <select value={filterMachine} onChange={(e) => setFilterMachine(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent">
          <option value="">Todas as máquinas</option>
          {machines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={createComponent} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-industrial-900 mb-4">Novo Componente</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Máquina *</label>
              <select value={form.machineId} onChange={(e) => setForm({ ...form, machineId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent">
                <option value="">Selecione...</option>
                {machines.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Nome *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Código</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Data Instalação *</label>
              <input type="date" value={form.installationDate} onChange={(e) => setForm({ ...form, installationDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Vida Útil (meses)</label>
              <input type="number" value={form.usefulLifeMonths} onChange={(e) => setForm({ ...form, usefulLifeMonths: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Fabricante</label>
              <input type="text" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Modelo</label>
              <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Localização</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Fornecedor</label>
              <input type="text" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="bg-miac-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Criar Componente'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-industrial-600 hover:bg-gray-100">Cancelar</button>
          </div>
        </form>
      )}

      {/* Component list */}
      {loading ? (
        <div className="text-center py-12 text-industrial-500">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-4xl mb-4 block">🧩</span>
          <p className="text-industrial-500">Nenhum componente encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((comp) => {
            const pct = calcLifePercent(comp.installationDate, comp.lastReplacement, comp.usefulLifeMonths);
            const barColor = pct !== null ? getBarColor(pct) : 'bg-gray-300';
            const label = pct !== null ? getBarLabel(pct) : null;
            return (
              <div key={comp.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-industrial-900">{comp.name}</h3>
                    {comp.code && <p className="text-xs text-miac-primary font-mono">{comp.code}</p>}
                  </div>
                  <span className="text-lg">🧩</span>
                </div>
                <p className="text-sm text-industrial-500 mb-2">🏭 {comp.machine.name}</p>
                {comp.manufacturer && <p className="text-xs text-industrial-400">{comp.manufacturer} {comp.model || ''}</p>}
                <p className="text-xs text-industrial-400">📅 Instalado: {formatDate(comp.installationDate)}</p>
                {pct !== null && label ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-medium ${label.color}`}>{label.text}</span>
                      <span className="text-industrial-500">{pct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-industrial-400 mt-1">Vida útil: {comp.usefulLifeMonths} meses</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-xs text-industrial-400 italic">Sem tempo de vida útil definido</p>
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
