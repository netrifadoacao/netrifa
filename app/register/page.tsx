'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import PixCheckoutModal from '@/components/PixCheckoutModal';
import { TERMOS_TITULO, TERMOS_CONTEUDO } from '@/content/termos-adesao';

const VALOR_ADESAO = 250;

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patrocinadorLink = searchParams.get('ref');

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!aceiteTermos) {
      setError('É obrigatório aceitar os termos do contrato para continuar.');
      return;
    }
    setShowPixModal(true);
  };

  const handlePixContinue = async () => {
    setError('');
    setLoading(true);
    try {
      await register({
        nome,
        email,
        telefone,
        senha,
        patrocinadorLink,
      });
      setShowPixModal(false);
      router.replace('/escritorio');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rich-black relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid opacity-15" />
      <div className="max-w-md w-full space-y-8 relative z-10 glass-strong p-8 rounded-2xl border border-white/10 shadow-glass my-8">
        <div className="text-center">
          <div className="logo-circle-gold w-24 h-24 mx-auto mb-4">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-rich-black">
              <Image
                src="/logo-as.png"
                alt="AS Digital"
                fill
                sizes="96px"
                className="object-contain p-2"
              />
            </div>
          </div>
          <h2 className="mt-2 text-3xl font-display font-black text-white">
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-steel-400">
            Comece sua jornada na <span className="brand-logo-text font-semibold">AS Digital</span>
          </p>
          <p className="mt-2 text-sm text-steel-500">
            Já tem uma conta?{' '}
            <Link href={patrocinadorLink ? `/login?ref=${patrocinadorLink}` : '/login'} className="font-medium text-steel-300 hover:text-white transition-colors">
              Faça login
            </Link>
          </p>
          {patrocinadorLink && (
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-steel-300">
                Patrocinador: <span className="font-semibold text-white">{patrocinadorLink}</span>
              </p>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmitForm}>
          {error && (
            <div className="rounded-lg bg-white/5 border border-white/10 p-4">
              <div className="text-sm text-steel-300">{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-steel-300 mb-1">Nome</label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-white/15 placeholder-steel-500 text-white bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/40 sm:text-sm transition-all"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-steel-300 mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-white/15 placeholder-steel-500 text-white bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/40 sm:text-sm transition-all"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-steel-300 mb-1">Telefone</label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-white/15 placeholder-steel-500 text-white bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/40 sm:text-sm transition-all"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-steel-300 mb-1">Senha</label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-white/15 placeholder-steel-500 text-white bg-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400/40 sm:text-sm transition-all"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg bg-white/5 border border-white/10 p-4 max-h-48 overflow-y-auto">
            <p className="text-xs font-semibold text-steel-300 mb-2">{TERMOS_TITULO}</p>
            <pre className="text-xs text-steel-400 whitespace-pre-wrap font-sans">{TERMOS_CONTEUDO}</pre>
          </div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={aceiteTermos}
              onChange={(e) => setAceiteTermos(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-gold-500 focus:ring-gold-400/50"
            />
            <span className="text-sm text-steel-300 group-hover:text-steel-200">
              Li e aceito os termos do contrato
            </span>
          </label>

          <p className="text-sm text-steel-500">
            Valor da adesão: <span className="font-semibold text-white">R$ {VALOR_ADESAO.toFixed(2)}</span> (pagamento via PIX na próxima etapa).
          </p>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 text-sm font-bold rounded-xl btn-gold-metallic focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-400 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? 'Cadastrando...' : 'Continuar para pagamento PIX'}
          </button>
        </form>
      </div>

      {showPixModal && (
        <PixCheckoutModal
          valor={VALOR_ADESAO}
          onClose={() => setShowPixModal(false)}
          onContinue={handlePixContinue}
        />
      )}
    </div>
  );
}
