'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { FiTrendingUp, FiTrendingDown, FiFileText, FiFilter } from 'react-icons/fi';

type Entrada = {
  id: string;
  tipo: string;
  user_id: string;
  usuario: { nome?: string | null; email?: string } | null;
  valor: number;
  status: string;
  created_at: string;
};

type SaidaBonus = {
  id: string;
  tipo: string;
  user_id: string;
  usuario: { nome?: string | null; email?: string } | null;
  valor: number;
  description: string | null;
  created_at: string;
};

type Saque = {
  id: string;
  tipo: string;
  user_id: string;
  usuario: { nome?: string | null; email?: string } | null;
  valor: number;
  status: string;
  created_at: string;
};

type Lancamento = {
  id: string;
  kind: 'entrada' | 'saida_comissao' | 'saida_saque';
  data: string;
  valor: number;
  label: string;
  usuario: { nome?: string | null; email?: string } | null;
  detail?: string;
};

export default function AdminExtratosPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [saidasBonus, setSaidasBonus] = useState<SaidaBonus[]>([]);
  const [saques, setSaques] = useState<Saque[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroEmail, setFiltroEmail] = useState('');
  const [filtroNome, setFiltroNome] = useState('');

  useEffect(() => {
    if (pathname !== '/admin/extratos') return;
    if (authLoading) return;
    if (!user || profile?.role !== 'admin') {
      router.push('/login');
      return;
    }
    setLoading(true);
    fetch('/api/admin/extrato', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setEntradas(data.entradas ?? []);
        setSaidasBonus(data.saidasBonus ?? []);
        setSaques(data.saques ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pathname, authLoading, user?.id, profile?.role, router]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const lancamentos: Lancamento[] = useMemo(() => {
    const list: Lancamento[] = [];
    entradas.forEach((e) => {
      list.push({
        id: 'e-' + e.id,
        kind: 'entrada',
        data: e.created_at,
        valor: e.valor,
        label: 'Venda / Adesão',
        usuario: e.usuario,
        detail: e.status === 'paid' ? 'Pago' : e.status,
      });
    });
    saidasBonus.forEach((t) => {
      list.push({
        id: 'b-' + t.id,
        kind: 'saida_comissao',
        data: t.created_at,
        valor: t.valor,
        label: 'Comissão (bônus)',
        usuario: t.usuario,
        detail: t.description ?? undefined,
      });
    });
    saques.forEach((w) => {
      list.push({
        id: 's-' + w.id,
        kind: 'saida_saque',
        data: w.created_at,
        valor: w.valor,
        label: 'Saque',
        usuario: w.usuario,
        detail: w.status,
      });
    });
    list.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    return list;
  }, [entradas, saidasBonus, saques]);

  const filtrados = useMemo(() => {
    return lancamentos.filter((l) => {
      const d = new Date(l.data);
      if (filtroDataInicio) {
        const ini = new Date(filtroDataInicio);
        ini.setHours(0, 0, 0, 0);
        if (d < ini) return false;
      }
      if (filtroDataFim) {
        const fim = new Date(filtroDataFim);
        fim.setHours(23, 59, 59, 999);
        if (d > fim) return false;
      }
      const nome = (l.usuario?.nome ?? '').toLowerCase();
      const email = (l.usuario?.email ?? '').toLowerCase();
      if (filtroNome.trim() && !nome.includes(filtroNome.trim().toLowerCase())) return false;
      if (filtroEmail.trim() && !email.includes(filtroEmail.trim().toLowerCase())) return false;
      return true;
    });
  }, [lancamentos, filtroDataInicio, filtroDataFim, filtroNome, filtroEmail]);

  const totalEntradas = entradas.filter((e) => e.status === 'paid').reduce((a, e) => a + e.valor, 0);
  const totalComissoes = saidasBonus.reduce((a, e) => a + e.valor, 0);
  const totalSaques = saques.filter((s) => s.status === 'paid').reduce((a, s) => a + s.valor, 0);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-steel-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display flex items-center gap-2">
            <FiFileText className="w-8 h-8 text-gold-400" />
            Fluxo de caixa
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Entradas (vendas/adesões), comissões pagas e saques
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card-gold rounded-xl p-4 flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Entradas (vendas)</p>
              <p className="text-xl font-bold text-white">R$ {totalEntradas.toFixed(2)}</p>
            </div>
          </div>
          <div className="card-gold rounded-xl p-4 flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <FiTrendingDown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Comissões pagas</p>
              <p className="text-xl font-bold text-white">R$ {totalComissoes.toFixed(2)}</p>
            </div>
          </div>
          <div className="card-gold rounded-xl p-4 flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-steel-500/20 flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-steel-300" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Saques pagos</p>
              <p className="text-xl font-bold text-white">R$ {totalSaques.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card-gold rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4">
          <FiFilter className="w-5 h-5 text-steel-400" />
          <div className="flex flex-wrap gap-3 items-center">
            <label className="text-sm text-gray-400">De</label>
            <input
              type="date"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white text-sm"
            />
            <label className="text-sm text-gray-400">Até</label>
            <input
              type="date"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white text-sm"
            />
            <input
              type="text"
              placeholder="Filtrar por nome"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white text-sm placeholder-gray-500 w-40"
            />
            <input
              type="text"
              placeholder="Filtrar por e-mail"
              value={filtroEmail}
              onChange={(e) => setFiltroEmail(e.target.value)}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white text-sm placeholder-gray-500 w-48"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gold-500 border-t-transparent" />
          </div>
        ) : (
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Lançamentos (por data)</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {filtrados.length === 0 ? (
                <p className="px-6 py-4 text-gray-400 text-sm">Nenhum lançamento no período ou com os filtros informados.</p>
              ) : (
                <ul className="divide-y divide-white/10">
                  {filtrados.map((l) => (
                    <li key={l.id} className="px-6 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{l.usuario?.nome ?? l.usuario?.email ?? '—'}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(l.data)} · {l.label}
                          {l.detail ? ` · ${l.detail}` : ''}
                        </p>
                      </div>
                      <span
                        className={
                          l.kind === 'entrada'
                            ? 'text-green-400 font-semibold'
                            : l.kind === 'saida_comissao'
                              ? 'text-amber-400 font-semibold'
                              : 'text-steel-300 font-semibold'
                        }
                      >
                        {l.kind === 'entrada' ? '+' : '-'} R$ {l.valor.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
