'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiXCircle, FiDollarSign } from 'react-icons/fi';

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
  const { user } = useAuth();
  const router = useRouter();
  const [saques, setSaques] = useState<Saque[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.tipo !== 'admin') {
      router.push('/login');
      return;
    }
    fetchSaques();
  }, [user, router]);

  const fetchSaques = async () => {
    try {
      const response = await fetch('/api/saques');
      const data = await response.json();
      setSaques(data);
    } catch (error) {
      console.error('Erro ao buscar saques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (saqueId: string) => {
    try {
      const response = await fetch(`/api/saques/${saqueId}/aprovar`, {
        method: 'PUT',
      });

      if (!response.ok) {
        alert('Erro ao aprovar saque');
        return;
      }

      alert('Saque aprovado com sucesso!');
      fetchSaques();
    } catch (error) {
      alert('Erro ao aprovar saque');
    }
  };

  const handlePagar = async (saqueId: string) => {
    if (!confirm('Tem certeza que deseja marcar este saque como pago? O saldo será debitado.')) return;

    try {
      const response = await fetch(`/api/saques/${saqueId}/pagar`, {
        method: 'PUT',
      });

      if (!response.ok) {
        alert('Erro ao marcar saque como pago');
        return;
      }

      alert('Saque marcado como pago!');
      fetchSaques();
    } catch (error) {
      alert('Erro ao marcar saque como pago');
    }
  };

  const handleRecusar = async (saqueId: string) => {
    if (!confirm('Tem certeza que deseja recusar este saque?')) return;

    try {
      const response = await fetch(`/api/saques/${saqueId}/recusar`, {
        method: 'PUT',
      });

      if (!response.ok) {
        alert('Erro ao recusar saque');
        return;
      }

      alert('Saque recusado');
      fetchSaques();
    } catch (error) {
      alert('Erro ao recusar saque');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aprovado':
        return 'bg-blue-100 text-blue-800';
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'recusado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Saques Solicitados</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gerencie saques solicitados pelos usuários
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {saques.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">
                Nenhum saque solicitado no momento.
              </li>
            ) : (
              saques.map((saque) => (
                <li key={saque.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <FiDollarSign className="h-5 w-5 text-primary-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {saque.usuario?.nome} ({saque.usuario?.email})
                          </p>
                          <p className="text-sm text-gray-500">
                            Valor: <span className="font-semibold text-primary-600">R$ {saque.valor.toFixed(2)}</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Método: {saque.metodoPagamento === 'pix' ? 'PIX' : 'Transferência Bancária'}
                          </p>
                          {saque.metodoPagamento === 'pix' && saque.dadosPagamento?.pix && (
                            <p className="text-sm text-gray-500">PIX: {saque.dadosPagamento.pix}</p>
                          )}
                          {saque.metodoPagamento === 'banco' && (
                            <p className="text-sm text-gray-500">
                              {saque.dadosPagamento?.banco} - Ag: {saque.dadosPagamento?.agencia} - CC: {saque.dadosPagamento?.conta}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Solicitação: {formatDate(saque.dataSolicitacao)}
                          </p>
                          {saque.dataAprovacao && (
                            <p className="text-xs text-gray-400">Aprovação: {formatDate(saque.dataAprovacao)}</p>
                          )}
                          {saque.dataPagamento && (
                            <p className="text-xs text-gray-400">Pagamento: {formatDate(saque.dataPagamento)}</p>
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
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <FiCheckCircle className="mr-1" />
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleRecusar(saque.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                          >
                            <FiXCircle className="mr-1" />
                            Recusar
                          </button>
                        </>
                      )}
                      {saque.status === 'aprovado' && (
                        <button
                          onClick={() => handlePagar(saque.id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
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
