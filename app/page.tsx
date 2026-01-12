'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { FiShoppingBag, FiArrowRight, FiStar, FiUsers, FiTrendingUp, FiZap, FiCheckCircle, FiMenu, FiX } from 'react-icons/fi';

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  tipo: string;
  ativo: boolean;
}

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos');
      const data = await response.json();
      setProdutos(data.slice(0, 6)); // Limitar a 6 produtos na landing
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComprar = async (produto: Produto) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
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

      alert('Compra realizada com sucesso! 🎉');
      setSelectedProduct(null);
      if (user.tipo !== 'admin') {
        window.location.href = '/escritorio';
      }
    } catch (error) {
      alert('Erro ao processar compra');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <span className="font-display text-3xl font-black bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent animate-pulse">
                  together
                </span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full animate-ping"></div>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#produtos" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Produtos
              </Link>
              <Link href="#como-funciona" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Como Funciona
              </Link>
              <Link href="#beneficios" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Benefícios
              </Link>
              {user ? (
                <Link
                  href={user.tipo === 'admin' ? '/admin' : '/escritorio'}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Meu Escritório</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Começar Agora
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-4 border-t border-gray-200">
              <Link href="#produtos" className="block text-gray-700 hover:text-primary-600 font-medium">
                Produtos
              </Link>
              <Link href="#como-funciona" className="block text-gray-700 hover:text-primary-600 font-medium">
                Como Funciona
              </Link>
              <Link href="#beneficios" className="block text-gray-700 hover:text-primary-600 font-medium">
                Benefícios
              </Link>
              {user ? (
                <Link
                  href={user.tipo === 'admin' ? '/admin' : '/escritorio'}
                  className="block px-6 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-full text-center"
                >
                  Meu Escritório
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    className="block px-6 py-2.5 text-center text-gray-700 hover:bg-gray-100 font-medium rounded-full"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    className="block px-6 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-full text-center"
                  >
                    Começar Agora
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full mb-8 border border-gray-200/50">
              <FiZap className="w-4 h-4 text-accent-600" />
              <span className="text-sm font-semibold text-gray-700">Transforme sua vida hoje</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent leading-tight animate-fade-in">
              Junte-se à revolução
              <br />
              <span className="text-gray-900">digital</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto animate-slide-up">
              Produtos digitais exclusivos que mudam vidas. Venda, ganhe e construa sua renda recorrente com a comunidade <span className="font-semibold text-primary-600">together</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {user ? (
                <Link
                  href={user.tipo === 'admin' ? '/admin' : '/escritorio'}
                  className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold text-lg rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center space-x-3"
                >
                  <span>Acessar Meu Escritório</span>
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold text-lg rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center space-x-3"
                  >
                    <span>Começar Gratuitamente</span>
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-4 bg-white text-gray-700 font-bold text-lg rounded-full border-2 border-gray-200 hover:border-primary-600 hover:text-primary-600 transition-all duration-200"
                  >
                    Já tenho conta
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary-600 mb-2">10K+</div>
                <div className="text-sm text-gray-600">Usuários Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-accent-600 mb-2">50+</div>
                <div className="text-sm text-gray-600">Produtos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary-600 mb-2">R$ 2M+</div>
                <div className="text-sm text-gray-600">Ganhos Gerados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-accent-600 mb-2">4.9★</div>
                <div className="text-sm text-gray-600">Avaliação</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce-slow"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-bounce-slow" style={{ animationDelay: '2s' }}></div>
      </section>

      {/* Products Section */}
      <section id="produtos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Produtos em <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Destaque</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubra produtos digitais cuidadosamente selecionados para transformar sua vida e sua carreira
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : produtos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">Nenhum produto disponível no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200 transform hover:-translate-y-2"
                >
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-bold rounded-full">
                      {produto.tipo === 'digital' ? 'DIGITAL' : 'FÍSICO'}
                    </span>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      <FiShoppingBag className="w-8 h-8 text-primary-600" />
                    </div>
                    
                    <h3 className="font-display text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {produto.nome}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {produto.descricao}
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-sm text-gray-500">Investimento</div>
                        <div className="font-display text-3xl font-black text-primary-600">
                          R$ {produto.preco.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedProduct(produto)}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Ver Detalhes
                      </button>
                      <button
                        onClick={() => handleComprar(produto)}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {produtos.length > 0 && !user && (
            <div className="text-center mt-12">
              <Link
                href="/register"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold text-lg rounded-full hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <span>Ver Todos os Produtos</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Como <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Funciona</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Três passos simples para começar a transformar sua vida
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute -top-4 left-8 w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                1
              </div>
              <div className="mt-6 mb-4">
                <FiUsers className="w-12 h-12 text-primary-600" />
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">Cadastre-se</h3>
              <p className="text-gray-600">
                Crie sua conta gratuitamente e tenha acesso imediato à plataforma. Sem custos ocultos ou surpresas.
              </p>
            </div>

            <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute -top-4 left-8 w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                2
              </div>
              <div className="mt-6 mb-4">
                <FiShoppingBag className="w-12 h-12 text-primary-600" />
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">Escolha Produtos</h3>
              <p className="text-gray-600">
                Explore nossa seleção de produtos digitais premium e escolha os que fazem sentido para você.
              </p>
            </div>

            <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute -top-4 left-8 w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                3
              </div>
              <div className="mt-6 mb-4">
                <FiTrendingUp className="w-12 h-12 text-primary-600" />
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">Ganhe e Venda</h3>
              <p className="text-gray-600">
                Ganhe bônus e comissões ao indicar outros usuários. Quanto mais você compartilha, mais você ganha!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-6">
                Por que escolher <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">together</span>?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Mais do que uma plataforma, somos uma comunidade que acredita no poder da transformação digital.
              </p>

              <div className="space-y-6">
                {[
                  { icon: FiCheckCircle, title: 'Renda Recorrente', desc: 'Ganhos automáticos e transparentes' },
                  { icon: FiStar, title: 'Produtos Premium', desc: 'Conteúdo selecionado e de alta qualidade' },
                  { icon: FiZap, title: 'Suporte 24/7', desc: 'Estamos sempre aqui para ajudar' },
                  { icon: FiTrendingUp, title: 'Crescimento Contínuo', desc: 'Acompanhe seu progresso em tempo real' },
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary-100 to-accent-100 rounded-xl flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-gray-900 mb-1">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {!user && (
                <div className="mt-10">
                  <Link
                    href="/register"
                    className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold text-lg rounded-full hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <span>Começar Agora</span>
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-white rounded-2xl p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center">
                      <FiUsers className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-display text-2xl font-black text-gray-900">Escritório Virtual</div>
                      <div className="text-sm text-gray-500">Sua central de comando</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-700">Saldo Disponível</span>
                      <span className="font-bold text-primary-600">R$ 0,00</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-700">Indicações Diretas</span>
                      <span className="font-bold text-gray-900">0</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-700">Rede Total</span>
                      <span className="font-bold text-gray-900">0 pessoas</span>
                    </div>
                  </div>
                  {user && (
                    <Link
                      href={user.tipo === 'admin' ? '/admin' : '/escritorio'}
                      className="mt-6 block w-full text-center px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      Acessar Agora
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-6">
              Pronto para transformar sua vida?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Junte-se a milhares de pessoas que já estão construindo seu futuro digital
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-primary-600 font-bold text-lg rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-200"
              >
                Criar Conta Gratuita
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-full border-2 border-white/30 hover:bg-white/20 transition-all duration-200"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-display text-2xl font-black text-white mb-4">together</div>
              <p className="text-sm">
                Transformando vidas através da revolução digital.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Produtos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#produtos" className="hover:text-white transition-colors">Todos os Produtos</Link></li>
                <li><Link href="#produtos" className="hover:text-white transition-colors">Categorias</Link></li>
                <li><Link href="#produtos" className="hover:text-white transition-colors">Novidades</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Sobre</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</Link></li>
                <li><Link href="#beneficios" className="hover:text-white transition-colors">Benefícios</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Conta</h3>
              <ul className="space-y-2 text-sm">
                {user ? (
                  <li>
                    <Link href={user.tipo === 'admin' ? '/admin' : '/escritorio'} className="hover:text-white transition-colors">
                      Meu Escritório
                    </Link>
                  </li>
                ) : (
                  <>
                    <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
                    <li><Link href="/register" className="hover:text-white transition-colors">Criar Conta</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Together. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 transform scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-3xl font-black text-gray-900">{selectedProduct.nome}</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6 text-lg">{selectedProduct.descricao}</p>
            <div className="flex items-center justify-between mb-6 p-6 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl">
              <div>
                <div className="text-sm text-gray-600 mb-1">Investimento</div>
                <div className="font-display text-4xl font-black text-primary-600">
                  R$ {selectedProduct.preco.toFixed(2)}
                </div>
              </div>
              <span className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-full text-sm">
                {selectedProduct.tipo.toUpperCase()}
              </span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => handleComprar(selectedProduct)}
                disabled={buying}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {buying ? 'Processando...' : 'Comprar Agora'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
