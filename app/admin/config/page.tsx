'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { FiSettings, FiSave } from 'react-icons/fi';
import { useFunctions } from '@/lib/supabase-functions';

interface ConfigBonus {
  indicacaoDireta: number;
  nivel1: number;
  nivel2: number;
  nivel3: number;
  nivel4: number;
  nivel5: number;
  valorMinimoSaque: number;
}

export default function ConfigPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const functions = useFunctions();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ConfigBonus>({
    indicacaoDireta: 10,
    nivel1: 5,
    nivel2: 3,
    nivel3: 2,
    nivel4: 1,
    nivel5: 0.5,
    valorMinimoSaque: 50,
  });

  useEffect(() => {
    if (pathname !== '/admin/config') return;
    if (authLoading) return;
    if (!user || profile?.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchConfig();
  }, [pathname, authLoading, user, profile, router]);

  const fetchConfig = async () => {
    try {
      const data = await functions.bonusConfig.get();
      setFormData((prev) => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await functions.bonusConfig.update(formData as unknown as Record<string, number>);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Configuração de Bônus</h1>
          <p className="mt-2 text-sm text-gray-400">
            Configure os percentuais de bônus para cada nível da rede
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-medium text-white mb-4">Percentuais de Bônus (%)</h2>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="indicacaoDireta" className="block text-sm font-medium text-gray-300">
                    Indicação Direta (1º nível)
                  </label>
                  <input
                    type="number"
                    id="indicacaoDireta"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                    value={formData.indicacaoDireta}
                    onChange={(e) => setFormData({ ...formData, indicacaoDireta: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label htmlFor="nivel1" className="block text-sm font-medium text-gray-300">
                    1º Nível (2º nível da rede)
                  </label>
                  <input
                    type="number"
                    id="nivel1"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                    value={formData.nivel1}
                    onChange={(e) => setFormData({ ...formData, nivel1: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label htmlFor="nivel2" className="block text-sm font-medium text-gray-300">
                    2º Nível (3º nível da rede)
                  </label>
                  <input
                    type="number"
                    id="nivel2"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                    value={formData.nivel2}
                    onChange={(e) => setFormData({ ...formData, nivel2: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label htmlFor="nivel3" className="block text-sm font-medium text-gray-300">
                    3º Nível (4º nível da rede)
                  </label>
                  <input
                    type="number"
                    id="nivel3"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                    value={formData.nivel3}
                    onChange={(e) => setFormData({ ...formData, nivel3: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label htmlFor="nivel4" className="block text-sm font-medium text-gray-300">
                    4º Nível (5º nível da rede)
                  </label>
                  <input
                    type="number"
                    id="nivel4"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                    value={formData.nivel4}
                    onChange={(e) => setFormData({ ...formData, nivel4: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label htmlFor="nivel5" className="block text-sm font-medium text-gray-300">
                    5º Nível
                  </label>
                  <input
                    type="number"
                    id="nivel5"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                    value={formData.nivel5}
                    onChange={(e) => setFormData({ ...formData, nivel5: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div>
                <label htmlFor="valorMinimoSaque" className="block text-sm font-medium text-gray-300">
                  Valor Mínimo de Saque (R$)
                </label>
                <input
                  type="number"
                  id="valorMinimoSaque"
                  step="0.01"
                  min="0"
                  required
                  className="mt-1 block w-full border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                  value={formData.valorMinimoSaque}
                  onChange={(e) => setFormData({ ...formData, valorMinimoSaque: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-[0_0_15px_rgba(14,165,233,0.3)] text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-500 hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-300"
              >
                <FiSave className="mr-2" />
                {loading ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
