'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiShoppingBag, FiUsers, FiDollarSign, FiTrendingUp, FiClock } from 'react-icons/fi';

interface DashboardData {
  totalVendidos: number;
  faturamento: number;
  quantidadeUsuarios: number;
  produtosAtivos: number;
  comprasPendentes: number;
}

export default function AdminHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.tipo !== 'admin') {
      router.push('/login');
      return;
    }
    fetchDashboard();
  }, [user, router]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      name: 'Total Vendidos',
      value: data.totalVendidos,
      icon: FiShoppingBag,
      color: 'text-primary-400',
      bgColor: 'bg-primary-500/20',
    },
    {
      name: 'Faturamento',
      value: `R$ ${data.faturamento.toFixed(2)}`,
      icon: FiDollarSign,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
    },
    {
      name: 'Usuários',
      value: data.quantidadeUsuarios,
      icon: FiUsers,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
    },
    {
      name: 'Produtos Ativos',
      value: data.produtosAtivos,
      icon: FiTrendingUp,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
    },
    {
      name: 'Compras Pendentes',
      value: data.comprasPendentes,
      icon: FiClock,
      color: 'text-secondary-400',
      bgColor: 'bg-secondary-500/20',
    },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Dashboard Administrativo</h1>
          <p className="mt-2 text-sm text-gray-400">
            Visão geral do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white/5 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3 shadow-inner`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-400 truncate">
                          {stat.name}
                        </dt>
                        <dd className="text-lg font-semibold text-white mt-1">{stat.value}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
