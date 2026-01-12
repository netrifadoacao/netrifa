'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiSettings, FiSave } from 'react-icons/fi';

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
  const { user } = useAuth();
  const router = useRouter();
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
    if (!user || user.tipo !== 'admin') {
      router.push('/login');
      return;
    }
    fetchConfig();
  }, [user, router]);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config/bonus');
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/config/bonus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        alert('Erro ao salvar configurações');
        return;
      }

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
          <h1 className="text-3xl font-bold text-gray-900">Configuração de Bônus</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure os percentuais de bônus para cada nível da rede
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Percentuais de Bônus (%)</h2>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="indicacaoDireta" className="block text-sm font-medium text-gray-700">
                    Indicação Direta (1º nível)
                  </label>
                  <input
                    type="number"
                    id="indicacaoDireta"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={formData.indicacaoDireta}
                    onChange={(e) => setFormData({ ...formData, indicacaoDireta: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label htmlFor="nivel1" className="block text-sm font-medium text-gray-700">
                    1º Nível (2º nível da rede)
                  </label>
                  <input
                    type="number"
                    id="nivel1"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={formData.nivel1}
                    onChange={(e) => setFormData({ ...formData, nivel1: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label htmlFor="nivel2" className="block text-sm font-medium text-gray-700">
                    2º Nível (3º nível da rede)
                  </label>
                  <input
                    type="number"
                    id="nivel2"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={formData.nivel2}
                    onChange={(e) => setFormData({ ...formData, nivel2: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label htmlFor="nivel3" className="block text-sm font-medium text-gray-700">
                    3º Nível (4º nível da rede)
                  </label>
                  <input
                    type="number"
                    id="nivel3"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={formData.nivel3}
                    onChange={(e) => setFormData({ ...formData, nivel3: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label htmlFor="nivel4" className="block text-sm font-medium text-gray-700">
                    4º Nível (5º nível da rede)
                  </label>
                  <input
                    type="number"
                    id="nivel4"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={formData.nivel4}
                    onChange={(e) => setFormData({ ...formData, nivel4: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <label htmlFor="nivel5" className="block text-sm font-medium text-gray-700">
                    5º Nível
                  </label>
                  <input
                    type="number"
                    id="nivel5"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={formData.nivel5}
                    onChange={(e) => setFormData({ ...formData, nivel5: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div>
                <label htmlFor="valorMinimoSaque" className="block text-sm font-medium text-gray-700">
                  Valor Mínimo de Saque (R$)
                </label>
                <input
                  type="number"
                  id="valorMinimoSaque"
                  step="0.01"
                  min="0"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={formData.valorMinimoSaque}
                  onChange={(e) => setFormData({ ...formData, valorMinimoSaque: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
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
