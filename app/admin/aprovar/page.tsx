'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface Compra {
  id: string;
  usuarioId: string;
  produtoId: string;
  valor: number;
  status: string;
  dataCompra: string;
  produto?: { nome: string; preco: number };
  usuario?: { nome: string; email: string };
}

export default function AprovarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.tipo !== 'admin') {
      router.push('/login');
      return;
    }
    fetchCompras();
  }, [user, router]);

  const fetchCompras = async () => {
    try {
      const response = await fetch('/api/compras?status=pendente');
      const data = await response.json();
      setCompras(data);
    } catch (error) {
      console.error('Erro ao buscar compras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (compraId: string) => {
    try {
      const response = await fetch(`/api/compras/${compraId}/aprovar`, {
        method: 'PUT',
      });

      if (!response.ok) {
        alert('Erro ao aprovar compra');
        return;
      }

      alert('Compra aprovada com sucesso!');
      fetchCompras();
    } catch (error) {
      alert('Erro ao aprovar compra');
    }
  };

  const handleReprovar = async (compraId: string) => {
    if (!confirm('Tem certeza que deseja reprovar esta compra?')) return;

    try {
      const response = await fetch(`/api/compras/${compraId}/reprovar`, {
        method: 'PUT',
      });

      if (!response.ok) {
        alert('Erro ao reprovar compra');
        return;
      }

      alert('Compra reprovada');
      fetchCompras();
    } catch (error) {
      alert('Erro ao reprovar compra');
    }
  };

  const formatDate = (dateString: string) => {
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
          <h1 className="text-3xl font-bold text-gray-900">Aprovar Compras</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gerencie compras pendentes de aprovação
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {compras.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">
                Nenhuma compra pendente no momento.
              </li>
            ) : (
              compras.map((compra) => (
                <li key={compra.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {compra.produto?.nome || 'Produto não encontrado'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Comprador: {compra.usuario?.nome} ({compra.usuario?.email})
                          </p>
                          <p className="text-sm text-gray-500">
                            Valor: R$ {compra.valor.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Data: {formatDate(compra.dataCompra)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => handleAprovar(compra.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <FiCheckCircle className="mr-2" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReprovar(compra.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        <FiXCircle className="mr-2" />
                        Reprovar
                      </button>
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
