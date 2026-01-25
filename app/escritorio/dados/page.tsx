'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function DadosPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    banco: '',
    agencia: '',
    conta: '',
    pix: '',
  });

  useEffect(() => {
    if (!user || user.tipo === 'admin') {
      router.push('/login');
      return;
    }
    setFormData({
      nome: user.nome || '',
      email: user.email || '',
      telefone: user.telefone || '',
      banco: user.dadosBancarios?.banco || '',
      agencia: user.dadosBancarios?.agencia || '',
      conta: user.dadosBancarios?.conta || '',
      pix: user.dadosBancarios?.pix || '',
    });
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/usuarios/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          dadosBancarios: {
            banco: formData.banco,
            agencia: formData.agencia,
            conta: formData.conta,
            pix: formData.pix,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar dados');
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);
      alert('Dados atualizados com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar dados');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Meus Dados</h1>
          <p className="mt-2 text-sm text-gray-400">
            Atualize suas informações pessoais e dados bancários
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-xl">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-300">
                  Nome
                </label>
                <input
                  type="text"
                  id="nome"
                  required
                  className="mt-1 block w-full bg-black/20 border border-white/20 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="mt-1 block w-full bg-black/20 border border-white/20 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-300">
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  required
                  className="mt-1 block w-full bg-black/20 border border-white/20 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Dados Bancários / PIX</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="banco" className="block text-sm font-medium text-gray-300">
                    Banco
                  </label>
                  <input
                    type="text"
                    id="banco"
                    className="mt-1 block w-full bg-black/20 border border-white/20 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
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
                    className="mt-1 block w-full bg-black/20 border border-white/20 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
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
                    className="mt-1 block w-full bg-black/20 border border-white/20 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                    value={formData.conta}
                    onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="pix" className="block text-sm font-medium text-gray-300">
                    Chave PIX
                  </label>
                  <input
                    type="text"
                    id="pix"
                    className="mt-1 block w-full bg-black/20 border border-white/20 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                    value={formData.pix}
                    onChange={(e) => setFormData({ ...formData, pix: e.target.value })}
                  />
                </div>
              </div>
            </div>

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
                disabled={loading}
                className="px-4 py-2 border border-transparent shadow-[0_0_15px_rgba(14,165,233,0.3)] text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-500 hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
