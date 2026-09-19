'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type Part = {
  id: string;
  code: string;
  name: string;
  category: string | null;
  manufacturer: string | null;
  model: string | null;
  currentStock: number;
  minimumStock: number;
  location: string | null;
  supplier: string | null;
  price: number | null;
  observations: string | null;
};

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterLow, setFilterLow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '', name: '', category: '', manufacturer: '', model: '',
    currentStock: '0', minimumStock: '0', location: '', supplier: '', price: '', observations: '',
  });

  const fetchParts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/parts');
      const data = await res.json();
      setParts(data);
    } catch {
      toast.error('Erro ao carregar peças');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchParts(); }, []);

  const createPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) { toast.error('Código e nome são obrigatórios'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        currentStock: parseInt(form.currentStock) || 0,
        minimumStock: parseInt(form.minimumStock) || 0,
        price: form.price ? parseFloat(form.price) : null,
      };
      const res = await fetch('/api/parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success('Peça criada!');
      setShowForm(false);
      setForm({ code: '', name: '', category: '', manufacturer: '', model: '', currentStock: '0', minimumStock: '0', location: '', supplier: '', price: '', observations: '' });
      fetchParts();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar peça');
    } finally {
      setSaving(false);
    }
  };

  const lowStockCount = parts.filter((p) => p.currentStock <= p.minimumStock).length;

  const filtered = parts.filter((p) => {
    if (filterLow && p.currentStock > p.minimumStock) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.manufacturer && p.manufacturer.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const formatCurrency = (v: number | null) => v != null ? `R$ ${v.toFixed(2).replace('.', ',')}` : '—';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-900">Peças / Estoque</h1>
          <p className="text-industrial-500">{parts.length} peças cadastradas{lowStockCount > 0 && <span className="text-red-500 font-medium"> — {lowStockCount} com estoque baixo</span>}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-miac-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          {showForm ? '✕ Fechar' : '+ Nova Peça'}
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl animate-pulse">⚠️</span>
          <div>
            <p className="font-bold text-orange-800">{lowStockCount} peça(s) com estoque abaixo do mínimo</p>
            <p className="text-sm text-orange-600">Ação urgente necessária para repor o estoque</p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Buscar por código, nome, categoria..."
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent"
        />
        <button
          onClick={() => setFilterLow(!filterLow)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterLow ? 'bg-red-500 text-white' : 'bg-white border border-gray-200 text-industrial-700 hover:bg-gray-50'}`}
        >
          ⚠️ Estoque Baixo ({lowStockCount})
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={createPart} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-industrial-900 mb-4">Nova Peça</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Código *</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Nome *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Categoria</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
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
              <label className="block text-xs font-medium text-industrial-600 mb-1">Estoque Atual</label>
              <input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Estoque Mínimo</label>
              <input type="number" value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Localização</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Fornecedor</label>
              <input type="text" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-industrial-600 mb-1">Preço (R$)</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="bg-miac-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Criar Peça'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-industrial-600 hover:bg-gray-100">Cancelar</button>
          </div>
        </form>
      )}

      {/* Parts table */}
      {loading ? (
        <div className="text-center py-12 text-industrial-500">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-4xl mb-4 block">📦</span>
          <p className="text-industrial-500">Nenhuma peça encontrada</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-industrial-600">Código</th>
                  <th className="text-left px-4 py-3 font-medium text-industrial-600">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-industrial-600">Categoria</th>
                  <th className="text-center px-4 py-3 font-medium text-industrial-600">Estoque</th>
                  <th className="text-center px-4 py-3 font-medium text-industrial-600">Mínimo</th>
                  <th className="text-right px-4 py-3 font-medium text-industrial-600">Preço</th>
                  <th className="text-left px-4 py-3 font-medium text-industrial-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((part) => {
                  const isLow = part.currentStock <= part.minimumStock;
                  const isEmpty = part.currentStock === 0;
                  return (
                    <tr key={part.id} className={`hover:bg-gray-50 ${isLow ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3 font-mono text-miac-primary font-medium">{part.code}</td>
                      <td className="px-4 py-3 text-industrial-900 font-medium">{part.name}</td>
                      <td className="px-4 py-3 text-industrial-500">{part.category || '—'}</td>
                      <td className="px-4 py-3 text-center font-bold">{part.currentStock}</td>
                      <td className="px-4 py-3 text-center text-industrial-500">{part.minimumStock}</td>
                      <td className="px-4 py-3 text-right text-industrial-500">{formatCurrency(part.price)}</td>
                      <td className="px-4 py-3">
                        {isEmpty ? (
                          <span className="status-badge bg-red-100 text-red-700">🔴 Esgotado</span>
                        ) : isLow ? (
                          <span className="status-badge bg-yellow-100 text-yellow-700">⚠️ Baixo</span>
                        ) : (
                          <span className="status-badge bg-green-100 text-green-700">✅ OK</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
