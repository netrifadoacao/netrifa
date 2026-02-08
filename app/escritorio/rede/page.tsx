'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiUsers, FiCopy } from 'react-icons/fi';
import { functions } from '@/lib/supabase-functions';

interface RedeItem {
  id: string;
  nome: string;
  email: string;
  nivel: number;
  indicados?: RedeItem[];
}

export default function RedePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rede, setRede] = useState<RedeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkIndicacao, setLinkIndicacao] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || profile?.role === 'admin') {
      router.push('/login');
      return;
    }
    if (profile?.referral_code) setLinkIndicacao(`${window.location.origin}/register?ref=${profile.referral_code}`);
    fetchRede();
  }, [authLoading, user, profile, router]);

  const fetchRede = async () => {
    if (!user) return;
    try {
      const data = await functions.network(user.id);
      setRede(data.rede || []);
    } catch (error) {
      console.error('Erro ao buscar rede:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(linkIndicacao);
    alert('Link copiado para a área de transferência!');
  };

  const renderRede = (items: RedeItem[], nivel: number = 1) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="ml-8 mt-4 border-l-2 border-white/10 pl-4">
        {items.map((item) => (
          <div key={item.id} className="mb-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg shadow-lg p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{item.nome}</p>
                  <p className="text-sm text-gray-400">{item.email}</p>
                  <p className="text-xs text-primary-400 mt-1">Nível {item.nivel}</p>
                </div>
                {item.indicados && item.indicados.length > 0 && (
                  <span className="text-sm text-gray-400">
                    {item.indicados.length} indicado(s)
                  </span>
                )}
              </div>
            </div>
            {item.indicados && renderRede(item.indicados, nivel + 1)}
          </div>
        ))}
      </div>
    );
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
          <h1 className="text-3xl font-bold text-white font-display">Minha Rede</h1>
          <p className="mt-2 text-sm text-gray-400">
            Visualize sua estrutura de indicações até o 5º nível
          </p>
        </div>

        <div className="mb-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4">Meu Link de Indicação</h2>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={linkIndicacao}
              className="flex-1 block border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
            />
            <button
              onClick={copyLink}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-[0_0_15px_rgba(14,165,233,0.3)] text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-500 hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] transition-all"
            >
              <FiCopy className="mr-2" />
              Copiar
            </button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center">
            <FiUsers className="mr-2 text-primary-400" />
            Estrutura da Rede
          </h2>
          {rede.length === 0 ? (
            <p className="text-gray-400">Você ainda não tem indicados na sua rede.</p>
          ) : (
            <div>{renderRede(rede)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
