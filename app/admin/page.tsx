'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useFunctions } from '@/lib/supabase-functions';
import {
  FiShoppingBag,
  FiUsers,
  FiUserPlus,
  FiDollarSign,
  FiTrendingUp,
  FiMap,
  FiPlusCircle,
  FiSettings,
} from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StatSkeleton() {
  return (
    <div className="card-gold overflow-hidden rounded-xl p-5 animate-pulse">
      <div className="flex items-center">
        <div className="flex-shrink-0 bg-white/10 rounded-lg w-12 h-12" />
        <div className="ml-5 flex-1 space-y-2">
          <div className="h-3 w-20 bg-white/10 rounded" />
          <div className="h-6 w-16 bg-white/15 rounded" />
        </div>
      </div>
    </div>
  );
}

const SKELETON_BAR_HEIGHTS = [45, 62, 38, 71, 55, 48, 65, 42, 58, 52, 68, 44, 61, 50];

function ChartSkeleton() {
  return (
    <div className="rounded-xl card-gold p-4 animate-pulse">
      <div className="h-4 w-48 bg-white/10 rounded mb-4" />
      <div className="h-64 flex items-end gap-1">
        {SKELETON_BAR_HEIGHTS.map((h, i) => (
          <div key={i} className="flex-1 bg-white/10 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-9 w-80 bg-white/10 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-10">
          {Array.from({ length: 5 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="rounded-xl card-gold p-4 mb-10 animate-pulse">
          <div className="h-4 w-48 bg-white/10 rounded mb-4" />
          <div className="h-72 flex flex-col gap-2">
            {[70, 55, 85, 45, 65, 40].map((w, i) => (
              <div key={i} className="h-8 bg-white/10 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        <div className="mb-6">
          <div className="h-6 w-40 bg-white/10 rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl card-gold animate-pulse">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-white/10 rounded" />
                  <div className="h-3 w-32 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardData {
  totalVendidos: number;
  faturamento: number;
  quantidadeUsuarios: number;
  produtosAtivos: number;
  comprasPendentes: number;
}

const defaultPendingUsers = 0;

interface ChartPoint {
  data: string;
  quantidade: number;
}

interface TopProduct {
  nome: string;
  vendas: number;
}

const defaultData: DashboardData = {
  totalVendidos: 0,
  faturamento: 0,
  quantidadeUsuarios: 0,
  produtosAtivos: 0,
  comprasPendentes: 0,
};

export default function AdminHome() {
  const { user, profile, loading: authLoading } = useAuth();
  const functions = useFunctions();
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<DashboardData | null>(null);
  const [pendingUsersCount, setPendingUsersCount] = useState(defaultPendingUsers);
  const [membersByDay, setMembersByDay] = useState<ChartPoint[]>([]);
  const [withdrawalsByDay, setWithdrawalsByDay] = useState<ChartPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchStarted = useRef(false);

  useEffect(() => {
    if (pathname !== '/admin') return;
    if (authLoading) return;
    if (!user || profile?.role !== 'admin') {
      setLoading(false);
      router.push('/login');
      return;
    }
    if (fetchStarted.current) return;
    fetchStarted.current = true;
    setLoading(true);
    fetchDashboard().finally(() => { fetchStarted.current = false; });
  }, [pathname, authLoading, user, profile, router]);

  const fetchDashboard = async () => {
    try {
      setError(null);
      const [res, pendingRes] = await Promise.all([
        functions.adminDashboard(),
        functions.approveUsers.list().catch(() => ({ users: [] })),
      ]);
      setData({
        totalVendidos: res.totalVendidos,
        faturamento: res.faturamento,
        quantidadeUsuarios: res.quantidadeUsuarios,
        produtosAtivos: res.produtosAtivos,
        comprasPendentes: res.comprasPendentes,
      });
      setPendingUsersCount(pendingRes?.users?.length ?? 0);
      setMembersByDay(res.membersByDay ?? []);
      setWithdrawalsByDay(res.withdrawalsByDay ?? []);
      setTopProducts(res.topProducts ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar');
      setData(defaultData);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <DashboardSkeleton />;
  if (!user || profile?.role !== 'admin') return null;
  if (loading) return <DashboardSkeleton />;

  const stats = [
    { name: 'Total Vendidos', value: data?.totalVendidos ?? 0, icon: FiShoppingBag, color: 'text-steel-300', bgColor: 'bg-steel-800', href: null },
    { name: 'Faturamento', value: `R$ ${(data?.faturamento ?? 0).toFixed(2)}`, icon: FiDollarSign, color: 'text-steel-300', bgColor: 'bg-steel-800', href: null },
    { name: 'Usuários', value: data?.quantidadeUsuarios ?? 0, icon: FiUsers, color: 'text-gold-400', bgColor: 'bg-gold-500/20', href: null },
    { name: 'Produtos Ativos', value: data?.produtosAtivos ?? 0, icon: FiTrendingUp, color: 'text-steel-400', bgColor: 'bg-steel-500/20', href: '/admin/criar' },
    { name: 'Pendentes de aprovação', value: pendingUsersCount, icon: FiUserPlus, color: 'text-steel-400', bgColor: 'bg-steel-500/20', href: '/admin/usuarios' },
  ];

  const quickActions = [
    { label: 'Ver rede em mapa', href: '/admin/rede', icon: FiMap, desc: 'Rede hierárquica expansível' },
    { label: 'Aprovar usuários', href: '/admin/usuarios', icon: FiUserPlus, desc: 'Liberar acesso de novos cadastros' },
    { label: 'Criar produto', href: '/admin/criar', icon: FiPlusCircle, desc: 'Novo produto' },
    { label: 'Config. bônus', href: '/admin/config', icon: FiSettings, desc: 'Percentuais por nível' },
  ];

  const chartClass = 'card-gold rounded-xl p-4';
  const tooltipClass = 'bg-rich-black/95 border border-white/10 rounded-lg px-3 py-2 text-sm text-white';

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Dashboard Administrativo</h1>
          <p className="mt-2 text-sm text-gray-400">Visão geral e analytics do sistema</p>
          {error && <p className="mt-2 text-sm text-steel-300">Não foi possível carregar alguns dados. Exibindo o que foi possível.</p>}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const content = (
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center w-14 h-14">
                  <Icon className="h-10 w-10 text-gold-600 transition-all duration-300 [filter:drop-shadow(0_1px_0_rgba(255,255,255,0.2))_drop-shadow(0_2px_4px_rgba(0,0,0,0.4))] group-hover:text-gold-500 group-hover:[filter:drop-shadow(0_1px_0_rgba(255,255,255,0.35))_drop-shadow(0_2px_4px_rgba(0,0,0,0.3))]" />
                </div>
                <div className="ml-4 min-w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">{stat.name}</dt>
                    <dd className="text-lg font-semibold text-white mt-1 truncate">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            );
            return (
              <div
                key={stat.name}
                className="card-gold group overflow-hidden rounded-xl transition-all duration-300"
              >
                <div className="p-5">
                  {stat.href ? <Link href={stat.href} className="block">{content}</Link> : content}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className={chartClass}>
            <h3 className="text-sm font-semibold text-white mb-4">Novos membros por dia (últimos 14 dias)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={membersByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="data" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} labelStyle={{ color: '#e5e7eb' }} />
                  <Bar dataKey="quantidade" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Cadastros" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={chartClass}>
            <h3 className="text-sm font-semibold text-white mb-4">Saques por dia (últimos 14 dias)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={withdrawalsByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="data" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} labelStyle={{ color: '#e5e7eb' }} />
                  <Line type="monotone" dataKey="quantidade" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', strokeWidth: 0 }} activeDot={{ r: 4 }} name="Saques" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className={`${chartClass} mb-10`}>
          <h3 className="text-sm font-semibold text-white mb-4">Produtos mais vendidos</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ top: 8, right: 24, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="nome" tick={{ fill: '#9ca3af', fontSize: 11 }} width={76} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                <Bar dataKey="vendas" fill="#71717a" radius={[0, 4, 4, 0]} name="Vendas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Ações rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="card-gold flex items-center gap-4 p-4 rounded-xl transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold-900/50 border border-gold-600/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-gold-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{action.label}</p>
                    <p className="text-sm text-gray-400 truncate">{action.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
