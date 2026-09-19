'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { MACHINE_STATUSES, TICKET_STATUSES, PRIORITY_LEVELS, COMPONENT_ALERT_LEVELS } from '@/lib/constants';

type MachineDetail = {
  id: string;
  name: string;
  code: string | null;
  patrimonyNumber: string | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  year: number | null;
  location: string | null;
  status: string;
  observations: string | null;
  createdAt: string;
  sector: { id: string; name: string };
  tickets: { id: string; number: number; status: string; priority: string; description: string; createdAt: string; assignedTo: { name: string } | null }[];
  components: { id: string; name: string; code: string | null; usefulLifeMonths: number | null; installationDate: string; lastReplacement: string | null }[];
  errorCodes: { id: string; code: string; name: string; riskLevel: string; description: string }[];
};

type Tab = 'info' | 'tickets' | 'components' | 'errors';

export default function MachineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [machine, setMachine] = useState<MachineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('info');

  useEffect(() => {
    fetch(`/api/machines/${id}`)
      .then((r) => r.json())
      .then((d) => { setMachine(d); setLoading(false); })
      .catch(() => { toast.error('Erro ao carregar máquina'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-center py-20 text-industrial-500">Carregando...</div>;
  if (!machine) return <div className="text-center py-20 text-industrial-500">Máquina não encontrada</div>;

  const ms = (MACHINE_STATUSES as any)[machine.status] || { label: machine.status, color: 'text-gray-500', bg: 'bg-gray-100', icon: '⚫' };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'info', label: 'Informações', icon: '📋' },
    { key: 'tickets', label: `Chamados (${machine.tickets.length})`, icon: '🚨' },
    { key: 'components', label: `Componentes (${machine.components.length})`, icon: '🧩' },
    { key: 'errors', label: `Códigos (${machine.errorCodes.length})`, icon: '⚠️' },
  ];

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  const calcLifePercent = (installDate: string, lastReplacement: string | null, usefulLifeMonths: number | null) => {
    if (!usefulLifeMonths) return null;
    const start = new Date(lastReplacement || installDate);
    const now = new Date();
    const elapsed = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return Math.min(100, Math.round((elapsed / usefulLifeMonths) * 100));
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/maintenance/machines" className="text-sm text-miac-primary hover:underline mb-1 inline-block">← Voltar</Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-industrial-900">{machine.name}</h1>
          <span className={`status-badge ${ms.bg} ${ms.color} text-sm px-3 py-1`}>{ms.icon} {ms.label}</span>
        </div>
        {machine.code && <p className="text-sm text-miac-primary font-mono">{machine.code}</p>}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-miac-primary text-miac-primary'
                  : 'border-transparent text-industrial-500 hover:text-industrial-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info tab */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-industrial-900 mb-4">Dados da Máquina</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {[
              { label: 'Nome', value: machine.name },
              { label: 'Código', value: machine.code || '—' },
              { label: 'Nº Patrimônio', value: machine.patrimonyNumber || '—' },
              { label: 'Setor', value: machine.sector.name },
              { label: 'Fabricante', value: machine.manufacturer || '—' },
              { label: 'Modelo', value: machine.model || '—' },
              { label: 'Nº Série', value: machine.serialNumber || '—' },
              { label: 'Ano', value: machine.year?.toString() || '—' },
              { label: 'Localização', value: machine.location || '—' },
              { label: 'Observações', value: machine.observations || '—' },
              { label: 'Criada em', value: formatDate(machine.createdAt) },
            ].map((item) => (
              <div key={item.label}>
                <span className="text-industrial-500 text-xs">{item.label}</span>
                <p className="text-industrial-900 font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tickets tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-3">
          {machine.tickets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-industrial-500">Nenhum chamado para esta máquina</p>
            </div>
          ) : (
            machine.tickets.map((t) => {
              const si = (TICKET_STATUSES as any)[t.status] || { label: t.status, bg: 'bg-gray-100', color: 'text-gray-500' };
              const pi = (PRIORITY_LEVELS as any)[t.priority] || { label: t.priority, bg: 'bg-gray-100', color: 'text-gray-500', icon: '⚪' };
              return (
                <Link key={t.id} href={`/maintenance/tickets/${t.id}`}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-sm font-bold text-miac-primary">#{t.number}</span>
                      <span className={`status-badge ${si.bg} ${si.color}`}>{si.label}</span>
                      <span className={`priority-badge ${pi.bg} ${pi.color}`}>{pi.icon} {pi.label}</span>
                      <span className="text-sm text-industrial-700 flex-1 truncate">{t.description}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-industrial-400">
                      <span>🕐 {formatDate(t.createdAt)}</span>
                      {t.assignedTo && <span>👨‍🔧 {t.assignedTo.name}</span>}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* Components tab */}
      {activeTab === 'components' && (
        <div className="space-y-3">
          {machine.components.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-industrial-500">Nenhum componente cadastrado</p>
            </div>
          ) : (
            machine.components.map((comp) => {
              const pct = calcLifePercent(comp.installationDate, comp.lastReplacement, comp.usefulLifeMonths);
              const barColor = pct === null ? 'bg-gray-300' : pct < 50 ? 'bg-green-500' : pct < 80 ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={comp.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-industrial-900">{comp.name}</span>
                      {comp.code && <span className="text-xs text-industrial-500 ml-2 font-mono">{comp.code}</span>}
                    </div>
                    <span className="text-xs text-industrial-400">Instalado: {formatDate(comp.installationDate)}</span>
                  </div>
                  {pct !== null ? (
                    <div>
                      <div className="flex items-center justify-between text-xs text-industrial-500 mb-1">
                        <span>Vida útil</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-industrial-400">Sem tempo de vida útil definido</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Error codes tab */}
      {activeTab === 'errors' && (
        <div className="space-y-3">
          {machine.errorCodes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-industrial-500">Nenhum código de erro cadastrado</p>
            </div>
          ) : (
            machine.errorCodes.map((ec) => {
              const rl = (PRIORITY_LEVELS as any)[ec.riskLevel] || { label: ec.riskLevel, bg: 'bg-gray-100', color: 'text-gray-500' };
              return (
                <div key={ec.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-bold text-miac-primary">{ec.code}</span>
                    <span className={`status-badge ${rl.bg} ${rl.color}`}>{rl.label}</span>
                    <span className="font-medium text-industrial-900">{ec.name}</span>
                  </div>
                  <p className="text-sm text-industrial-500 mt-1">{ec.description}</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
