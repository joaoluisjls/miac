'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MaintenanceDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="text-industrial-500">Carregando dashboard...</div></div>;
  if (!data) return null;

  const newT = data.tickets?.byStatus?.NEW || 0;
  const critT = data.tickets?.byStatus?.CRITICAL || 0;
  const inProg = data.tickets?.byStatus?.IN_PROGRESS || 0;
  const resolved = data.tickets?.byStatus?.RESOLVED || 0;
  const operating = data.machines?.byStatus?.OPERATING || 0;
  const stopped = data.machines?.byStatus?.STOPPED || 0;
  const inMaint = data.machines?.byStatus?.MAINTENANCE || 0;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-industrial-900">Dashboard</h1><p className="text-industrial-500">Visão geral do sistema de manutenção</p></div>

      {newT > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">🚨</span>
            <div><p className="font-bold">{newT} chamado(s) novo(s) aguardando</p>{critT > 0 && <p className="text-red-200 text-sm">⚡ {critT} crítico(s)</p>}</div>
          </div>
          <Link href="/maintenance/tickets" className="bg-white text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-50">Ver Chamados</Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3"><span className="text-2xl">🚨</span><Link href="/maintenance/tickets" className="text-xs text-miac-primary hover:underline">Ver todos →</Link></div>
          <p className="text-3xl font-bold text-industrial-900">{data.tickets?.total || 0}</p><p className="text-sm text-industrial-500">Chamados</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Novos: {newT}</span>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Atendimento: {inProg}</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Resolvidos: {resolved}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3"><span className="text-2xl">🏭</span><Link href="/maintenance/machines" className="text-xs text-miac-primary hover:underline">Ver todas →</Link></div>
          <p className="text-3xl font-bold text-industrial-900">{data.machines?.total || 0}</p><p className="text-sm text-industrial-500">Máquinas</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Operando: {operating}</span>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Paradas: {stopped}</span>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Manutenção: {inMaint}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3"><span className="text-2xl">📅</span><Link href="/maintenance/preventive" className="text-xs text-miac-primary hover:underline">Ver todas →</Link></div>
          <p className="text-3xl font-bold text-industrial-900">{(data.preventive?.overdue || 0) + (data.preventive?.upcoming || 0)}</p><p className="text-sm text-industrial-500">Preventivas</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {data.preventive?.overdue > 0 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">🔴 Atrasadas: {data.preventive.overdue}</span>}
            {data.preventive?.upcoming > 0 && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">🟠 Próximas: {data.preventive.upcoming}</span>}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3"><span className="text-2xl">📦</span><Link href="/maintenance/parts" className="text-xs text-miac-primary hover:underline">Ver peças →</Link></div>
          <p className="text-3xl font-bold text-industrial-900">{data.stock?.lowCount || 0}</p><p className="text-sm text-industrial-500">Estoque Baixo</p>
          {data.stock?.lowCount > 0 && <div className="mt-3"><span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⚠️ Atenção</span></div>}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-industrial-900 mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { href: '/maintenance/tickets', icon: '🚨', label: 'Chamados', bg: 'bg-red-50 hover:bg-red-100' },
            { href: '/maintenance/machines', icon: '🏭', label: 'Máquinas', bg: 'bg-blue-50 hover:bg-blue-100' },
            { href: '/maintenance/error-codes', icon: '⚠️', label: 'Códigos', bg: 'bg-yellow-50 hover:bg-yellow-100' },
            { href: '/maintenance/components', icon: '🧩', label: 'Componentes', bg: 'bg-purple-50 hover:bg-purple-100' },
            { href: '/maintenance/parts', icon: '📦', label: 'Peças', bg: 'bg-green-50 hover:bg-green-100' },
            { href: '/maintenance/preventive', icon: '📅', label: 'Preventiva', bg: 'bg-orange-50 hover:bg-orange-100' },
          ].map(item => (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-2 p-4 rounded-xl ${item.bg} transition-colors text-center`}>
              <span className="text-2xl">{item.icon}</span><span className="text-sm font-medium text-industrial-900">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
