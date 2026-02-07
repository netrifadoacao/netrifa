'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import {
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiMap,
  FiPlusCircle,
  FiSettings,
} from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StatSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-white/10 p-5 animate-pulse">
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
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse">
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
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-10 animate-pulse">
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
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse">
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

function formatDay(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function AdminHome() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [membersByDay, setMembersByDay] = useState<ChartPoint[]>([]);
  const [withdrawalsByDay, setWithdrawalsByDay] = useState<ChartPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || profile?.role !== 'admin') {
      setLoading(false);
      router.push('/login');
      return;
    }
    fetchDashboard();
  }, [authLoading, user, profile, router]);

  const fetchDashboard = async () => {
    try {
      setError(null);
      const supabase = createClient();
      const days = 14;
      const from = new Date();
      from.setDate(from.getDate() - days);
      const fromIso = from.toISOString();

      const [profilesRes, ordersRes, productsRes, withdrawalsRes] = await Promise.all([
        supabase.from('profiles').select('id, created_at').gte('created_at', fromIso),
        supabase.from('orders').select('id, amount, status, product_id, created_at'),
        supabase.from('products').select('id, name, active'),
        supabase.from('withdrawals').select('id, created_at').gte('created_at', fromIso),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;
      if (withdrawalsRes.error) throw withdrawalsRes.error;

      const orders = ordersRes.data ?? [];
      const paid = orders.filter((o) => o.status === 'paid');
      const pending = orders.filter((o) => o.status === 'pending');
      const totalVendidos = paid.length;
      const faturamento = paid.reduce((s, o) => s + Number(o.amount), 0);
      const quantidadeUsuarios = (profilesRes.data ?? []).length;
      const { count: totalUsers } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      const produtosAtivos = (productsRes.data ?? []).filter((p) => p.active).length;
      const comprasPendentes = pending.length;

      setData({
        totalVendidos,
        faturamento,
        quantidadeUsuarios: totalUsers ?? 0,
        produtosAtivos,
        comprasPendentes,
      });

      const byDay = (arr: { created_at?: string }[]) => {
        const map = new Map<string, number>();
        for (let i = 0; i < days; i++) {
          const d = new Date();
          d.setDate(d.getDate() - (days - 1 - i));
          map.set(d.toISOString().slice(0, 10), 0);
        }
        arr.forEach((r) => {
          if (!r.created_at) return;
          const key = r.created_at.slice(0, 10);
          if (!map.has(key)) map.set(key, 0);
          map.set(key, map.get(key)! + 1);
        });
        return Array.from(map.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([data, quantidade]) => ({ data: formatDay(new Date(data)), quantidade }));
      };
      setMembersByDay(byDay(profilesRes.data ?? []));
      setWithdrawalsByDay(byDay(withdrawalsRes.data ?? []));

      const productCount: Record<string, number> = {};
      paid.forEach((o) => {
        const id = o.product_id ?? 'sem-produto';
        productCount[id] = (productCount[id] ?? 0) + 1;
      });
      const products = productsRes.data ?? [];
      const top: TopProduct[] = Object.entries(productCount)
        .map(([id, vendas]) => ({
          nome: id === 'sem-produto' ? 'Sem produto' : products.find((p) => p.id === id)?.name ?? id.slice(0, 8),
          vendas,
        }))
        .sort((a, b) => b.vendas - a.vendas)
        .slice(0, 8);
      setTopProducts(top);
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
    { name: 'Total Vendidos', value: data?.totalVendidos ?? 0, icon: FiShoppingBag, color: 'text-primary-400', bgColor: 'bg-primary-500/20', href: null },
    { name: 'Faturamento', value: `R$ ${(data?.faturamento ?? 0).toFixed(2)}`, icon: FiDollarSign, color: 'text-amber-400', bgColor: 'bg-amber-500/20', href: null },
    { name: 'Usuários', value: data?.quantidadeUsuarios ?? 0, icon: FiUsers, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', href: null },
    { name: 'Produtos Ativos', value: data?.produtosAtivos ?? 0, icon: FiTrendingUp, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', href: '/admin/criar' },
    { name: 'Compras Pendentes', value: data?.comprasPendentes ?? 0, icon: FiClock, color: 'text-secondary-400', bgColor: 'bg-secondary-500/20', href: '/admin/aprovar' },
  ];

  const quickActions = [
    { label: 'Ver rede em mapa', href: '/admin/rede', icon: FiMap, desc: 'Rede hierárquica expansível' },
    { label: 'Aprovar compras', href: '/admin/aprovar', icon: FiCheckCircle, desc: 'Compras pendentes' },
    { label: 'Criar produto', href: '/admin/criar', icon: FiPlusCircle, desc: 'Novo produto' },
    { label: 'Config. bônus', href: '/admin/config', icon: FiSettings, desc: 'Percentuais por nível' },
  ];

  const chartClass = 'rounded-xl border border-white/10 bg-white/5 p-4';
  const tooltipClass = 'bg-rich-black/95 border border-white/10 rounded-lg px-3 py-2 text-sm text-white';

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Dashboard Administrativo</h1>
          <p className="mt-2 text-sm text-gray-400">Visão geral e analytics do sistema</p>
          {error && <p className="mt-2 text-sm text-amber-400">Não foi possível carregar alguns dados. Exibindo o que foi possível.</p>}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const content = (
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3 shadow-inner`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 min-w-0 flex-1">
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
                className="bg-white/5 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(14,165,233,0.1)]"
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
                  <Bar dataKey="quantidade" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Cadastros" />
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
                  <Line type="monotone" dataKey="quantidade" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 4 }} name="Saques" />
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
                <Bar dataKey="vendas" fill="#10b981" radius={[0, 4, 4, 0]} name="Vendas" />
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
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/30 transition-all group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary-400" />
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
