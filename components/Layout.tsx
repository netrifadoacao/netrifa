'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiHome, FiUser, FiUsers, FiDollarSign, FiFileText, FiLogOut, FiShoppingBag, FiCheckCircle, FiSettings, FiMenu, FiX } from 'react-icons/fi';

interface LayoutProps {
  children: React.ReactNode;
  tipo?: 'usuario' | 'admin';
}

export default function Layout({ children, tipo = 'usuario' }: LayoutProps) {
  const { user, profile, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-steel-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-steel-500 border-t-transparent" />
      </div>
    );
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await Promise.race([
        logout(),
        new Promise((r) => setTimeout(r, 5000)),
      ]);
      router.push('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const menuItemsUsuario = [
    { href: '/escritorio', icon: FiHome, label: 'Home' },
    { href: '/escritorio/dados', icon: FiUser, label: 'Dados' },
    { href: '/escritorio/rede', icon: FiUsers, label: 'Rede' },
    { href: '/escritorio/saque', icon: FiDollarSign, label: 'Solicitar Saque' },
    { href: '/escritorio/extratos', icon: FiFileText, label: 'Extratos' },
  ];

  const menuItemsAdmin = [
    { href: '/admin', icon: FiHome, label: 'Home' },
    { href: '/admin/rede', icon: FiUsers, label: 'Rede' },
    { href: '/admin/aprovar', icon: FiCheckCircle, label: 'Aprovar' },
    { href: '/admin/criar', icon: FiShoppingBag, label: 'Produtos' },
    { href: '/admin/saques', icon: FiDollarSign, label: 'Saques' },
    { href: '/admin/config', icon: FiSettings, label: 'Bônus' },
  ];

  const menuItems = tipo === 'admin' ? menuItemsAdmin : menuItemsUsuario;

  return (
    <div className="min-h-screen bg-rich-black text-steel-100 relative selection:bg-steel-500/30">
      {loggingOut && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-rich-black/95 backdrop-blur-sm" aria-live="polite" role="status">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gold-500/60 border-t-gold-400" />
          <p className="text-steel-300 font-medium">Encerrando sessão com segurança...</p>
        </div>
      )}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-15 pointer-events-none"></div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-rich-black/70 z-50 sm:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 right-0 w-72 max-w-[85vw] glass border-l border-white/10 z-50 sm:hidden flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
              <span className="font-semibold text-gold-200">{tipo === 'admin' ? 'Menu' : 'Menu'}</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-steel-300 hover:text-gold-300 hover:bg-white/5 transition-colors"
                aria-label="Fechar menu"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/10 text-gold-300 border border-gold-400/40'
                        : 'text-silver-400 hover:text-gold-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/10 space-y-3">
              <div className="px-4 py-2 text-sm text-steel-300 truncate">
                {profile?.full_name ?? user?.email ?? ''}
              </div>
              {tipo === 'usuario' && (
                <div className="px-4 py-2">
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-gold-400/50 text-gold-200 font-semibold text-xs shadow-gleam inline-block">
                    R$ {(Number(profile?.wallet_balance) || 0).toFixed(2)}
                  </span>
                </div>
              )}
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                disabled={loggingOut}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 btn-silver-metallic text-sm font-medium rounded-xl group disabled:opacity-70 disabled:pointer-events-none"
              >
                <FiLogOut className="w-4 h-4 flex-shrink-0" />
                Sair
              </button>
            </div>
          </div>
        </>
      )}
      <nav className="glass border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-3 group cursor-pointer" onClick={() => router.push(tipo === 'admin' ? '/admin' : '/escritorio')}>
                <div className="logo-circle-gold flex-shrink-0 w-11 h-11 transition-all duration-300">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-rich-black">
                    <Image 
                      src="/logo-as.png" 
                      alt="AS Digital" 
                      fill 
                      sizes="44px"
                      className="object-contain p-0.5"
                    />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="brand-logo-text font-semibold text-lg">AS Digital</span>
                  <span className="block text-xs text-steel-400 font-normal mt-0.5">{tipo === 'admin' ? 'Painel Administrativo' : 'Escritório Virtual'}</span>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-1 lg:space-x-2 flex-shrink-0">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                        isActive
                          ? 'border-b-2 border-gold-400 text-gold-300 bg-white/5'
                          : 'border-transparent text-silver-400 hover:text-gold-200 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm text-steel-300 flex items-center gap-2">
                <span>{profile?.full_name ?? user?.email ?? ''}</span>
                {tipo === 'usuario' && (
                  <span className="ml-2 px-3 py-1 rounded-full bg-white/5 border border-gold-400/50 text-gold-200 font-semibold text-xs shadow-gleam">
                    R$ {(Number(profile?.wallet_balance) || 0).toFixed(2)}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 btn-silver-metallic text-sm font-medium rounded-full group disabled:opacity-70 disabled:pointer-events-none"
              >
                <FiLogOut className="w-4 h-4 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
                <span className="whitespace-nowrap">Sair</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg text-steel-300 hover:text-gold-300 hover:bg-white/5 transition-colors"
                aria-label="Abrir menu"
              >
                <FiMenu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10" key={pathname}>
        {children}
      </main>
    </div>
  );
}
