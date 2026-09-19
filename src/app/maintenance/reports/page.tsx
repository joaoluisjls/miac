'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { TICKET_STATUSES, PRIORITY_LEVELS, PROBLEM_TYPES, MACHINE_STATUSES } from '@/lib/constants';

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
  createdAt: string;
  machine: { name: string };
  sector: { name: string };
};

export default function ReportsPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch('/api/dashboard').then((r) => r.json()), fetch('/api/tickets').then((r) => r.json())])
      .then(([d, t]) => { setDashboard(d); setTickets(t); setLoading(false); })
      .catch(() => { toast.error('Erro ao carregar dados'); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-20 text-industrial-500">Carregando relatórios...</div>;
  if (!dashboard) return null;

  // Bar chart helper
  const BarChart = ({ data, title }: { data: { label: string; value: number; color: string }[]; title: string }) => {
    const max = Math.max(...data.map((d) => d.value), 1);
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-industrial-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm text-industrial-700 w-32 truncate shrink-0">{item.label}</span>
              <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${item.color}`} style={{ width: `${(item.value / max) * 100}%`, minWidth: item.value > 0 ? '24px' : '0px' }} />
              </div>
              <span className="text-sm font-bold text-industrial-900 w-8 text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Ticket status data
  const ticketStatusData = Object.entries(TICKET_STATUSES).map(([key, val]) => ({
    label: (val as any).label,
    value: dashboard.tickets.byStatus[key] || 0,
    color: key === 'NEW' ? 'bg-blue-500' : key === 'IN_ANALYSIS' ? 'bg-yellow-500' : key === 'IN_PROGRESS' ? 'bg-orange-500' : key === 'AWAITING_PART' ? 'bg-purple-500' : key === 'AWAITING_PRODUCTION' ? 'bg-cyan-500' : key === 'RESOLVED' ? 'bg-green-500' : 'bg-gray-400',
  }));

  // Machine status data
  const machineStatusData = Object.entries(MACHINE_STATUSES).map(([key, val]) => ({
    label: (val as any).label,
    value: dashboard.machines.byStatus[key] || 0,
    color: key === 'OPERATING' ? 'bg-green-500' : key === 'MAINTENANCE' ? 'bg-yellow-500' : key === 'STOPPED' ? 'bg-red-500' : 'bg-gray-400',
  }));

  // Tickets by machine (top 10)
  const ticketsByMachine = tickets.reduce((acc, t) => {
    const name = t.machine.name;
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const machineChartData = Object.entries(ticketsByMachine)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([label, value]) => ({ label, value, color: 'bg-miac-primary' }));

  // Tickets by problem type
  const ticketsByProblem = tickets.reduce((acc, t) => {
    const label = PROBLEM_TYPES.find((p: any) => p.value === t.problemType)?.label || t.problemType;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const problemChartData = Object.entries(ticketsByProblem)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([label, value]) => ({ label, value: value as number, color: 'bg-orange-500' }));

  // Priority distribution
  const priorityData = Object.entries(PRIORITY_LEVELS).map(([key, val]) => ({
    label: (val as any).label,
    value: tickets.filter((t) => t.priority === key).length,
    color: key === 'CRITICAL' ? 'bg-red-500' : key === 'HIGH' ? 'bg-orange-500' : key === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500',
  }));

  // Summary stats
  const resolved = dashboard.tickets.byStatus.RESOLVED || 0;
  const total = dashboard.tickets.total || 0;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-industrial-900">Relatórios</h1>
        <p className="text-industrial-500">Visão geral e indicadores do sistema</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Chamados', value: total, icon: '🚨', color: 'text-blue-600' },
          { label: 'Taxa Resolução', value: `${resolutionRate}%`, icon: '✅', color: 'text-green-600' },
          { label: 'Máquinas', value: dashboard.machines.total, icon: '🏭', color: 'text-industrial-700' },
          { label: 'Paradas', value: dashboard.machines.byStatus.STOPPED || 0, icon: '🔴', color: 'text-red-600' },
          { label: 'Componentes', value: dashboard.components.total, icon: '🧩', color: 'text-purple-600' },
          { label: 'Estoque Baixo', value: dashboard.stock.lowCount, icon: '📦', color: 'text-yellow-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <span className="text-2xl">{kpi.icon}</span>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-industrial-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart data={ticketStatusData} title="📊 Chamados por Status" />
        <BarChart data={machineStatusData} title="🏭 Máquinas por Status" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart data={priorityData} title="⚡ Chamados por Prioridade" />
        <BarChart data={machineChartData} title="🔧 Chamados por Máquina (Top 10)" />
      </div>
      {problemChartData.length > 0 && (
        <BarChart data={problemChartData} title="🔧 Chamados por Tipo de Problema" />
      )}

      {/* Preventive summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-industrial-900 mb-4">📅 Manutenção Preventiva</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <p className="text-3xl font-bold text-red-600">{dashboard.preventive.overdue}</p>
            <p className="text-sm text-red-600">Atrasadas</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <p className="text-3xl font-bold text-orange-600">{dashboard.preventive.upcoming}</p>
            <p className="text-sm text-orange-600">Próximas (30 dias)</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-3xl font-bold text-green-600">—</p>
            <p className="text-sm text-green-600">Em dia</p>
          </div>
        </div>
      </div>
    </div>
  );
}
