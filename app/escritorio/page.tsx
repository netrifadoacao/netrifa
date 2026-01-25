'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FiShoppingBag, FiEye } from 'react-icons/fi';

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  tipo: string;
  ativo: boolean;
}

export default function EscritorioHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (!user || user.tipo === 'admin') {
      router.push('/login');
      return;
    }
    fetchProdutos();
  }, [user, router]);

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos');
      const data = await response.json();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComprar = async (produto: Produto) => {
    if (!user) return;
    
    setBuying(true);
    try {
      const response = await fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioId: user.id,
          produtoId: produto.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Erro ao processar compra');
        return;
      }

      alert('Compra realizada com sucesso! Pagamento aprovado automaticamente.');
      setSelectedProduct(null);
      // Recarregar dados do usuário
      const userResponse = await fetch(`/api/usuarios/${user.id}`);
      const updatedUser = await userResponse.json();
      window.location.reload();
    } catch (error) {
      alert('Erro ao processar compra');
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white font-display">Produtos Disponíveis</h1>
          <p className="mt-2 text-sm text-gray-400">
            Escolha um produto para comprar e começar a gerar renda
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="bg-white/5 backdrop-blur-md overflow-hidden shadow-lg rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(14,165,233,0.1)] group"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-primary-500/20 group-hover:bg-primary-500/30 transition-colors">
                    <FiShoppingBag className="h-8 w-8 text-primary-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-white">{produto.nome}</h3>
                    <p className="text-2xl font-bold text-primary-400 mt-2">
                      R$ {produto.preco.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-400">{produto.descricao}</p>
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setSelectedProduct(produto)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-white/20 shadow-sm text-sm font-medium rounded-lg text-gray-200 bg-transparent hover:bg-white/5 transition-colors"
                  >
                    <FiEye className="mr-2" />
                    Detalhes
                  </button>
                  <button
                    onClick={() => handleComprar(produto)}
                    disabled={buying}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-500 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {buying ? 'Processando...' : 'Comprar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {produtos.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum produto disponível no momento.</p>
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-6 border border-white/10 shadow-2xl rounded-2xl bg-rich-black/95 backdrop-blur-xl max-w-md w-full">
            <div className="mt-2">
              <h3 className="text-xl font-bold text-white mb-4 font-display">{selectedProduct.nome}</h3>
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">{selectedProduct.descricao}</p>
              <div className="bg-primary-500/10 rounded-lg p-4 mb-6 border border-primary-500/20">
                <p className="text-sm text-primary-300 mb-1">Preço</p>
                <p className="text-3xl font-bold text-primary-400">
                  R$ {selectedProduct.preco.toFixed(2)}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 px-4 py-3 border border-white/20 text-sm font-medium rounded-lg text-gray-300 bg-transparent hover:bg-white/5 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => handleComprar(selectedProduct)}
                  disabled={buying}
                  className="flex-1 px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-500 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] transition-all disabled:opacity-50"
                >
                  {buying ? 'Processando...' : 'Confirmar Compra'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
