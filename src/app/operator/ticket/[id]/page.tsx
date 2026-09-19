'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TICKET_STATUSES, PRIORITY_LEVELS, PROBLEM_TYPES } from '@/lib/constants';

export default function OperatorTicketDetail() {
  const params = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tickets/${params.id}`).then(r => r.json()).then(d => { setTicket(d); setLoading(false); });
  }, [params.id]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="text-industrial-500">Carregando...</div></div>;
  if (!ticket) return <div className="text-center py-20"><p className="text-industrial-500">Chamado não encontrado</p></div>;

  const si = TICKET_STATUSES[ticket.status as keyof typeof TICKET_STATUSES];
  const pi = PRIORITY_LEVELS[ticket.priority as keyof typeof PRIORITY_LEVELS];
  const pl = PROBLEM_TYPES.find(pt => pt.value === ticket.problemType)?.label || ticket.problemType;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6"><button onClick={() => router.back()} className="text-industrial-500 hover:text-industrial-700">← Voltar</button></div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-industrial-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Chamado #{ticket.number}</h1>
              <p className="text-industrial-300 mt-1">Criado em {new Date(ticket.createdAt).toLocaleDateString('pt-BR')} às {new Date(ticket.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${si?.bg} ${si?.color}`}>{si?.label}</span>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-industrial-500">Prioridade:</span>
            <span className={`priority-badge ${pi?.bg} ${pi?.color}`}>{pi?.icon} {pi?.label}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs font-medium text-industrial-500 mb-1">🏭 Máquina</p><p className="font-semibold text-industrial-900">{ticket.machine?.name}</p></div>
            <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs font-medium text-industrial-500 mb-1">📍 Setor</p><p className="font-semibold text-industrial-900">{ticket.sector?.name}</p></div>
          </div>
          <div><p className="text-sm font-medium text-industrial-500 mb-2">Tipo do Problema</p><p className="text-industrial-900 font-medium">{pl}</p></div>
          <div><p className="text-sm font-medium text-industrial-500 mb-2">Descrição</p><p className="text-industrial-900 bg-gray-50 rounded-xl p-4">{ticket.description}</p></div>
          {ticket.errorCode && <div><p className="text-sm font-medium text-industrial-500 mb-2">Código de Erro</p><span className="inline-block bg-red-50 text-red-700 px-3 py-1 rounded-full font-mono font-semibold">⚠️ {ticket.errorCode}</span></div>}
          {ticket.assignedTo && <div className="bg-blue-50 rounded-xl p-4 border border-blue-100"><p className="text-sm font-medium text-blue-700 mb-1">🔧 Técnico Responsável</p><p className="font-semibold text-blue-900">{ticket.assignedTo.name}</p></div>}
          {ticket.diagnosis && <div className="border-t pt-6"><h3 className="font-bold text-industrial-900 mb-3">Diagnóstico</h3><p className="text-industrial-700 bg-gray-50 rounded-xl p-4">{ticket.diagnosis}</p></div>}
          {ticket.cause && <div><h3 className="font-bold text-industrial-900 mb-3">Causa</h3><p className="text-industrial-700 bg-gray-50 rounded-xl p-4">{ticket.cause}</p></div>}
          {ticket.solution && <div><h3 className="font-bold text-industrial-900 mb-3">Solução Aplicada</h3><p className="text-industrial-700 bg-gray-50 rounded-xl p-4">{ticket.solution}</p></div>}
        </div>
      </div>
    </div>
  );
}
