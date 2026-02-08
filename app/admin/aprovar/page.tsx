'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useFunctions } from '@/lib/supabase-functions';

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
  const { user, profile, loading: authLoading } = useAuth();
  const functions = useFunctions();
  const router = useRouter();
  const pathname = usePathname();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pathname !== '/admin/aprovar') return;
    if (authLoading) return;
    if (!user || profile?.role !== 'admin') {
      router.push('/login');
      return;
    }
    setLoading(true);
    fetchCompras();
  }, [pathname, authLoading, user, profile, router]);

  const fetchCompras = async () => {
    try {
      const data = await functions.orders.list('pendente');
      setCompras(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar compras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (compraId: string) => {
    try {
      await functions.orders.approve(compraId);
      alert('Compra aprovada com sucesso!');
      fetchCompras();
    } catch (error) {
      alert('Erro ao aprovar compra');
    }
  };

  const handleReprovar = async (compraId: string) => {
    if (!confirm('Tem certeza que deseja reprovar esta compra?')) return;
    try {
      await functions.orders.reject(compraId);
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
          <h1 className="text-3xl font-bold text-white font-display">Aprovar Compras</h1>
          <p className="mt-2 text-sm text-gray-400">
            Gerencie compras pendentes de aprovação
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden sm:rounded-xl">
          <ul className="divide-y divide-white/10">
            {compras.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-400">
                Nenhuma compra pendente no momento.
              </li>
            ) : (
              compras.map((compra) => (
                <li key={compra.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {compra.produto?.nome || 'Produto não encontrado'}
                          </p>
                          <p className="text-sm text-gray-400">
                            Comprador: {compra.usuario?.nome} ({compra.usuario?.email})
                          </p>
                          <p className="text-sm text-gray-400">
                            Valor: <span className="text-primary-400 font-bold">R$ {compra.valor.toFixed(2)}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Data: {formatDate(compra.dataCompra)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => handleAprovar(compra.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all"
                      >
                        <FiCheckCircle className="mr-2" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReprovar(compra.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-red-600 hover:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all"
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
