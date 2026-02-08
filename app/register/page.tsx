'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

import Image from 'next/image';

export default function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patrocinadorLink = searchParams.get('ref');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      router.replace('/escritorio');
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rich-black relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid opacity-15"></div>

      <div className="max-w-md w-full space-y-8 relative z-10 bg-steel-900/80 backdrop-blur-xl p-8 rounded-2xl border border-steel-700 shadow-2xl my-8">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border border-steel-600 ring-1 ring-white/5">
              <Image 
                src="/logomarca-as.jpeg" 
                alt="AS Miranda" 
                fill 
                sizes="80px"
                className="object-cover"
              />
            </div>
          <h2 className="mt-2 text-3xl font-display font-black text-white">
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-steel-400">
            Comece sua jornada na <span className="text-steel-200 font-semibold">AS Miranda</span>
          </p>
          <p className="mt-2 text-sm text-steel-500">
            Já tem uma conta?{' '}
            <Link href={`/login${patrocinadorLink ? `?ref=${patrocinadorLink}` : ''}`} className="font-medium text-steel-300 hover:text-white transition-colors">
              Faça login
            </Link>
          </p>
          {patrocinadorLink && (
            <div className="mt-4 p-3 bg-steel-800 rounded-lg border border-steel-600">
              <p className="text-sm text-steel-300">
                Patrocinador: <span className="font-semibold text-white">{patrocinadorLink}</span>
              </p>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-steel-800 border border-steel-600 p-4">
              <div className="text-sm text-steel-300">{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-steel-300 mb-1">
                Nome
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-steel-600 placeholder-steel-500 text-white bg-steel-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-transparent sm:text-sm transition-all"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-steel-300 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-steel-600 placeholder-steel-500 text-white bg-steel-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-transparent sm:text-sm transition-all"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-steel-300 mb-1">
                Telefone
              </label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-steel-600 placeholder-steel-500 text-white bg-steel-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-transparent sm:text-sm transition-all"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-steel-300 mb-1">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-steel-600 placeholder-steel-500 text-white bg-steel-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-transparent sm:text-sm transition-all"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-steel-600 text-sm font-bold rounded-xl text-white bg-steel-700 hover:bg-steel-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-steel-500 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
