'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: '🏠',
  },
  {
    name: 'Meus Bilhetes',
    href: '/dashboard/bilhetes',
    icon: '🎫',
  },
  {
    name: 'Minha Rede',
    href: '/dashboard/rede',
    icon: '🌐',
  },
  {
    name: 'Extrato',
    href: '/dashboard/extrato',
    icon: '📊',
  },
  {
    name: 'Solicitar Saque',
    href: '/dashboard/saque',
    icon: '💰',
  },
  {
    name: 'Meus Dados',
    href: '/dashboard/dados',
    icon: '👤',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="w-64 glass-strong border-r border-white/10 flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-xl">
            R
          </div>
          <span className="text-xl font-bold">RifaNet</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-white/10 flex-shrink-0">
        <div className="glass rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Olá,</p>
          <p className="font-bold text-lg mb-3">{user?.name}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Saldo disponível:</span>
              <span className="text-sm font-bold text-green-400">
                R$ {user?.balance.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Rede:</span>
              <span className="text-sm font-bold text-purple-400">
                {user?.networkSize} pessoas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Referral Link */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <div className="glass rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-2">Seu link de indicação:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={`rifanet.com/ref/${user?.referralCode}`}
              readOnly
              className="flex-1 bg-black/30 px-3 py-2 rounded-lg text-xs"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://rifanet.com/ref/${user?.referralCode}`);
              }}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-semibold transition-colors"
              title="Copiar link"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

