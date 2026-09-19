'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/operator" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-miac-primary rounded-lg flex items-center justify-center">
                <span className="text-xl">🏭</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-industrial-900">MIAC</h1>
                <p className="text-xs text-industrial-500 -mt-1">Portal do Operador</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              {session?.user && (
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-industrial-900">{session.user.name}</p>
                  <p className="text-xs text-industrial-500">Operador</p>
                </div>
              )}
              <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm text-industrial-500 hover:text-red-600 transition-colors">Sair</button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  );
}
