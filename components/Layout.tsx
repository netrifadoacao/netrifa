'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiUser, FiUsers, FiDollarSign, FiFileText, FiLogOut, FiShoppingBag, FiCheckCircle, FiXCircle, FiSettings } from 'react-icons/fi';

interface LayoutProps {
  children: React.ReactNode;
  tipo?: 'usuario' | 'admin';
}

export default function Layout({ children, tipo = 'usuario' }: LayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
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
    { href: '/admin/aprovar', icon: FiCheckCircle, label: 'Aprovar' },
    { href: '/admin/criar', icon: FiShoppingBag, label: 'Criar Produto' },
    { href: '/admin/saques', icon: FiDollarSign, label: 'Saques Solicitados' },
    { href: '/admin/config', icon: FiSettings, label: 'Configuração de Bônus' },
  ];

  const menuItems = tipo === 'admin' ? menuItemsAdmin : menuItemsUsuario;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">
                  {tipo === 'admin' ? 'Painel Administrativo' : 'Escritório Virtual'}
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                {user.nome}
                {tipo === 'usuario' && (
                  <span className="ml-2 text-primary-600 font-semibold">
                    Saldo: R$ {user.saldo.toFixed(2)}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <FiLogOut className="mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
