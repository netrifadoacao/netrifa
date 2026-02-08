'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { FiFileText, FiTrendingUp } from 'react-icons/fi';
import { useFunctions } from '@/lib/supabase-functions';

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
  const { user, profile, loading: authLoading } = useAuth();
  const functions = useFunctions();
  const router = useRouter();
  const pathname = usePathname();
  const [bonus, setBonus] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalGanhos, setTotalGanhos] = useState(0);

  useEffect(() => {
    if (pathname !== '/escritorio/extratos') return;
    if (authLoading) return;
    if (!user || profile?.role === 'admin') {
      router.push('/login');
      return;
    }
    setLoading(true);
    fetchBonus();
  }, [pathname, authLoading, user, profile, router]);

  const fetchBonus = async () => {
    if (!user) return;
    try {
      const data = await functions.bonus(user.id);
      setBonus(Array.isArray(data) ? data : []);
      const total = (Array.isArray(data) ? data : []).reduce((acc: number, b: Bonus) => acc + (b.valor ?? 0), 0);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-steel-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Extratos</h1>
          <p className="mt-2 text-sm text-gray-400">
            Histórico completo dos seus ganhos
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-xl p-6 mb-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-steel-800">
              <FiTrendingUp className="h-8 w-8 text-steel-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Total de Ganhos</p>
              <p className="text-3xl font-bold text-steel-300">R$ {totalGanhos.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden sm:rounded-xl">
          <ul className="divide-y divide-white/10">
            {bonus.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-400">
                Nenhum bônus registrado ainda.
              </li>
            ) : (
              bonus.map((item) => (
                <li key={item.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-steel-800 mr-4">
                        <FiFileText className="h-5 w-5 text-steel-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Bônus {item.tipo === 'direto' ? 'Direto' : `Rede - Nível ${item.nivel}`}
                        </p>
                        <p className="text-sm text-gray-400">
                          {item.origemUsuario?.nome && `Origem: ${item.origemUsuario.nome}`}
                          {item.origemCompra && ` | Compra: R$ ${item.origemCompra.valor.toFixed(2)}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(item.data)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-steel-400">
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
