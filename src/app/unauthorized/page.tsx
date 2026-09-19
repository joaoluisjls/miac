import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <span className="text-6xl block mb-4">🔒</span>
        <h1 className="text-3xl font-bold text-industrial-900 mb-2">Acesso Não Autorizado</h1>
        <p className="text-industrial-500 mb-6">Você não tem permissão para acessar esta página.</p>
        <Link href="/" className="bg-miac-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors">
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
