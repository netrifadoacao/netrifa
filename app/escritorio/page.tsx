'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
  FiShoppingBag,
  FiActivity,
  FiArrowRight,
  FiZap,
  FiTarget,
} from 'react-icons/fi';
import { useFunctions } from '@/lib/supabase-functions';

type RedeNode = { id: string; indicados?: RedeNode[] };
type DownlineNode = { profile: { id: string }; children: DownlineNode[] };

function countRede(nodes: RedeNode[]): number {
  if (!Array.isArray(nodes)) return 0;
  return nodes.reduce((acc, n) => 1 + acc + countRede(n.indicados ?? []), 0);
}

function countDownline(nodes: DownlineNode[]): number {
  if (!Array.isArray(nodes)) return 0;
  return nodes.reduce((acc, n) => 1 + acc + countDownline(n.children ?? []), 0);
}

interface OrderRow {
  id: string;
  valor: number;
  status: string;
  produto?: { nome: string };
  dataCompra: string;
}

interface BonusRow {
  id: string;
  valor: number;
  data: string;
}

export default function EscritorioDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const functions = useFunctions();
  const router = useRouter();
  const pathname = usePathname();
  const [saldo, setSaldo] = useState<number | null>(null);
  const [redeCount, setRedeCount] = useState<number | null>(null);
  const [ganhosRecentes, setGanhosRecentes] = useState<BonusRow[]>([]);
  const [totalGanhos, setTotalGanhos] = useState<number>(0);
  const [ultimasCompras, setUltimasCompras] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname !== '/escritorio') return;
    if (authLoading) return;
    if (!user || profile?.role === 'admin') {
      router.push('/login');
      return;
    }
    setLoading(true);
    Promise.all([
      fetch('/api/me/profile', { credentials: 'include' }).then((r) => (r.ok ? r.json() : {})).then((p: { saldo?: number; wallet_balance?: number }) => Number(p?.saldo ?? p?.wallet_balance ?? 0)),
      functions.network(user.id).then((data) => {
        const rede = data.rede;
        if (Array.isArray(rede)) return 1 + countRede(rede as RedeNode[]);
        const me = data.me;
        const downline = (data.downline ?? []) as DownlineNode[];
        if (!me) return 0;
        return 1 + countDownline(downline);
      }),
      fetch('/api/me/bonus', { credentials: 'include' }).then((r) => (r.ok ? r.json() : [])).then((list) => {
        const arr = Array.isArray(list) ? list : [];
        const total = arr.reduce((acc: number, b: BonusRow) => acc + (b.valor ?? 0), 0);
        setTotalGanhos(total);
        return (arr as BonusRow[]).slice(0, 8);
      }),
      functions.orders.list().then((list) => (Array.isArray(list) ? (list as OrderRow[]).slice(0, 5) : [])),
    ])
      .then(([s, rede, bonus, orders]) => {
        setSaldo(s);
        setRedeCount(rede);
        setGanhosRecentes(bonus);
        setUltimasCompras(orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pathname, authLoading, user?.id, profile?.role, router]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatBRL = (n: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

  if (authLoading || !user || profile?.role === 'admin') return null;
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-steel-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-400">
            Visão geral do seu negócio na rede
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Link
            href="/escritorio/saque"
            className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 hover:border-gold-500/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Saldo disponível</p>
                <p className="mt-1 text-2xl font-bold text-gold-300">
                  {saldo != null ? formatBRL(saldo) : '—'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gold-900/30 border border-gold-600/30">
                <FiDollarSign className="h-6 w-6 text-gold-400" />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">Solicitar saque</p>
          </Link>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total em ganhos</p>
                <p className="mt-1 text-2xl font-bold text-steel-200">
                  {formatBRL(totalGanhos)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-steel-800 border border-steel-600">
                <FiTrendingUp className="h-6 w-6 text-steel-300" />
              </div>
            </div>
            <Link
              href="/escritorio/extratos"
              className="mt-3 text-xs text-gold-400 hover:text-gold-300"
            >
              Ver extrato
            </Link>
          </div>

          <Link
            href="/escritorio/rede"
            className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 hover:border-steel-500/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pessoas na rede</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {redeCount ?? '—'}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-steel-800 border border-steel-600">
                <FiUsers className="h-6 w-6 text-steel-300" />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">Ver organograma</p>
          </Link>

          <Link
            href="/escritorio/produtos"
            className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 hover:border-gold-500/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Produtos</p>
                <p className="mt-1 text-lg font-semibold text-steel-200">Indicar e vender</p>
              </div>
              <div className="p-3 rounded-lg bg-gold-900/30 border border-gold-600/30">
                <FiShoppingBag className="h-6 w-6 text-gold-400" />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">Indique para amigos</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FiActivity className="text-gold-400" />
                Últimos ganhos
              </h2>
              <Link
                href="/escritorio/extratos"
                className="text-sm text-gold-400 hover:text-gold-300 flex items-center gap-1"
              >
                Ver todos
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {ganhosRecentes.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum ganho registrado ainda.</p>
            ) : (
              <ul className="space-y-3">
                {ganhosRecentes.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="text-sm text-gray-400">{formatDate(b.data)}</span>
                    <span className="font-medium text-gold-300">+{formatBRL(b.valor)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FiShoppingBag className="text-steel-400" />
                Suas últimas compras
              </h2>
              <Link
                href="/escritorio/produtos"
                className="text-sm text-gold-400 hover:text-gold-300 flex items-center gap-1"
              >
                Comprar
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {ultimasCompras.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma compra recente.</p>
            ) : (
              <ul className="space-y-3">
                {ultimasCompras.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-white">{o.produto?.nome ?? 'Produto'}</p>
                      <p className="text-xs text-gray-500">{formatDate(o.dataCompra)}</p>
                    </div>
                    <span className={`text-sm font-medium ${o.status === 'aprovado' ? 'text-green-400' : 'text-amber-400'}`}>
                      {formatBRL(o.valor)} · {o.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gold-600/20 bg-gold-900/10 p-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <FiZap className="text-gold-400" />
            Insights
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <li className="flex items-start gap-3">
              <FiTarget className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-steel-200">Sua rede</p>
                <p className="text-sm text-gray-400">
                  {redeCount != null && redeCount > 0
                    ? `Você tem ${redeCount} pessoa${redeCount === 1 ? '' : 's'} na rede. Quanto mais você indica e ativa, mais ganha com bônus.`
                    : 'Indique amigos e monte sua rede para começar a ganhar bônus.'}
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <FiTrendingUp className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-steel-200">Ganhos</p>
                <p className="text-sm text-gray-400">
                  {totalGanhos > 0
                    ? `Você já acumulou ${formatBRL(totalGanhos)} em bônus. Solicite saque quando quiser.`
                    : 'Seus ganhos aparecem aqui quando sua rede compra. Indique produtos e acompanhe.'}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
