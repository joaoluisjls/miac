'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PRIORITY_LEVELS } from '@/lib/constants';

type ErrorCode = {
  id: string;
  code: string;
  name: string;
  description: string;
  probableCause: string | null;
  diagnosticProcedure: string | null;
  solution: string | null;
  riskLevel: string;
  requiredEquipment: string | null;
  requiredTools: string | null;
  observations: string | null;
  safetyInfo: string | null;
  machine: { id: string; name: string } | null;
};

export default function KnowledgePage() {
  const [codes, setCodes] = useState<ErrorCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/error-codes')
      .then((r) => r.json())
      .then((d) => { setCodes(d); setLoading(false); })
      .catch(() => { toast.error('Erro ao carregar base de conhecimento'); setLoading(false); });
  }, []);

  const filtered = search
    ? codes.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.probableCause && c.probableCause.toLowerCase().includes(q)) ||
          (c.solution && c.solution.toLowerCase().includes(q)) ||
          (c.machine && c.machine.name.toLowerCase().includes(q))
        );
      })
    : codes;

  const getRiskInfo = (rl: string) => (PRIORITY_LEVELS as any)[rl] || { label: rl, bg: 'bg-gray-100', color: 'text-gray-500' };

  // Group results by machine
  const grouped = filtered.reduce((acc, ec) => {
    const key = ec.machine?.name || 'Sem máquina associada';
    if (!acc[key]) acc[key] = [];
    acc[key].push(ec);
    return acc;
  }, {} as Record<string, ErrorCode[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-industrial-900">Base de Conhecimento</h1>
        <p className="text-industrial-500">Consulte códigos de erro, diagnósticos e soluções</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, nome, descrição, causa, solução, máquina..."
            className="w-full pl-14 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-miac-primary focus:border-transparent"
          />
        </div>
        {search && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-industrial-500">
              {filtered.length} resultado(s) para &quot;{search}&quot;
            </span>
            <button onClick={() => setSearch('')} className="text-sm text-miac-primary hover:underline">
              Limpar busca
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-industrial-500">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-5xl mb-4 block">📚</span>
          <p className="text-industrial-500 text-lg">
            {search ? 'Nenhum resultado encontrado para sua busca' : 'Nenhum código de erro cadastrado na base de conhecimento'}
          </p>
        </div>
      ) : search ? (
        // Flat list when searching
        <div className="space-y-3">
          {filtered.map((ec) => {
            const ri = getRiskInfo(ec.riskLevel);
            const isOpen = expanded === ec.id;
            return (
              <div key={ec.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : ec.id)}
                  className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">⚠️</span>
                  <span className="font-mono text-sm font-bold text-miac-primary">{ec.code}</span>
                  <span className={`status-badge ${ri.bg} ${ri.color}`}>{ri.label}</span>
                  <span className="font-medium text-industrial-900 flex-1 truncate">{ec.name}</span>
                  {ec.machine && <span className="text-xs text-industrial-400 hidden sm:block">🏭 {ec.machine.name}</span>}
                  <span className="text-industrial-400 text-sm shrink-0">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3 text-sm">
                    <div><span className="text-industrial-500 font-medium">Descrição:</span><p className="text-industrial-900 mt-0.5">{ec.description}</p></div>
                    {ec.probableCause && <div><span className="text-industrial-500 font-medium">Causa Provável:</span><p className="text-industrial-900 mt-0.5">{ec.probableCause}</p></div>}
                    {ec.diagnosticProcedure && <div><span className="text-industrial-500 font-medium">Procedimento de Diagnóstico:</span><p className="text-industrial-900 mt-0.5">{ec.diagnosticProcedure}</p></div>}
                    {ec.solution && <div><span className="text-green-600 font-medium">✅ Solução:</span><p className="text-green-700 mt-0.5">{ec.solution}</p></div>}
                    {ec.requiredEquipment && <div><span className="text-industrial-500 font-medium">Equipamento Necessário:</span><p className="text-industrial-900 mt-0.5">{ec.requiredEquipment}</p></div>}
                    {ec.requiredTools && <div><span className="text-industrial-500 font-medium">Ferramentas:</span><p className="text-industrial-900 mt-0.5">{ec.requiredTools}</p></div>}
                    {ec.safetyInfo && <div><span className="text-red-600 font-medium">⚠️ Informação de Segurança:</span><p className="text-red-700 mt-0.5 font-medium">{ec.safetyInfo}</p></div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Grouped by machine when not searching
        <div className="space-y-6">
          {Object.entries(grouped).map(([machineName, ecList]) => (
            <div key={machineName}>
              <h2 className="text-lg font-bold text-industrial-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🏭</span> {machineName}
                <span className="text-sm font-normal text-industrial-400">({ecList.length})</span>
              </h2>
              <div className="space-y-2">
                {ecList.map((ec) => {
                  const ri = getRiskInfo(ec.riskLevel);
                  const isOpen = expanded === ec.id;
                  return (
                    <div key={ec.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => setExpanded(isOpen ? null : ec.id)}
                        className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <span className={`status-badge ${ri.bg} ${ri.color}`}>{ri.label}</span>
                        <span className="font-mono text-sm font-bold text-miac-primary">{ec.code}</span>
                        <span className="font-medium text-industrial-900 flex-1">{ec.name}</span>
                        <span className="text-industrial-400 text-sm">{isOpen ? '▲' : '▼'}</span>
                      </button>
                      {isOpen && (
                        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3 text-sm">
                          <div><span className="text-industrial-500 font-medium">Descrição:</span><p className="text-industrial-900 mt-0.5">{ec.description}</p></div>
                          {ec.probableCause && <div><span className="text-industrial-500 font-medium">Causa Provável:</span><p className="text-industrial-900 mt-0.5">{ec.probableCause}</p></div>}
                          {ec.diagnosticProcedure && <div><span className="text-industrial-500 font-medium">Procedimento:</span><p className="text-industrial-900 mt-0.5">{ec.diagnosticProcedure}</p></div>}
                          {ec.solution && <div><span className="text-green-600 font-medium">✅ Solução:</span><p className="text-green-700 mt-0.5">{ec.solution}</p></div>}
                          {ec.requiredEquipment && <div><span className="text-industrial-500 font-medium">Equipamento:</span><p className="text-industrial-900 mt-0.5">{ec.requiredEquipment}</p></div>}
                          {ec.requiredTools && <div><span className="text-industrial-500 font-medium">Ferramentas:</span><p className="text-industrial-900 mt-0.5">{ec.requiredTools}</p></div>}
                          {ec.safetyInfo && <div><span className="text-red-600 font-medium">⚠️ Segurança:</span><p className="text-red-700 mt-0.5 font-medium">{ec.safetyInfo}</p></div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
