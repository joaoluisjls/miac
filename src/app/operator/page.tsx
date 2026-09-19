'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function OperatorHome() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(' ')[0] || 'Operador';

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-industrial-900 mb-2">Olá, {userName} 👋</h1>
        <p className="text-lg text-industrial-500">Como podemos ajudar?</p>
      </div>
      <div className="space-y-4">
        <Link href="/operator/new-ticket">
          <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-8 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] hover:border-red-300">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <span className="text-3xl">🚨</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-industrial-900 group-hover:text-red-600 transition-colors">Abrir Chamado</h2>
                <p className="text-industrial-500 mt-1">Comunique um problema de manutenção</p>
              </div>
              <div className="ml-auto text-2xl text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all">→</div>
            </div>
          </div>
        </Link>
        <Link href="/operator/my-tickets">
          <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 p-8 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] hover:border-blue-300">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <span className="text-3xl">📋</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-industrial-900 group-hover:text-blue-600 transition-colors">Meus Chamados</h2>
                <p className="text-industrial-500 mt-1">Acompanhe o status dos seus chamados</p>
              </div>
              <div className="ml-auto text-2xl text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">→</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
