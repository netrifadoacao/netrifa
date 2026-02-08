'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiHome, FiUser, FiUsers, FiUserPlus, FiDollarSign, FiFileText, FiLogOut, FiShoppingBag, FiSettings, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { getAvatarDisplayUrl } from '@/lib/avatar';

interface LayoutProps {
  children: React.ReactNode;
  tipo?: 'usuario' | 'admin';
}

export default function Layout({ children, tipo = 'usuario' }: LayoutProps) {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !profile?.id) return;
    if (!('full_name' in profile)) {
      refreshProfile();
    }
  }, [user?.id, profile?.id, profile?.full_name, refreshProfile]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [userMenuOpen]);

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

  const goToLogout = () => router.push('/logout');

  const menuItemsUsuario = [
    { href: '/escritorio', icon: FiHome, label: 'Home' },
    { href: '/escritorio/dados', icon: FiUser, label: 'Dados' },
    { href: '/escritorio/rede', icon: FiUsers, label: 'Rede' },
    { href: '/escritorio/produtos', icon: FiShoppingBag, label: 'Produtos' },
    { href: '/escritorio/saque', icon: FiDollarSign, label: 'Solicitar Saque' },
    { href: '/escritorio/extratos', icon: FiFileText, label: 'Extratos' },
  ];

  const menuItemsAdmin = [
    { href: '/admin', icon: FiHome, label: 'Home' },
    { href: '/admin/dados', icon: FiUser, label: 'Dados' },
    { href: '/admin/rede', icon: FiUsers, label: 'Rede' },
    { href: '/admin/usuarios', icon: FiUserPlus, label: 'Aprovar usuários' },
    { href: '/admin/criar', icon: FiShoppingBag, label: 'Produtos' },
    { href: '/admin/saques', icon: FiDollarSign, label: 'Saques' },
    { href: '/admin/config', icon: FiSettings, label: 'Bônus' },
  ];

  const menuItems = tipo === 'admin' ? menuItemsAdmin : menuItemsUsuario;
  const dadosHref = tipo === 'admin' ? '/admin/dados' : '/escritorio/dados';
  const displayName = profile?.full_name ?? user?.email ?? 'Usuário';
  const avatarUrl = getAvatarDisplayUrl(profile?.avatar_url ?? null);

  return (
    <>
    <Toaster position="bottom-right" toastOptions={{ duration: 4000, style: { background: '#1c1917', color: '#fef3c7', border: '1px solid rgba(245,158,11,0.5)' } }} />
    <div className="min-h-screen bg-rich-black text-steel-100 relative selection:bg-steel-500/30">
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
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-white/10 border-2 border-white/20">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-steel-400">
                      <FiUser className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{displayName}</p>
                  {user?.email && <p className="text-xs text-steel-400 truncate">{user.email}</p>}
                  {tipo === 'usuario' && (
                    <p className="text-xs text-gold-200 font-semibold mt-0.5">R$ {(Number(profile?.wallet_balance) || 0).toFixed(2)}</p>
                  )}
                </div>
              </div>
              <Link
                href={dadosHref}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-steel-200 hover:text-gold-200 hover:bg-white/5 border border-white/10 transition-colors"
              >
                <FiUser className="w-4 h-4 flex-shrink-0" />
                Editar perfil
              </Link>
              <button
                onClick={() => { setMobileMenuOpen(false); goToLogout(); }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 btn-silver-metallic text-sm font-medium rounded-xl group"
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
            <div className="flex items-center space-x-2 sm:space-x-3" ref={userMenuRef}>
              <div className="hidden sm:block relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label="Menu do usuário"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/20">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-steel-400">
                        <FiUser className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-steel-200 max-w-[120px] lg:max-w-[160px] truncate">{displayName}</span>
                  <FiChevronDown className={`w-4 h-4 flex-shrink-0 text-steel-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 py-2 rounded-xl bg-rich-black border border-white/10 shadow-xl z-50 animate-fade-in">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                      <div className="flex-shrink-0 w-11 h-11 rounded-full overflow-hidden bg-white/10 border-2 border-white/20">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-steel-400">
                            <FiUser className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                        {user?.email && <p className="text-xs text-steel-400 truncate">{user.email}</p>}
                        {tipo === 'usuario' && (
                          <p className="text-xs text-gold-200 font-semibold mt-0.5">Saldo: R$ {(Number(profile?.wallet_balance) || 0).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        href={dadosHref}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-steel-200 hover:bg-white/5 hover:text-gold-200 transition-colors"
                      >
                        <FiUser className="w-4 h-4 flex-shrink-0" />
                        Editar perfil
                      </Link>
                      <button
                        type="button"
                        onClick={() => { setUserMenuOpen(false); goToLogout(); }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-steel-200 hover:bg-white/5 hover:text-red-300 transition-colors"
                      >
                        <FiLogOut className="w-4 h-4 flex-shrink-0" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="sm:hidden flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full border border-white/10"
                aria-label="Abrir menu"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-white/10 border border-white/20">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-steel-400">
                      <FiUser className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <FiMenu className="w-5 h-5 text-steel-400" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10" key={pathname}>
        {children}
      </main>
    </div>
    </>
  );
}
