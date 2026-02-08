'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';
import { FiDollarSign } from 'react-icons/fi';
import { useFunctions } from '@/lib/supabase-functions';

export default function SaquePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const functions = useFunctions();
  const router = useRouter();
  const pathname = usePathname();
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
    if (pathname !== '/escritorio/saque') return;
    if (authLoading) return;
    if (!user || profile?.role === 'admin') {
      router.push('/login');
      return;
    }
    setSaldo(Number(profile?.wallet_balance ?? 0));
    fetchConfig();
  }, [pathname, authLoading, user, profile, router]);

  const fetchConfig = async () => {
    try {
      const data = await functions.bonusConfig.get();
      setValorMinimo(data.valorMinimoSaque ?? 50);
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const valor = parseFloat(formData.valor);
    if (valor < valorMinimo) {
      toast(`Valor mínimo de saque é R$ ${valorMinimo.toFixed(2)}`, { icon: '⚠️' });
      return;
    }
    if (valor > saldo) {
      toast('Saldo insuficiente', { icon: '⚠️' });
      return;
    }
    setLoading(true);
    try {
      await functions.withdrawals.create({
        valor,
        metodoPagamento: formData.metodoPagamento,
        dadosPagamento: formData.metodoPagamento === 'pix' ? { chave: formData.pix } : {},
      });
      toast.success('Saque solicitado com sucesso! Aguarde a aprovação.');
      setFormData({ valor: '', metodoPagamento: 'pix', pix: '', banco: '', agencia: '', conta: '' });
      window.location.reload();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erro ao solicitar saque');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Solicitar Saque</h1>
          <p className="mt-2 text-sm text-gray-400">
            Solicite a retirada dos seus ganhos
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-xl p-6 mb-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-steel-800">
              <FiDollarSign className="h-8 w-8 text-steel-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-400">Saldo Disponível</p>
              <p className="text-3xl font-bold text-steel-300">R$ {saldo.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Valor mínimo: R$ {valorMinimo.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-xl">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="valor" className="block text-sm font-medium text-gray-300">
                Valor do Saque
              </label>
              <input
                type="number"
                id="valor"
                step="0.01"
                min={valorMinimo}
                max={saldo}
                required
                className="mt-1 block w-full border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-steel-500 focus:border-steel-500 sm:text-sm transition-colors"
                placeholder={`Mínimo: R$ ${valorMinimo.toFixed(2)}`}
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="metodoPagamento" className="block text-sm font-medium text-gray-300">
                Método de Pagamento
              </label>
              <select
                id="metodoPagamento"
                required
                className="mt-1 block w-full border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-steel-500 focus:border-steel-500 sm:text-sm transition-colors [&>option]:text-gray-900"
                value={formData.metodoPagamento}
                onChange={(e) => setFormData({ ...formData, metodoPagamento: e.target.value })}
              >
                <option value="pix">PIX</option>
                <option value="banco">Transferência Bancária</option>
              </select>
            </div>

            {formData.metodoPagamento === 'pix' ? (
              <div>
                <label htmlFor="pix" className="block text-sm font-medium text-gray-300">
                  Chave PIX
                </label>
                <input
                  type="text"
                  id="pix"
                  required
                  className="mt-1 block w-full border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-steel-500 focus:border-steel-500 sm:text-sm transition-colors"
                  placeholder="CPF, Email, Telefone ou Chave Aleatória"
                  value={formData.pix}
                  onChange={(e) => setFormData({ ...formData, pix: e.target.value })}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="banco" className="block text-sm font-medium text-gray-300">
                    Banco
                  </label>
                  <input
                    type="text"
                    id="banco"
                    required
                    className="mt-1 block w-full border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-steel-500 focus:border-steel-500 sm:text-sm transition-colors"
                    value={formData.banco}
                    onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="agencia" className="block text-sm font-medium text-gray-300">
                    Agência
                  </label>
                  <input
                    type="text"
                    id="agencia"
                    required
                    className="mt-1 block w-full border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-steel-500 focus:border-steel-500 sm:text-sm transition-colors"
                    value={formData.agencia}
                    onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="conta" className="block text-sm font-medium text-gray-300">
                    Conta
                  </label>
                  <input
                    type="text"
                    id="conta"
                    required
                    className="mt-1 block w-full border border-white/10 bg-black/20 rounded-lg shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-steel-500 focus:border-steel-500 sm:text-sm transition-colors"
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
                className="px-4 py-2 border border-white/20 shadow-sm text-sm font-medium rounded-lg text-gray-300 bg-transparent hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || saldo < valorMinimo}
                className="px-6 py-2 text-sm font-medium rounded-lg btn-gold-metallic focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-400 disabled:opacity-50 transition-all"
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
