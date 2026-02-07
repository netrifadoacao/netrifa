'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiShoppingBag, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  tipo: string;
  ativo: boolean;
}

export default function CriarPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    tipo: 'digital',
  });

  useEffect(() => {
    if (!user || profile?.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchProdutos();
  }, [user, profile, router]);

  const fetchProdutos = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('products').select('id, name, description, price, active');
      if (error) throw error;
      setProdutos((data ?? []).map((p) => ({ id: p.id, nome: p.name, descricao: p.description ?? '', preco: p.price, tipo: 'digital', ativo: p.active })));
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('products').insert({
        name: formData.nome,
        description: formData.descricao,
        price: parseFloat(formData.preco),
        active: true,
      });
      if (error) throw error;
      alert('Produto criado com sucesso!');
      setFormData({ nome: '', descricao: '', preco: '', tipo: 'digital' });
      fetchProdutos();
    } catch (error) {
      alert('Erro ao criar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAtivo = async (produtoId: string, ativo: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('products').update({ active: !ativo }).eq('id', produtoId);
      if (error) throw error;
      fetchProdutos();
    } catch (error) {
      alert('Erro ao atualizar produto');
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Criar Produto</h1>
          <p className="mt-2 text-sm text-gray-400">
            Crie novos produtos para venda no sistema
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">Novo Produto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-300">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  rows={3}
                  required
                  className="mt-1 block w-full bg-black/20 border border-white/20 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preco" className="block text-sm font-medium text-gray-300">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    id="preco"
                    step="0.01"
                    min="0"
                    required
                    className="mt-1 block w-full bg-black/20 border border-white/20 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-300">
                    Tipo
                  </label>
                  <select
                    id="tipo"
                    className="mt-1 block w-full bg-black/20 border border-white/20 rounded-lg shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent sm:text-sm transition-all"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  >
                    <option value="digital" className="bg-rich-black text-white">Digital</option>
                    <option value="fisico" className="bg-rich-black text-white">Físico</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.3)] text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all"
              >
                {loading ? 'Criando...' : 'Criar Produto'}
              </button>
            </form>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">Produtos Cadastrados</h2>
            <div className="space-y-4">
              {produtos.map((produto) => (
                <div key={produto.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <FiShoppingBag className="h-5 w-5 text-primary-400" />
                        <h3 className="ml-2 text-sm font-medium text-white">{produto.nome}</h3>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full border ${
                          produto.ativo 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {produto.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-400">{produto.descricao}</p>
                      <p className="mt-1 text-sm font-semibold text-primary-400">
                        R$ {produto.preco.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleAtivo(produto.id, produto.ativo)}
                      className={`ml-4 p-2 rounded-md ${
                        produto.ativo
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={produto.ativo ? 'Desativar' : 'Ativar'}
                    >
                      {produto.ativo ? <FiXCircle /> : <FiCheckCircle />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
