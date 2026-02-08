'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

import Image from 'next/image';

function clearAuthStorage() {
  if (typeof window === 'undefined') return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('sb-') || key.startsWith('supabase.'))) keysToRemove.push(key);
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.startsWith('sb-') || key.startsWith('supabase.'))) sessionStorage.removeItem(key);
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAndGetRole, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const patrocinadorLink = searchParams.get('ref');

  useEffect(() => {
    clearAuthStorage();
    logout();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const done = () => {
      setLoading(false);
    };
    try {
      const role = await Promise.race([
        loginAndGetRole(email, senha),
        new Promise<'admin' | 'member' | null>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 10000)
        ),
      ]);
      if (role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/escritorio');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'timeout') {
        setError('Demorou demais. Tente novamente.');
        router.replace('/');
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      }
    } finally {
      done();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rich-black relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid opacity-15"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10 bg-steel-900/80 backdrop-blur-xl p-8 rounded-2xl border border-steel-700 shadow-2xl">
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
            Bem-vindo de volta
          </h2>
          <p className="mt-2 text-sm text-steel-400">
            Acesse sua conta <span className="text-steel-200 font-semibold">AS Miranda</span>
          </p>
          <p className="mt-2 text-sm text-steel-500">
            Ou{' '}
            <Link href={`/register${patrocinadorLink ? `?ref=${patrocinadorLink}` : ''}`} className="font-medium text-steel-300 hover:text-white transition-colors">
              cadastre-se aqui
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-steel-800 border border-steel-600 p-4">
              <div className="text-sm text-steel-300">{error}</div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-steel-300 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-steel-600 placeholder-steel-500 text-white bg-steel-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-transparent sm:text-sm transition-all"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-steel-600 placeholder-steel-500 text-white bg-steel-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-steel-500 focus:border-transparent sm:text-sm transition-all"
                placeholder="••••••••"
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
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
