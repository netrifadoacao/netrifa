'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiXCircle, FiDollarSign } from 'react-icons/fi';
import { functions } from '@/lib/supabase-functions';

interface Saque {
  id: string;
  usuarioId: string;
  valor: number;
  status: string;
  metodoPagamento: string;
  dadosPagamento: any;
  dataSolicitacao: string;
  dataAprovacao?: string;
  dataPagamento?: string;
  usuario?: { nome: string; email: string };
}

export default function SaquesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [saques, setSaques] = useState<Saque[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || profile?.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchSaques();
  }, [authLoading, user, profile, router]);

  const fetchSaques = async () => {
    try {
      const data = await functions.withdrawals.list();
      setSaques(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar saques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (saqueId: string) => {
    try {
      await functions.withdrawals.approve(saqueId);
      alert('Saque aprovado com sucesso!');
      fetchSaques();
    } catch (error) {
      alert('Erro ao aprovar saque');
    }
  };

  const handlePagar = async (saqueId: string) => {
    if (!confirm('Tem certeza que deseja marcar este saque como pago? O saldo será debitado.')) return;
    try {
      await functions.withdrawals.pay(saqueId);
      alert('Saque marcado como pago!');
      fetchSaques();
    } catch (error) {
      alert('Erro ao marcar saque como pago');
    }
  };

  const handleRecusar = async (saqueId: string) => {
    if (!confirm('Tem certeza que deseja recusar este saque?')) return;
    try {
      await functions.withdrawals.reject(saqueId);
      alert('Saque recusado');
      fetchSaques();
    } catch (error) {
      alert('Erro ao recusar saque');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'aprovado':
        return 'bg-primary-500/10 text-primary-400 border border-primary-500/20';
      case 'pago':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'recusado':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Saques Solicitados</h1>
          <p className="mt-2 text-sm text-gray-400">
            Gerencie saques solicitados pelos usuários
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden sm:rounded-xl">
          <ul className="divide-y divide-white/10">
            {saques.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-400">
                Nenhum saque solicitado no momento.
              </li>
            ) : (
              saques.map((saque) => (
                <li key={saque.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <FiDollarSign className="h-5 w-5 text-primary-400" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">
                            {saque.usuario?.nome} ({saque.usuario?.email})
                          </p>
                          <p className="text-sm text-gray-400">
                            Valor: <span className="font-semibold text-primary-400">R$ {saque.valor.toFixed(2)}</span>
                          </p>
                          <p className="text-sm text-gray-400">
                            Método: {saque.metodoPagamento === 'pix' ? 'PIX' : 'Transferência Bancária'}
                          </p>
                          {saque.metodoPagamento === 'pix' && saque.dadosPagamento?.pix && (
                            <p className="text-sm text-gray-400">PIX: {saque.dadosPagamento.pix}</p>
                          )}
                          {saque.metodoPagamento === 'banco' && (
                            <p className="text-sm text-gray-400">
                              {saque.dadosPagamento?.banco} - Ag: {saque.dadosPagamento?.agencia} - CC: {saque.dadosPagamento?.conta}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Solicitação: {formatDate(saque.dataSolicitacao)}
                          </p>
                          {saque.dataAprovacao && (
                            <p className="text-xs text-gray-500">Aprovação: {formatDate(saque.dataAprovacao)}</p>
                          )}
                          {saque.dataPagamento && (
                            <p className="text-xs text-gray-500">Pagamento: {formatDate(saque.dataPagamento)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(saque.status)}`}>
                        {saque.status.charAt(0).toUpperCase() + saque.status.slice(1)}
                      </span>
                      {saque.status === 'pendente' && (
                        <>
                          <button
                            onClick={() => handleAprovar(saque.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-500 shadow-[0_0_10px_rgba(14,165,233,0.3)] transition-all"
                          >
                            <FiCheckCircle className="mr-1" />
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleRecusar(saque.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-red-600 hover:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all"
                          >
                            <FiXCircle className="mr-1" />
                            Recusar
                          </button>
                        </>
                      )}
                      {saque.status === 'aprovado' && (
                        <button
                          onClick={() => handlePagar(saque.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all"
                        >
                          <FiDollarSign className="mr-1" />
                          Marcar como Pago
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
