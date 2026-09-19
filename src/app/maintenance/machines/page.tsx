'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MACHINE_STATUSES } from '@/lib/constants';

type Machine = {
  id: string;
  name: string;
  code: string | null;
  status: string;
  manufacturer: string | null;
  model: string | null;
  location: string | null;
  sector: { id: string; name: string };
};

type Sector = { id: string; name: string };

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ name: '', code: '', sectorId: '', manufacturer: '', model: '', serialNumber: '', year: '', location: '', observations: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, sRes] = await Promise.all([fetch('/api/machines'), fetch('/api/sectors')]);
      const mData = await mRes.json();
      const sData = await sRes.json();
      setMachines(mData);
      setSectors(sData);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const createMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sectorId) { toast.error('Nome e setor são obrigatórios'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success('Máquina criada!');
      setShowForm(false);
      setForm({ name: '', code: '', sectorId: '', manufacturer: '', model: '', serialNumber: '', year: '', location: '', observations: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar máquina');
    } finally {
      setSaving(false);
    }
  };

  const filtered = filterStatus ? machines.filter((m) => m.status === filterStatus) : machines;
  const statusCounts = machines.reduce((acc, m) => { acc[m.status] = (acc[m.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-900">Máquinas</h1>
          <p className="text-industrial-500">{machines.length} máquinas cadastradas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-miac-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          {showForm ? '✕ Fechar' : '+ Nova Máquina'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={createMachine} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-industrial-900 mb-4">Nova Máquina</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Nome *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Código</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Setor *</label>
              <select value={form.sectorId} onChange={(e) => setForm({ ...form, sectorId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent">
                <option value="">Selecione...</option>
                {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
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
              <label className="block text-xs font-medium text-industrial-600 mb-1">Nº Série</label>
              <input type="text" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Ano</label>
              <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Localização</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Observações</label>
              <input type="text" value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="bg-miac-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Criar Máquina'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-industrial-600 hover:bg-gray-100">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Status summary */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterStatus('')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filterStatus ? 'bg-industrial-900 text-white' : 'bg-white border border-gray-200 text-industrial-700 hover:bg-gray-50'}`}>
          Todas ({machines.length})
        </button>
        {Object.entries(MACHINE_STATUSES).map(([key, val]) => (
          <button key={key} onClick={() => setFilterStatus(key)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === key ? 'bg-industrial-900 text-white' : 'bg-white border border-gray-200 text-industrial-700 hover:bg-gray-50'}`}>
            {(val as any).icon} {(val as any).label} ({statusCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Machine cards */}
      {loading ? (
        <div className="text-center py-12 text-industrial-500">Carregando máquinas...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-4xl mb-4 block">🏭</span>
          <p className="text-industrial-500">Nenhuma máquina encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((machine) => {
            const ms = (MACHINE_STATUSES as any)[machine.status] || { label: machine.status, color: 'text-gray-500', bg: 'bg-gray-100', icon: '⚫' };
            return (
              <Link key={machine.id} href={`/maintenance/machines/${machine.id}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] h-full">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">🏭</span>
                    <span className={`status-badge ${ms.bg} ${ms.color}`}>{ms.icon} {ms.label}</span>
                  </div>
                  <h3 className="font-bold text-industrial-900 mb-1">{machine.name}</h3>
                  {machine.code && <p className="text-xs text-miac-primary font-mono mb-1">{machine.code}</p>}
                  <p className="text-sm text-industrial-500">📁 {machine.sector.name}</p>
                  {machine.manufacturer && <p className="text-xs text-industrial-400 mt-1">{machine.manufacturer} {machine.model || ''}</p>}
                  {machine.location && <p className="text-xs text-industrial-400">📍 {machine.location}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
