'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { TICKET_STATUSES, PRIORITY_LEVELS, PROBLEM_TYPES } from '@/lib/constants';

type TicketDetail = {
  id: string;
  number: number;
  status: string;
  priority: string;
  problemType: string;
  description: string;
  errorCode: string | null;
  diagnosis: string | null;
  cause: string | null;
  solution: string | null;
  maintenanceTime: number | null;
  resolvedAt: string | null;
  createdAt: string;
  machine: { id: string; name: string; status: string };
  sector: { id: string; name: string };
  creator: { id: string; name: string; email: string };
  assignedTo: { id: string; name: string; email: string } | null;
  ticketParts: { id: string; quantity: number; part: { id: string; name: string; code: string } }[];
  historyItems: { id: string; title: string; description: string | null; createdAt: string }[];
};

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [diagnosis, setDiagnosis] = useState('');
  const [cause, setCause] = useState('');
  const [solution, setSolution] = useState('');
  const [maintenanceTime, setMaintenanceTime] = useState('');

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTicket(data);
      setDiagnosis(data.diagnosis || '');
      setCause(data.cause || '');
      setSolution(data.solution || '');
      setMaintenanceTime(data.maintenanceTime?.toString() || '');
    } catch {
      toast.error('Erro ao carregar chamado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const patch = async (body: Record<string, any>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      toast.success('Chamado atualizado!');
      await fetchTicket();
    } catch {
      toast.error('Erro ao atualizar chamado');
    } finally {
      setSaving(false);
    }
  };

  const assume = () => patch({ assignedToId: userId, status: 'IN_ANALYSIS' });
  const changeStatus = (s: string) => patch({ status: s });
  const resolve = () =>
    patch({
      status: 'RESOLVED',
      diagnosis,
      cause,
      solution,
      maintenanceTime: maintenanceTime ? parseInt(maintenanceTime) : undefined,
    });
  const saveDiagnosis = () => patch({ diagnosis, cause, solution, maintenanceTime: maintenanceTime ? parseInt(maintenanceTime) : undefined });

  if (loading) return <div className="text-center py-20 text-industrial-500">Carregando...</div>;
  if (!ticket) return <div className="text-center py-20 text-industrial-500">Chamado não encontrado</div>;

  const statusInfo = (TICKET_STATUSES as any)[ticket.status] || { label: ticket.status, bg: 'bg-gray-100', color: 'text-gray-500' };
  const priorityInfo = (PRIORITY_LEVELS as any)[ticket.priority] || { label: ticket.priority, bg: 'bg-gray-100', color: 'text-gray-500', icon: '⚪' };
  const problemLabel = PROBLEM_TYPES.find((p) => p.value === ticket.problemType)?.label || ticket.problemType;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  const formatMinutes = (m: number) => {
    const h = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? `${h}h ${min}min` : `${min}min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/maintenance/tickets" className="text-sm text-miac-primary hover:underline mb-1 inline-block">← Voltar</Link>
          <h1 className="text-2xl font-bold text-industrial-900">
            Chamado <span className="text-miac-primary">#{ticket.number}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`status-badge ${statusInfo.bg} ${statusInfo.color} text-sm px-3 py-1`}>{statusInfo.label}</span>
          <span className={`priority-badge ${priorityInfo.bg} ${priorityInfo.color} text-sm px-3 py-1`}>{priorityInfo.icon} {priorityInfo.label}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-industrial-700 mb-3">Ações</h3>
        <div className="flex flex-wrap gap-2">
          {!ticket.assignedTo && ticket.status === 'NEW' && (
            <button onClick={assume} disabled={saving} className="bg-miac-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              👨‍🔧 Assumir Chamado
            </button>
          )}
          {ticket.status === 'IN_ANALYSIS' && (
            <button onClick={() => changeStatus('IN_PROGRESS')} disabled={saving} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
              🔧 Iniciar Atendimento
            </button>
          )}
          {ticket.status === 'IN_PROGRESS' && (
            <button onClick={() => changeStatus('AWAITING_PART')} disabled={saving} className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 disabled:opacity-50">
              📦 Aguardando Peça
            </button>
          )}
          {(ticket.status === 'IN_ANALYSIS' || ticket.status === 'IN_PROGRESS' || ticket.status === 'AWAITING_PART') && (
            <>
              <button onClick={saveDiagnosis} disabled={saving} className="bg-industrial-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-industrial-800 disabled:opacity-50">
                💾 Salvar Diagnóstico
              </button>
              <button onClick={resolve} disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                ✅ Resolver
              </button>
            </>
          )}
          {ticket.status !== 'CANCELLED' && ticket.status !== 'RESOLVED' && (
            <button onClick={() => changeStatus('CANCELLED')} disabled={saving} className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 disabled:opacity-50">
              ❌ Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-industrial-900 mb-4">Informações</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-industrial-500">Descrição:</span><p className="text-industrial-900 mt-1">{ticket.description}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-industrial-500">Máquina:</span><p className="text-industrial-900">🏭 {ticket.machine.name}</p></div>
                <div><span className="text-industrial-500">Setor:</span><p className="text-industrial-900">📁 {ticket.sector.name}</p></div>
                <div><span className="text-industrial-500">Tipo de Problema:</span><p className="text-industrial-900">🔧 {problemLabel}</p></div>
                {ticket.errorCode && <div><span className="text-industrial-500">Código de Erro:</span><p className="text-industrial-900">⚠️ {ticket.errorCode}</p></div>}
                <div><span className="text-industrial-500">Criado por:</span><p className="text-industrial-900">👤 {ticket.creator.name}</p></div>
                <div><span className="text-industrial-500">Criado em:</span><p className="text-industrial-900">🕐 {formatDate(ticket.createdAt)}</p></div>
                {ticket.assignedTo && <div><span className="text-industrial-500">Responsável:</span><p className="text-industrial-900">👨‍🔧 {ticket.assignedTo.name}</p></div>}
                {ticket.maintenanceTime && <div><span className="text-industrial-500">Tempo de manutenção:</span><p className="text-industrial-900">⏱️ {formatMinutes(ticket.maintenanceTime)}</p></div>}
                {ticket.resolvedAt && <div><span className="text-industrial-500">Resolvido em:</span><p className="text-industrial-900">✅ {formatDate(ticket.resolvedAt)}</p></div>}
              </div>
            </div>
          </div>

          {/* Diagnosis form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-industrial-900 mb-4">Diagnóstico</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-industrial-700 mb-1">Diagnóstico</label>
                <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" placeholder="Descreva o diagnóstico..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-industrial-700 mb-1">Causa</label>
                <textarea value={cause} onChange={(e) => setCause(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" placeholder="Causa do problema..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-industrial-700 mb-1">Solução</label>
                <textarea value={solution} onChange={(e) => setSolution(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" placeholder="Solução aplicada..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-industrial-700 mb-1">Tempo de manutenção (minutos)</label>
                <input type="number" value={maintenanceTime} onChange={(e) => setMaintenanceTime(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent" placeholder="Ex: 120" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Parts used */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-industrial-900 mb-4">Peças Utilizadas</h3>
            {ticket.ticketParts.length === 0 ? (
              <p className="text-sm text-industrial-500">Nenhuma peça registrada</p>
            ) : (
              <div className="space-y-2">
                {ticket.ticketParts.map((tp) => (
                  <div key={tp.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                    <span className="text-industrial-900">{tp.part.name}</span>
                    <span className="text-industrial-500">x{tp.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-industrial-900 mb-4">Histórico</h3>
            {ticket.historyItems.length === 0 ? (
              <p className="text-sm text-industrial-500">Sem registros</p>
            ) : (
              <div className="space-y-3">
                {ticket.historyItems.map((h) => (
                  <div key={h.id} className="border-l-2 border-miac-primary pl-3">
                    <p className="text-sm font-medium text-industrial-900">{h.title}</p>
                    {h.description && <p className="text-xs text-industrial-500 mt-0.5">{h.description}</p>}
                    <p className="text-xs text-industrial-400 mt-0.5">{formatDate(h.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
