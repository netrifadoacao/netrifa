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
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Faturamento',
      value: `R$ ${data.faturamento.toFixed(2)}`,
      icon: FiDollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Usuários',
      value: data.quantidadeUsuarios,
      icon: FiUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Produtos Ativos',
      value: data.produtosAtivos,
      icon: FiTrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      name: 'Compras Pendentes',
      value: data.comprasPendentes,
      icon: FiClock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="mt-2 text-sm text-gray-600">
            Visão geral do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
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
