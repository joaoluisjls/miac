'use client';

import { useState, useEffect } from 'react';
import { TICKET_STATUSES, PRIORITY_LEVELS, MACHINE_STATUSES } from '@/lib/constants';

type DashboardData = {
  tickets: { total: number; byStatus: Record<string, number> };
  machines: { total: number; byStatus: Record<string, number> };
  components: { total: number };
  stock: { lowCount: number };
  preventive: { overdue: number; upcoming: number };
};

type Ticket = {
  id: string;
  number: number;
  status: string;
  priority: string;
  problemType: string;
  description: string;
  createdAt: string;
  machine: { name: string };
  assignedTo: { name: string } | null;
};

type Machine = {
  id: string;
  name: string;
  status: string;
  sector: { name: string };
};

export default function PanelPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [refreshInterval, setRefreshInterval] = useState(15);

  const fetchData = async () => {
    try {
      const [dRes, tRes, mRes] = await Promise.all([
        fetch('/api/dashboard').then((r) => r.json()),
        fetch('/api/tickets').then((r) => r.json()),
        fetch('/api/machines').then((r) => r.json()),
      ]);
      setDashboard(dRes);
      setTickets(Array.isArray(tRes) ? tRes : []);
      setMachines(Array.isArray(mRes) ? mRes : []);
      setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-industrial-950 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">⚙️ Carregando painel...</div>
      </div>
    );
  }

  const criticalTickets = tickets.filter((t) => t.priority === 'CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'CANCELLED');
  const newTickets = tickets.filter((t) => t.status === 'NEW');
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS');

  const getStatusInfo = (s: string) => (TICKET_STATUSES as any)[s] || { label: s, bg: 'bg-gray-800', color: 'text-gray-400' };
  const getMachineInfo = (s: string) => (MACHINE_STATUSES as any)[s] || { label: s, color: 'text-gray-400', icon: '⚫' };
  const getPriorityInfo = (p: string) => (PRIORITY_LEVELS as any)[p] || { label: p, color: 'text-gray-400', icon: '⚪' };

  const formatTime = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000 / 60);
    if (diff < 60) return `${diff}min`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return `${Math.floor(diff / 1440)}d`;
  };

  return (
    <div className="min-h-screen bg-industrial-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-miac-primary rounded-xl flex items-center justify-center">
            <span className="text-2xl">⚙️</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">MIAC <span className="text-miac-secondary">Pindorama</span></h1>
            <p className="text-industrial-400 text-sm">Painel de Manutenção Industrial</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-industrial-400 text-sm">Última atualização</p>
          <p className="text-white font-mono text-lg">{lastUpdate}</p>
          <p className="text-industrial-500 text-xs">Atualiza a cada {refreshInterval}s</p>
        </div>
      </div>

      {/* Critical alerts */}
      {criticalTickets.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-red-900/50 to-red-800/30 border border-red-500/50 rounded-xl p-5 critical-pulse">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl animate-pulse">🚨</span>
            <h2 className="text-xl font-bold text-red-400">ALERTAS CRÍTICOS ({criticalTickets.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {criticalTickets.map((t) => (
              <div key={t.id} className="bg-red-900/40 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-red-400">#{t.number}</span>
                  <span className="text-xs text-red-300 bg-red-900/50 px-2 py-0.5 rounded-full">{getStatusInfo(t.status).label}</span>
                </div>
                <p className="text-sm text-white font-medium">{t.machine.name}</p>
                <p className="text-xs text-red-300 mt-1">{t.description}</p>
                <p className="text-xs text-industrial-400 mt-1">🕐 {formatTime(t.createdAt)} atrás</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Chamados', value: dashboard.tickets.total, icon: '🚨', accent: 'border-blue-500/30' },
          { label: 'Novos', value: dashboard.tickets.byStatus.NEW || 0, icon: '🔵', accent: 'border-blue-500/30' },
          { label: 'Em Atendimento', value: dashboard.tickets.byStatus.IN_PROGRESS || 0, icon: '🟠', accent: 'border-orange-500/30' },
          { label: 'Máquinas', value: dashboard.machines.total, icon: '🏭', accent: 'border-industrial-500/30' },
          { label: 'Paradas', value: dashboard.machines.byStatus.STOPPED || 0, icon: '🔴', accent: 'border-red-500/30' },
          { label: 'Estoque Baixo', value: dashboard.stock.lowCount, icon: '📦', accent: 'border-yellow-500/30' },
        ].map((s) => (
          <div key={s.label} className={`bg-industrial-900/50 border ${s.accent} rounded-xl p-4 text-center`}>
            <span className="text-2xl">{s.icon}</span>
            <p className="text-3xl font-bold text-white mt-1">{s.value}</p>
            <p className="text-xs text-industrial-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New tickets */}
        <div className="bg-industrial-900/50 border border-blue-500/20 rounded-xl p-5">
          <h2 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
            <span className="text-xl">🔵</span> Novos Chamados ({newTickets.length})
          </h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {newTickets.length === 0 ? (
              <p className="text-industrial-500 text-sm">Nenhum chamado novo</p>
            ) : (
              newTickets.slice(0, 15).map((t) => {
                const pi = getPriorityInfo(t.priority);
                return (
                  <div key={t.id} className="bg-industrial-800/50 rounded-lg p-3 border border-industrial-700/50">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400">#{t.number}</span>
                      <span className="text-xs">{pi.icon}</span>
                      <span className="text-sm text-white truncate flex-1">{t.machine.name}</span>
                    </div>
                    <p className="text-xs text-industrial-400 mt-1 truncate">{t.description}</p>
                    <p className="text-xs text-industrial-500 mt-1">🕐 {formatTime(t.createdAt)} atrás</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* In progress */}
        <div className="bg-industrial-900/50 border border-orange-500/20 rounded-xl p-5">
          <h2 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
            <span className="text-xl">🟠</span> Em Atendimento ({inProgressTickets.length})
          </h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {inProgressTickets.length === 0 ? (
              <p className="text-industrial-500 text-sm">Nenhum em atendimento</p>
            ) : (
              inProgressTickets.slice(0, 15).map((t) => (
                <div key={t.id} className="bg-industrial-800/50 rounded-lg p-3 border border-industrial-700/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-orange-400">#{t.number}</span>
                    <span className="text-sm text-white truncate flex-1">{t.machine.name}</span>
                  </div>
                  <p className="text-xs text-industrial-400 mt-1 truncate">{t.description}</p>
                  {t.assignedTo && <p className="text-xs text-orange-300 mt-1">👨‍🔧 {t.assignedTo.name}</p>}
                  <p className="text-xs text-industrial-500 mt-1">🕐 {formatTime(t.createdAt)} atrás</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Machine status */}
        <div className="bg-industrial-900/50 border border-industrial-600/20 rounded-xl p-5">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">🏭</span> Status das Máquinas
          </h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {machines.map((m) => {
              const mi = getMachineInfo(m.status);
              return (
                <div key={m.id} className={`bg-industrial-800/50 rounded-lg p-3 border ${m.status === 'STOPPED' ? 'border-red-500/40' : 'border-industrial-700/50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{mi.icon}</span>
                      <span className="text-sm text-white font-medium">{m.name}</span>
                    </div>
                    <span className={`text-xs ${mi.color}`}>{mi.label}</span>
                  </div>
                  <p className="text-xs text-industrial-500 mt-1">📁 {m.sector.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preventive alerts */}
      {(dashboard.preventive.overdue > 0 || dashboard.preventive.upcoming > 0) && (
        <div className="mt-6 bg-industrial-900/50 border border-yellow-500/20 rounded-xl p-5">
          <h2 className="text-lg font-bold text-yellow-400 mb-3">📅 Manutenção Preventiva</h2>
          <div className="flex gap-6">
            {dashboard.preventive.overdue > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔴</span>
                <div>
                  <p className="text-2xl font-bold text-red-400">{dashboard.preventive.overdue}</p>
                  <p className="text-xs text-red-300">Atrasadas</p>
                </div>
              </div>
            )}
            {dashboard.preventive.upcoming > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">🟠</span>
                <div>
                  <p className="text-2xl font-bold text-orange-400">{dashboard.preventive.upcoming}</p>
                  <p className="text-xs text-orange-300">Próximas</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-industrial-600 text-xs">
        <p>MIAC Pindorama — Sistema de Manutenção Industrial</p>
      </div>
    </div>
  );
}
