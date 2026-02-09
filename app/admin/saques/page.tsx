'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';
import { FiCheckCircle, FiXCircle, FiDollarSign, FiX } from 'react-icons/fi';
import { useFunctions } from '@/lib/supabase-functions';

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

type ModalTipo = 'pagar' | 'recusar' | null;

export default function SaquesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const functions = useFunctions();
  const router = useRouter();
  const pathname = usePathname();
  const [saques, setSaques] = useState<Saque[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ tipo: ModalTipo; saque: Saque } | null>(null);

  useEffect(() => {
    if (pathname !== '/admin/saques') return;
    if (authLoading) return;
    if (!user || profile?.role !== 'admin') {
      router.push('/login');
      return;
    }
    setLoading(true);
    fetchSaques();
  }, [pathname, authLoading, user, profile, router]);

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
      toast.success('Saque aprovado com sucesso!');
      fetchSaques();
    } catch (error) {
      toast.error('Erro ao aprovar saque');
    }
  };

  const handlePagar = async (saqueId: string) => {
    try {
      await functions.withdrawals.pay(saqueId);
      toast.success('Saque marcado como pago!');
      setModal(null);
      fetchSaques();
    } catch (error) {
      toast.error('Erro ao marcar saque como pago');
    }
  };

  const handleRecusar = async (saqueId: string) => {
    try {
      await functions.withdrawals.reject(saqueId);
      toast.success('Saque recusado');
      setModal(null);
      fetchSaques();
    } catch (error) {
      toast.error('Erro ao recusar saque');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-steel-800 text-steel-300 border border-steel-600';
      case 'aprovado':
        return 'bg-steel-800 text-steel-300 border border-steel-600';
      case 'pago':
        return 'bg-steel-700/50 text-steel-300 border border-steel-500';
      case 'recusado':
        return 'bg-steel-800 text-steel-400 border border-steel-600';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-steel-500"></div>
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
                        <FiDollarSign className="h-5 w-5 text-steel-300" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">
                            {saque.usuario?.nome} ({saque.usuario?.email})
                          </p>
                          <p className="text-sm text-gray-400">
                            Valor: <span className="font-semibold text-steel-300">R$ {saque.valor.toFixed(2)}</span>
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
                            className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-lg btn-silver-metallic transition-all"
                          >
                            <FiCheckCircle className="mr-1" />
                            Aprovar
                          </button>
                          <button
                            onClick={() => setModal({ tipo: 'recusar', saque })}
                            className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-lg btn-silver-metallic transition-all"
                          >
                            <FiXCircle className="mr-1" />
                            Recusar
                          </button>
                        </>
                      )}
                      {saque.status === 'aprovado' && (
                        <button
                          onClick={() => setModal({ tipo: 'pagar', saque })}
                          className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-lg btn-gold-metallic transition-all"
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

      {modal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="glass-strong rounded-2xl max-w-md w-full p-6 border border-white/20 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl font-bold text-white">
                {modal.tipo === 'pagar' ? 'Confirmar pagamento' : 'Confirmar recusa'}
              </h3>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="p-2 rounded-lg text-steel-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            {modal.tipo === 'pagar' ? (
              <>
                <p className="text-steel-300 text-sm mb-2">
                  Tem certeza que deseja marcar este saque como pago? O saldo do usuário será debitado.
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  <span className="text-white font-medium">{modal.saque.usuario?.nome}</span> ({modal.saque.usuario?.email}) — R$ {modal.saque.valor.toFixed(2)}
                </p>
              </>
            ) : (
              <>
                <p className="text-steel-300 text-sm mb-2">
                  Tem certeza que deseja recusar este saque?
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  <span className="text-white font-medium">{modal.saque.usuario?.nome}</span> — R$ {modal.saque.valor.toFixed(2)}
                </p>
              </>
            )}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-white/20 text-steel-300 hover:bg-white/5 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => modal.tipo === 'pagar' ? handlePagar(modal.saque.id) : handleRecusar(modal.saque.id)}
                className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition-all ${modal.tipo === 'pagar' ? 'btn-gold-metallic' : 'bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30'}`}
              >
                {modal.tipo === 'pagar' ? 'Sim, marcar como pago' : 'Sim, recusar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
