import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-industrial-900 via-industrial-800 to-industrial-950 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Logo / Header */}
        <div className="mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-miac-primary rounded-2xl mb-6 shadow-lg">
            <span className="text-4xl">⚙️</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">
            MIAC <span className="text-miac-secondary">Pindorama</span>
          </h1>
          <p className="text-xl text-industrial-300">
            Sistema de Manutenção Industrial
          </p>
        </div>

        {/* Portal Selection */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Portal do Operador */}
          <Link href="/operator">
            <div className="group industrial-card p-8 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-miac-secondary">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                🏭
              </div>
              <h2 className="text-2xl font-bold text-industrial-900 mb-2">
                Portal do Operador
              </h2>
              <p className="text-industrial-500 mb-4">
                Abra chamados e acompanhe o status da manutenção
              </p>
              <div className="inline-flex items-center gap-2 text-miac-primary font-semibold">
                Acessar
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Central da Manutenção */}
          <Link href="/login?redirect=maintenance">
            <div className="group industrial-card p-8 cursor-pointer transition-all hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-miac-primary">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                🔧
              </div>
              <h2 className="text-2xl font-bold text-industrial-900 mb-2">
                Central da Manutenção
              </h2>
              <p className="text-industrial-500 mb-4">
                Gerencie chamados, máquinas e manutenção
              </p>
              <div className="inline-flex items-center gap-2 text-miac-primary font-semibold">
                Acessar
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-industrial-400 text-sm">
          <p>© 2026 MIAC Pindorama — Sistema de Manutenção Industrial</p>
          <p className="mt-1">Tecnologia + Indústria + Segurança + Confiabilidade</p>
        </div>
      </div>
    </div>
  );
}
