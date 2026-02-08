'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingBag, FiArrowRight, FiStar, FiUsers, FiTrendingUp, FiZap, FiCheckCircle, FiMenu, FiX } from 'react-icons/fi';
import { useFunctions } from '@/lib/supabase-functions';

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
  const { user, profile, loading: authLoading } = useAuth();
  const functions = useFunctions();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [buying, setBuying] = useState(false);
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    fetchProdutos();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user && profile) {
      if (profile.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/escritorio');
      }
    }
  }, [authLoading, user, profile, router]);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onScroll = () => setMobileMenuOpen(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mobileMenuOpen]);

  const fetchProdutos = async () => {
    try {
      const data = await functions.products.list();
      setProdutos((data ?? []).map((p) => ({ id: p.id, nome: p.name, descricao: p.description ?? '', preco: p.price, tipo: 'digital', ativo: p.active })).slice(0, 6));
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
      const { url } = await functions.createCheckout(produto.id);
      setSelectedProduct(null);
      window.location.href = url;
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao iniciar checkout');
    } finally {
      setBuying(false);
    }
  };

  if (user && !profile && !authLoading) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rich-black text-white selection:bg-amber-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-rich-black/80 backdrop-blur-lg border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative w-12 h-12 overflow-hidden rounded-full border-2 border-primary-500 shadow-[0_0_15px_rgba(0,136,255,0.5)] group-hover:shadow-[0_0_25px_rgba(0,136,255,0.7)] transition-all duration-300">
                <Image 
                  src="/logomarca-as.jpeg" 
                  alt="AS Miranda" 
                  fill 
                  sizes="48px"
                  className="object-cover scale-150"
                />
              </div>
              <span className="font-display text-2xl font-black bg-gradient-to-r from-primary-400 via-white to-secondary-500 bg-clip-text text-transparent group-hover:animate-pulse">
                AS Miranda
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="#produtos" className="px-4 py-2 text-gray-300 hover:text-white font-medium rounded-full hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                Produtos
              </Link>
              <Link href="#como-funciona" className="px-4 py-2 text-gray-300 hover:text-white font-medium rounded-full hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                Como Funciona
              </Link>
              <Link href="#beneficios" className="px-4 py-2 text-gray-300 hover:text-white font-medium rounded-full hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                Benefícios
              </Link>
              {user ? (
                <Link
                  href={isAdmin ? '/admin' : '/escritorio'}
                  className="ml-4 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-full hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:scale-105 transition-all duration-200 flex items-center space-x-2 border border-white/10"
                >
                  <span>Meu Escritório</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center space-x-3 ml-4">
                  <Link
                    href="/login"
                    className="px-6 py-2.5 bg-primary-600 text-white font-medium transition-all rounded-full hover:bg-primary-500 border border-primary-500/50 hover:shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-full hover:shadow-[0_0_20px_rgba(255,41,41,0.4)] hover:scale-105 transition-all duration-200 border border-white/10"
                  >
                    Começar Agora
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-white/5"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      <div className={`md:hidden fixed inset-0 z-40 ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden
          onClick={closeMobileMenu}
        />
        <aside
          className={`fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-rich-black border-l border-white/10 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          aria-modal
          aria-label="Menu"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <span className="font-display text-lg font-bold text-white">Menu</span>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            <Link href="#produtos" onClick={closeMobileMenu} className="block py-3 px-4 text-gray-300 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-colors">
              Produtos
            </Link>
            <Link href="#como-funciona" onClick={closeMobileMenu} className="block py-3 px-4 text-gray-300 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-colors">
              Como Funciona
            </Link>
            <Link href="#beneficios" onClick={closeMobileMenu} className="block py-3 px-4 text-gray-300 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-colors">
              Benefícios
            </Link>
            {user ? (
              <Link
                href={isAdmin ? '/admin' : '/escritorio'}
                onClick={closeMobileMenu}
                className="block mt-4 py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl text-center hover:opacity-90 transition-opacity"
              >
                Meu Escritório
              </Link>
            ) : (
              <div className="mt-4 space-y-2">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 text-center bg-primary-600 text-white font-medium rounded-xl border border-primary-500/50 hover:bg-primary-500 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl text-center hover:opacity-90 transition-opacity"
                >
                  Começar Agora
                </Link>
              </div>
            )}
          </nav>
        </aside>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full mb-8 border border-amber-500/30 hover:border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.1)] transition-all duration-300">
              <FiZap className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-gray-200">O Segredo dos Top Afiliados</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              Sua jornada rumo à
              <br />
              <span className="bg-gradient-to-r from-primary-400 via-white to-secondary-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(14,165,233,0.3)]">Independência Financeira</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto animate-slide-up">
              Descubra produtos validados que vendem no piloto automático. Afilie-se, escale suas vendas e construa um negócio digital sólido com a <span className="font-semibold text-white">AS Miranda</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              {user ? (
                <Link
                  href={isAdmin ? '/admin' : '/escritorio'}
                  className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold text-lg rounded-full hover:shadow-[0_0_30px_rgba(255,41,41,0.4)] hover:scale-105 transition-all duration-200 flex items-center space-x-3 border border-white/20"
                >
                  <span>Acessar Meu Escritório</span>
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="group px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold text-lg rounded-full hover:shadow-[0_0_30px_rgba(255,41,41,0.4)] hover:scale-105 transition-all duration-200 flex items-center space-x-3 border border-white/20"
                  >
                    <span>Começar Agora</span>
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-4 bg-primary-600 text-white font-bold text-lg rounded-full border border-primary-500/50 hover:bg-primary-500 hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all duration-200"
                  >
                    Já tenho conta
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-white/5 pt-12">
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:text-primary-400 transition-colors duration-300">10K+</div>
                <div className="text-sm text-gray-500 group-hover:text-primary-400/70">Afiliados Ativos</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors duration-300">50+</div>
                <div className="text-sm text-gray-500 group-hover:text-amber-400/70">Produtos Validados</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:text-secondary-400 transition-colors duration-300">R$ 2M+</div>
                <div className="text-sm text-gray-500 group-hover:text-secondary-400/70">Em Comissões</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl md:text-4xl font-black text-white mb-2 group-hover:text-white transition-colors duration-300">4.9★</div>
                <div className="text-sm text-gray-500">Conversão</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] opacity-40 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-secondary-600/20 rounded-full blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Products Section */}
      <section id="produtos" className="py-20 bg-rich-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-rich-black via-primary-900/5 to-rich-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
              Produtos de <span className="bg-gradient-to-r from-primary-300 via-primary-100 to-primary-400 bg-clip-text text-transparent">Alta Conversão</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Produtos validados e prontos para vender. Escolha os campeões de vendas e comece a lucrar agora mesmo.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
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
                  className="group relative bg-white/5 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 overflow-hidden border border-white/10 hover:border-primary-500/50 transform hover:-translate-y-2 backdrop-blur-sm"
                >
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 bg-gradient-to-r from-primary-500 to-primary-700 text-white text-xs font-bold rounded-full border border-primary-400/20">
                      {produto.tipo === 'digital' ? 'DIGITAL' : 'FÍSICO'}
                    </span>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500/20 to-primary-900/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 border border-primary-500/20">
                      <FiShoppingBag className="w-8 h-8 text-primary-400" />
                    </div>
                    
                    <h3 className="font-display text-2xl font-bold text-white mb-3 group-hover:text-primary-400 transition-colors">
                      {produto.nome}
                    </h3>
                    
                    <p className="text-gray-400 mb-6 line-clamp-3">
                      {produto.descricao}
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-sm text-gray-500">Investimento</div>
                        <div className="font-display text-3xl font-black text-primary-400">
                          R$ {produto.preco.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedProduct(produto)}
                        className="flex-1 px-4 py-3 bg-white/5 text-gray-300 font-semibold rounded-xl hover:bg-white/10 hover:text-white transition-colors border border-white/10"
                      >
                        Ver Detalhes
                      </button>
                      <button
                        onClick={() => handleComprar(produto)}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/20 hover:scale-105 transition-all duration-200 border border-primary-500/20"
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
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-400 to-primary-600 text-rich-black font-bold text-lg rounded-full hover:shadow-xl hover:shadow-primary-400/20 hover:scale-105 transition-all duration-200"
              >
                <span>Ver Todos os Produtos</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 bg-rich-gray relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-rich-black to-rich-black"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
              Como <span className="bg-gradient-to-r from-primary-300 via-primary-100 to-primary-400 bg-clip-text text-transparent">Funciona</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              O caminho comprovado para escalar suas vendas online
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-primary-500/30 transition-all duration-300 group">
              <div className="absolute -top-4 left-8 w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-rich-black font-black text-xl shadow-lg shadow-primary-500/20">
                1
              </div>
              <div className="mt-6 mb-4">
                <FiUsers className="w-12 h-12 text-primary-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-3">Cadastre-se</h3>
              <p className="text-gray-400">
                Crie sua conta gratuitamente e acesse os produtos mais cobiçados do mercado digital.
              </p>
            </div>

            <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-primary-500/30 transition-all duration-300 group">
              <div className="absolute -top-4 left-8 w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-rich-black font-black text-xl shadow-lg shadow-primary-500/20">
                2
              </div>
              <div className="mt-6 mb-4">
                <FiShoppingBag className="w-12 h-12 text-primary-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-3">Escolha seu Produto</h3>
              <p className="text-gray-400">
                Selecione produtos validados com funis de alta conversão. Material de apoio pronto para você rodar tráfego.
              </p>
            </div>

            <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-primary-500/30 transition-all duration-300 group">
              <div className="absolute -top-4 left-8 w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-rich-black font-black text-xl shadow-lg shadow-primary-500/20">
                3
              </div>
              <div className="mt-6 mb-4">
                <FiTrendingUp className="w-12 h-12 text-primary-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-3">Venda e Escale</h3>
              <p className="text-gray-400">
                Receba comissões gordas, otimize suas campanhas e escale seu negócio digital para o próximo nível.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 bg-rich-black relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-900/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-6">
                Por que escolher a <span className="bg-gradient-to-r from-primary-300 via-primary-100 to-primary-400 bg-clip-text text-transparent">AS Doação</span>?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Mais do que uma plataforma, somos o veículo para a sua prosperidade financeira e realização pessoal.
              </p>

              <div className="space-y-6">
                {[
                  { icon: FiCheckCircle, title: 'Renda Exponencial', desc: 'Sistema desenhado para alavancar seus ganhos' },
                  { icon: FiStar, title: 'Produtos de Elite', desc: 'Conteúdo que gera valor real e imediato' },
                  { icon: FiZap, title: 'Suporte Premium', desc: 'Atendimento exclusivo para membros' },
                  { icon: FiTrendingUp, title: 'Gestão de Riqueza', desc: 'Ferramentas completas para controlar seu império' },
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                      <benefit.icon className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-white mb-1">{benefit.title}</h3>
                      <p className="text-gray-400">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {!user && (
                <div className="mt-10">
                  <Link
                    href="/register"
                    className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-400 to-primary-600 text-rich-black font-bold text-lg rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-all duration-200"
                  >
                    <span>Começar Minha Jornada</span>
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary-500/20 to-primary-900/20 rounded-3xl p-8 shadow-2xl backdrop-blur-md border border-white/10 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-rich-gray/90 rounded-2xl p-8 border border-white/5">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                      <FiUsers className="w-8 h-8 text-rich-black" />
                    </div>
                    <div>
                      <div className="font-display text-2xl font-black text-white">Escritório Virtual</div>
                      <div className="text-sm text-primary-400">Sua central de comando</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-gray-400">Saldo Disponível</span>
                      <span className="font-bold text-primary-400">R$ 15.450,00</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-gray-400">Indicações Diretas</span>
                      <span className="font-bold text-white">12</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-gray-400">Rede Total</span>
                      <span className="font-bold text-white">1.240 pessoas</span>
                    </div>
                  </div>
                  {user && (
                    <Link
                      href={isAdmin ? '/admin' : '/escritorio'}
                      className="mt-6 block w-full text-center px-6 py-3 bg-gradient-to-r from-primary-400 to-primary-600 text-rich-black font-semibold rounded-xl hover:shadow-lg transition-all"
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
        <section className="py-20 bg-gradient-to-r from-primary-900 via-rich-black to-primary-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-6">
              Pronto para alcançar sua <span className="text-primary-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">Independência Financeira</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Junte-se aos top afiliados que já descobriram o segredo para vender todos os dias na internet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-800 text-white font-bold text-lg rounded-full hover:shadow-[0_0_20px_rgba(255,0,0,0.4)] hover:scale-105 transition-all duration-200"
              >
                Criar Conta Gratuita
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-primary-600 text-white font-bold text-lg rounded-full border border-primary-500/50 hover:bg-primary-500 hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all duration-200"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-rich-black text-gray-400 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-display text-2xl font-black text-white mb-4 flex items-center gap-2">
                <span className="bg-gradient-to-r from-primary-500 via-white to-secondary-500 bg-clip-text text-transparent">AS Miranda</span>
              </div>
              <p className="text-sm text-gray-500">
                A plataforma definitiva para quem quer viver de internet.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Produtos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#produtos" className="hover:text-primary-400 transition-colors">Todos os Produtos</Link></li>
                <li><Link href="#produtos" className="hover:text-primary-400 transition-colors">Categorias</Link></li>
                <li><Link href="#produtos" className="hover:text-primary-400 transition-colors">Novidades</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Sobre</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#como-funciona" className="hover:text-primary-400 transition-colors">Como Funciona</Link></li>
                <li><Link href="#beneficios" className="hover:text-primary-400 transition-colors">Benefícios</Link></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Conta</h3>
              <ul className="space-y-2 text-sm">
                {user ? (
                  <li>
                    <Link href={isAdmin ? '/admin' : '/escritorio'} className="hover:text-primary-400 transition-colors">
                      Meu Escritório
                    </Link>
                  </li>
                ) : (
                  <>
                    <li><Link href="/login" className="hover:text-primary-400 transition-colors">Entrar</Link></li>
                    <li><Link href="/register" className="hover:text-primary-400 transition-colors">Criar Conta</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} AS Miranda. Todos os direitos reservados.</p>
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
