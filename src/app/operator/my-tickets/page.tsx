'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TICKET_STATUSES, PRIORITY_LEVELS, PROBLEM_TYPES } from '@/lib/constants';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tickets').then(r => r.json()).then(d => { setTickets(d); setLoading(false); });
  }, []);

  const getStatusInfo = (s: string) => TICKET_STATUSES[s as keyof typeof TICKET_STATUSES] || { label: s, color: 'text-gray-500', bg: 'bg-gray-100' };
  const getPriorityInfo = (p: string) => PRIORITY_LEVELS[p as keyof typeof PRIORITY_LEVELS] || { label: p, color: 'text-gray-500', bg: 'bg-gray-100', icon: '⚪' };
  const getProblemLabel = (t: string) => PROBLEM_TYPES.find(pt => pt.value === t)?.label || t;

  if (loading) return <div className="flex items-center justify-center py-20"><div className="text-industrial-500">Carregando chamados...</div></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-industrial-900">Meus Chamados</h1><p className="text-industrial-500">{tickets.length} chamado(s)</p></div>
        <Link href="/operator/new-ticket" className="bg-miac-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800">+ Novo Chamado</Link>
      </div>
      {tickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-4xl mb-4 block">📋</span>
          <p className="text-industrial-500 text-lg">Nenhum chamado encontrado</p>
          <Link href="/operator/new-ticket" className="inline-block mt-4 text-miac-primary font-semibold hover:underline">Criar primeiro chamado →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const si = getStatusInfo(ticket.status);
            const pi = getPriorityInfo(ticket.priority);
            return (
              <Link key={ticket.id} href={`/operator/ticket/${ticket.id}`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer transition-all hover:shadow-md hover:border-gray-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-bold text-industrial-900">#{ticket.number}</span>
                        <span className={`status-badge ${si.bg} ${si.color}`}>{si.label}</span>
                        <span className={`priority-badge ${pi.bg} ${pi.color}`}>{pi.icon} {pi.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-industrial-600 mb-1">
                        <span>🏭</span><span>{ticket.machine?.name}</span><span>•</span><span>{ticket.sector?.name}</span>
                      </div>
                      <p className="text-sm text-industrial-500 truncate">{getProblemLabel(ticket.problemType)}: {ticket.description}</p>
                      {ticket.errorCode && <span className="inline-block mt-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">⚠️ {ticket.errorCode}</span>}
                    </div>
                    <div className="text-right text-xs text-industrial-400 whitespace-nowrap">
                      <p>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</p>
                      <p>{new Date(ticket.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      {ticket.assignedTo && <p className="mt-1 text-miac-primary font-medium">🔧 {ticket.assignedTo.name}</p>}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
