'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PROBLEM_TYPES, PRIORITY_LEVELS } from '@/lib/constants';

export default function NewTicketPage() {
  const router = useRouter();
  const [machines, setMachines] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ machineId: '', sectorId: '', problemType: '', description: '', errorCode: '', priority: 'MEDIUM' });

  useEffect(() => {
    fetch('/api/machines').then(r => r.json()).then(setMachines);
    fetch('/api/sectors').then(r => r.json()).then(setSectors);
  }, []);

  const handleMachineChange = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId);
    setFormData({ ...formData, machineId, sectorId: machine?.sectorId || '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.machineId || !formData.sectorId || !formData.problemType || !formData.description) {
      toast.error('Preencha todos os campos obrigatórios'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!res.ok) throw new Error();
      const ticket = await res.json();
      toast.success(`Chamado #${ticket.number} criado com sucesso!`);
      router.push('/operator/my-tickets');
    } catch { toast.error('Erro ao criar chamado'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6"><button onClick={() => router.back()} className="text-industrial-500 hover:text-industrial-700">← Voltar</button></div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-2xl mb-3"><span className="text-2xl">🚨</span></div>
          <h1 className="text-2xl font-bold text-industrial-900">Abrir Chamado</h1>
          <p className="text-industrial-500 mt-1">Informe o problema para a manutenção</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-industrial-700 mb-2">Máquina *</label>
            <select value={formData.machineId} onChange={e => handleMachineChange(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miac-primary outline-none text-gray-900 bg-white" required>
              <option value="">Selecione a máquina...</option>
              {machines.map(m => <option key={m.id} value={m.id}>{m.name} — {m.sector?.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-industrial-700 mb-2">Setor *</label>
            <select value={formData.sectorId} onChange={e => setFormData({ ...formData, sectorId: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miac-primary outline-none text-gray-900 bg-white" required>
              <option value="">Selecione o setor...</option>
              {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-industrial-700 mb-2">Tipo do Problema *</label>
            <select value={formData.problemType} onChange={e => setFormData({ ...formData, problemType: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miac-primary outline-none text-gray-900 bg-white" required>
              <option value="">Selecione o tipo...</option>
              {PROBLEM_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-industrial-700 mb-2">Descrição do Problema *</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miac-primary outline-none text-gray-900 resize-none" rows={4} placeholder="Descreva o problema encontrado..." required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-industrial-700 mb-2">Código Apresentado pela Máquina</label>
            <input type="text" value={formData.errorCode} onChange={e => setFormData({ ...formData, errorCode: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miac-primary outline-none text-gray-900" placeholder="Ex: ERR-204" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-industrial-700 mb-3">Prioridade</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(PRIORITY_LEVELS).map(([key, p]) => (
                <button key={key} type="button" onClick={() => setFormData({ ...formData, priority: key })} className={`p-3 rounded-xl border-2 transition-all text-center ${formData.priority === key ? `${p.bg} border-current ${p.color} font-semibold` : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}>
                  <span className="text-lg">{p.icon}</span><p className="text-sm mt-1">{p.label}</p>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-miac-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/25">
            {loading ? 'Enviando...' : '🚨 ENVIAR CHAMADO'}
          </button>
        </form>
      </div>
    </div>
  );
}
