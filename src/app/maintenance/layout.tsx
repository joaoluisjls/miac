'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/maintenance', icon: '📊' },
  { name: 'Chamados', href: '/maintenance/tickets', icon: '🚨' },
  { name: 'Máquinas', href: '/maintenance/machines', icon: '🏭' },
  { name: 'Códigos de Erro', href: '/maintenance/error-codes', icon: '⚠️' },
  { name: 'Componentes', href: '/maintenance/components', icon: '🧩' },
  { name: 'Peças', href: '/maintenance/parts', icon: '📦' },
  { name: 'Preventiva', href: '/maintenance/preventive', icon: '📅' },
  { name: 'Base de Conhecimento', href: '/maintenance/knowledge', icon: '📚' },
  { name: 'Relatórios', href: '/maintenance/reports', icon: '📈' },
  { name: 'Usuários', href: '/maintenance/users', icon: '👥', adminOnly: true },
];

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    const fetchNotifications = async () => {
      try { const res = await fetch('/api/notifications'); const data = await res.json(); setUnreadCount(data.unreadCount || 0); } catch {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredNav = navigation.filter(item => !item.adminOnly || userRole === 'ADMIN');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-industrial-900 text-white">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-industrial-700">
          <div className="w-10 h-10 bg-miac-primary rounded-lg flex items-center justify-center"><span className="text-xl">⚙️</span></div>
          <div><h1 className="text-lg font-bold">MIAC</h1><p className="text-xs text-industrial-400">Central da Manutenção</p></div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {filteredNav.map(item => {
            const isActive = pathname === item.href || (item.href !== '/maintenance' && pathname.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-miac-primary text-white' : 'text-industrial-300 hover:bg-industrial-800 hover:text-white'}`}>
                <span className="text-lg">{item.icon}</span>{item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-industrial-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-industrial-700 rounded-full flex items-center justify-center text-sm font-bold">{session?.user?.name?.charAt(0) || 'U'}</div>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{session?.user?.name}</p><p className="text-xs text-industrial-400">{userRole}</p></div>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="text-industrial-400 hover:text-white transition-colors" title="Sair">🚪</button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-industrial-900 text-white">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-industrial-700">
              <div className="w-10 h-10 bg-miac-primary rounded-lg flex items-center justify-center"><span className="text-xl">⚙️</span></div>
              <div><h1 className="text-lg font-bold">MIAC</h1><p className="text-xs text-industrial-400">Manutenção</p></div>
            </div>
            <nav className="py-4 px-3 space-y-1">
              {filteredNav.map(item => {
                const isActive = pathname === item.href || (item.href !== '/maintenance' && pathname.startsWith(item.href));
                return (
                  <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-miac-primary text-white' : 'text-industrial-300 hover:bg-industrial-800 hover:text-white'}`}>
                    <span className="text-lg">{item.icon}</span>{item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 sm:px-6 h-14">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-industrial-500 hover:text-industrial-700">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-4">
              <Link href="/maintenance/panel" className="text-sm text-industrial-500 hover:text-industrial-700 hidden sm:block">📺 Painel TV</Link>
              <div className="relative">
                <span className="text-xl cursor-pointer">🔔</span>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
