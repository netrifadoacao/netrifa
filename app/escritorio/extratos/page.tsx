'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiFileText, FiTrendingUp } from 'react-icons/fi';

interface Bonus {
  id: string;
  tipo: string;
  nivel?: number;
  valor: number;
  data: string;
  origemUsuario?: { nome: string };
  origemCompra?: { valor: number };
}

export default function ExtratosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bonus, setBonus] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalGanhos, setTotalGanhos] = useState(0);

  useEffect(() => {
    if (!user || user.tipo === 'admin') {
      router.push('/login');
      return;
    }
    fetchBonus();
  }, [user, router]);

  const fetchBonus = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/bonus/${user.id}`);
      const data = await response.json();
      setBonus(data);
      const total = data.reduce((acc: number, b: Bonus) => acc + b.valor, 0);
      setTotalGanhos(total);
    } catch (error) {
      console.error('Erro ao buscar bônus:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Extratos</h1>
          <p className="mt-2 text-sm text-gray-600">
            Histórico completo dos seus ganhos
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <FiTrendingUp className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total de Ganhos</p>
              <p className="text-3xl font-bold text-primary-600">R$ {totalGanhos.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {bonus.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">
                Nenhum bônus registrado ainda.
              </li>
            ) : (
              bonus.map((item) => (
                <li key={item.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiFileText className="h-5 w-5 text-primary-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          Bônus {item.tipo === 'direto' ? 'Direto' : `Rede - Nível ${item.nivel}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.origemUsuario?.nome && `Origem: ${item.origemUsuario.nome}`}
                          {item.origemCompra && ` | Compra: R$ ${item.origemCompra.valor.toFixed(2)}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(item.data)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">
                        + R$ {item.valor.toFixed(2)}
                      </p>
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
