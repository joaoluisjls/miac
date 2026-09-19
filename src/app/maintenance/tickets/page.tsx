'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { TICKET_STATUSES, PRIORITY_LEVELS, PROBLEM_TYPES } from '@/lib/constants';

type Ticket = {
  id: string;
  number: number;
  status: string;
  priority: string;
  problemType: string;
  description: string;
  errorCode: string | null;
  createdAt: string;
  machine: { id: string; name: string };
  sector: { id: string; name: string };
  creator: { id: string; name: string };
  assignedTo: { id: string; name: string } | null;
};

export default function TicketsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterPriority) params.set('priority', filterPriority);
      const res = await fetch(`/api/tickets?${params.toString()}`);
      const data = await res.json();
      setTickets(data);
    } catch {
      toast.error('Erro ao carregar chamados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterStatus, filterPriority]);

  const assumeTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: userId, status: 'IN_ANALYSIS' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Chamado assumido com sucesso!');
      fetchTickets();
    } catch {
      toast.error('Erro ao assumir chamado');
    }
  };

  const getPriorityIcon = (p: string) =>
    (PRIORITY_LEVELS as any)[p]?.icon || '⚪';

  const getStatusInfo = (s: string) =>
    (TICKET_STATUSES as any)[s] || { label: s, color: 'text-gray-500', bg: 'bg-gray-100' };

  const getPriorityInfo = (p: string) =>
    (PRIORITY_LEVELS as any)[p] || { label: p, color: 'text-gray-500', bg: 'bg-gray-100' };

  const getProblemLabel = (v: string) =>
    PROBLEM_TYPES.find((p) => p.value === v)?.label || v;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-industrial-900">Chamados</h1>
          <p className="text-industrial-500">Gerencie os chamados de manutenção</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-medium text-industrial-600 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent"
            >
              <option value="">Todos</option>
              {Object.entries(TICKET_STATUSES).map(([key, val]) => (
                <option key={key} value={key}>{(val as any).label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-industrial-600 mb-1">Prioridade</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-miac-primary focus:border-transparent"
            >
              <option value="">Todas</option>
              {Object.entries(PRIORITY_LEVELS).map(([key, val]) => (
                <option key={key} value={key}>{(val as any).label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFilterStatus(''); setFilterPriority(''); }}
              className="text-sm text-miac-primary hover:underline px-3 py-2"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tickets list */}
      {loading ? (
        <div className="text-center py-12 text-industrial-500">Carregando chamados...</div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-4xl mb-4 block">📭</span>
          <p className="text-industrial-500">Nenhum chamado encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const statusInfo = getStatusInfo(ticket.status);
            const priorityInfo = getPriorityInfo(ticket.priority);
            const isCritical = ticket.priority === 'CRITICAL';
            return (
              <div
                key={ticket.id}
                className={`bg-white rounded-xl shadow-sm border p-4 transition-shadow hover:shadow-md ${
                  isCritical ? 'border-red-300 critical-pulse' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-sm font-bold text-miac-primary">#{ticket.number}</span>
                      <span className={`status-badge ${statusInfo.bg} ${statusInfo.color}`}>{statusInfo.label}</span>
                      <span className={`priority-badge ${priorityInfo.bg} ${priorityInfo.color}`}>
                        {getPriorityIcon(ticket.priority)} {priorityInfo.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-industrial-900 truncate">{ticket.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-industrial-500 flex-wrap">
                      <span>🏭 {ticket.machine.name}</span>
                      <span>📁 {ticket.sector.name}</span>
                      <span>🔧 {getProblemLabel(ticket.problemType)}</span>
                      {ticket.errorCode && <span>⚠️ {ticket.errorCode}</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-industrial-400">
                      <span>👤 {ticket.creator.name}</span>
                      <span>🕐 {formatDate(ticket.createdAt)}</span>
                      {ticket.assignedTo && <span>👨‍🔧 {ticket.assignedTo.name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!ticket.assignedTo && ticket.status === 'NEW' && (
                      <button
                        onClick={() => assumeTicket(ticket.id)}
                        className="bg-miac-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Assumir
                      </button>
                    )}
                    <Link
                      href={`/maintenance/tickets/${ticket.id}`}
                      className="text-miac-primary hover:underline text-sm font-medium"
                    >
                      Ver detalhes →
                    </Link>
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
