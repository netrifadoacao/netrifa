'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiHome, FiUser, FiUsers, FiDollarSign, FiFileText, FiLogOut, FiShoppingBag, FiCheckCircle, FiSettings } from 'react-icons/fi';

interface LayoutProps {
  children: React.ReactNode;
  tipo?: 'usuario' | 'admin';
}

export default function Layout({ children, tipo = 'usuario' }: LayoutProps) {
  const { user, profile, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
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
    <div className="min-h-screen bg-rich-black text-gray-100 relative selection:bg-primary-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-secondary-900/20 pointer-events-none"></div>

      <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-3 group cursor-pointer" onClick={() => router.push(tipo === 'admin' ? '/admin' : '/escritorio')}>
                <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-primary-500 shadow-[0_0_15px_rgba(0,136,255,0.5)] group-hover:shadow-[0_0_25px_rgba(0,136,255,0.7)] transition-all duration-300">
                  <Image 
                    src="/logomarca-as.jpeg" 
                    alt="AS Miranda" 
                    fill 
                    sizes="40px"
                    className="object-cover scale-150"
                  />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 via-white to-secondary-500 bg-clip-text text-transparent hidden sm:block">
                  {tipo === 'admin' ? 'Painel Administrativo' : 'Escritório Virtual'}
                </h1>
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
                          ? 'border-b-2 border-primary-500 text-primary-400 bg-primary-500/10'
                          : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
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
              <div className="text-sm text-gray-300 flex items-center gap-2">
                <span className="hidden sm:inline">{profile?.full_name ?? user?.email ?? ''}</span>
                {tipo === 'usuario' && (
                  <span className="ml-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 font-semibold text-xs shadow-[0_0_10px_rgba(14,165,233,0.1)]">
                    R$ {(Number(profile?.wallet_balance) || 0).toFixed(2)}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-2 border border-secondary-500/30 text-sm font-medium rounded-full text-white bg-secondary-600/80 hover:bg-secondary-600 shadow-[0_0_10px_rgba(255,41,41,0.2)] transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,41,41,0.4)] backdrop-blur-sm group"
              >
                <FiLogOut className="w-4 h-4 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline whitespace-nowrap">Sair</span>
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
