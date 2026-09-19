'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || 'maintenance';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) { toast.error('Email ou senha incorretos'); return; }
      toast.success('Login realizado com sucesso!');
      router.push(redirect === 'operator' ? '/operator' : '/maintenance');
    } catch { toast.error('Erro ao fazer login'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-industrial-900 via-industrial-800 to-industrial-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-miac-primary rounded-2xl mb-4 shadow-lg"><span className="text-3xl">⚙️</span></div>
          <h1 className="text-3xl font-bold text-white">MIAC <span className="text-miac-secondary">Pindorama</span></h1>
          <p className="text-industrial-300 mt-2">{redirect === 'operator' ? 'Portal do Operador' : 'Central da Manutenção'}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-industrial-900 mb-6 text-center">Entrar no Sistema</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-industrial-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miac-primary focus:border-transparent outline-none text-gray-900" placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-industrial-700 mb-1.5">Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-miac-primary focus:border-transparent outline-none text-gray-900" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-miac-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
        <div className="text-center mt-6"><a href="/" className="text-industrial-400 hover:text-white transition-colors">← Voltar para seleção de portal</a></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-industrial-500">Carregando...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
