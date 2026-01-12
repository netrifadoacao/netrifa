'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiDollarSign } from 'react-icons/fi';

export default function SaquePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [saldo, setSaldo] = useState(0);
  const [valorMinimo, setValorMinimo] = useState(50);
  const [formData, setFormData] = useState({
    valor: '',
    metodoPagamento: 'pix',
    pix: '',
    banco: '',
    agencia: '',
    conta: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.tipo === 'admin') {
      router.push('/login');
      return;
    }
    setSaldo(user.saldo || 0);
    fetchConfig();
  }, [user, router]);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config/bonus');
      const data = await response.json();
      setValorMinimo(data.valorMinimoSaque || 50);
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const valor = parseFloat(formData.valor);
    
    if (valor < valorMinimo) {
      alert(`Valor mínimo de saque é R$ ${valorMinimo.toFixed(2)}`);
      return;
    }

    if (valor > saldo) {
      alert('Saldo insuficiente');
      return;
    }

    setLoading(true);
    try {
      const dadosPagamento = formData.metodoPagamento === 'pix'
        ? { pix: formData.pix }
        : {
            banco: formData.banco,
            agencia: formData.agencia,
            conta: formData.conta,
          };

      const response = await fetch('/api/saques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: user.id,
          valor,
          metodoPagamento: formData.metodoPagamento,
          dadosPagamento,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Erro ao solicitar saque');
        return;
      }

      alert('Saque solicitado com sucesso! Aguarde a aprovação.');
      setFormData({
        valor: '',
        metodoPagamento: 'pix',
        pix: user.dadosBancarios?.pix || '',
        banco: '',
        agencia: '',
        conta: '',
      });
      window.location.reload();
    } catch (error) {
      alert('Erro ao solicitar saque');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Solicitar Saque</h1>
          <p className="mt-2 text-sm text-gray-600">
            Solicite a retirada dos seus ganhos
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <FiDollarSign className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Saldo Disponível</p>
              <p className="text-3xl font-bold text-primary-600">R$ {saldo.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Valor mínimo: R$ {valorMinimo.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
                Valor do Saque
              </label>
              <input
                type="number"
                id="valor"
                step="0.01"
                min={valorMinimo}
                max={saldo}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder={`Mínimo: R$ ${valorMinimo.toFixed(2)}`}
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="metodoPagamento" className="block text-sm font-medium text-gray-700">
                Método de Pagamento
              </label>
              <select
                id="metodoPagamento"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.metodoPagamento}
                onChange={(e) => setFormData({ ...formData, metodoPagamento: e.target.value })}
              >
                <option value="pix">PIX</option>
                <option value="banco">Transferência Bancária</option>
              </select>
            </div>

            {formData.metodoPagamento === 'pix' ? (
              <div>
                <label htmlFor="pix" className="block text-sm font-medium text-gray-700">
                  Chave PIX
                </label>
                <input
                  type="text"
                  id="pix"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="CPF, Email, Telefone ou Chave Aleatória"
                  value={formData.pix}
                  onChange={(e) => setFormData({ ...formData, pix: e.target.value })}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="banco" className="block text-sm font-medium text-gray-700">
                    Banco
                  </label>
                  <input
                    type="text"
                    id="banco"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={formData.banco}
                    onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="agencia" className="block text-sm font-medium text-gray-700">
                    Agência
                  </label>
                  <input
                    type="text"
                    id="agencia"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={formData.agencia}
                    onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="conta" className="block text-sm font-medium text-gray-700">
                    Conta
                  </label>
                  <input
                    type="text"
                    id="conta"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={formData.conta}
                    onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || saldo < valorMinimo}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Solicitar Saque'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
