'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingBag, FiArrowRight, FiUsers, FiTrendingUp, FiDollarSign, FiGift, FiMenu, FiX, FiVideo } from 'react-icons/fi';
import { SiWhatsapp } from 'react-icons/si';
import { useFunctions } from '@/lib/supabase-functions';
import HeroBackground from '@/components/HeroBackground';
import AnimatedGoldCounter from '@/components/AnimatedGoldCounter';

const WHATSAPP_LINK = `https://wa.me/${process.env.NEXT_PUBLIC_NUMERO_WHATSAPP_INTEGRACAO || '559286009714'}`;

const MOCK_MEMBROS_REDE = 12480;
const MOCK_FATURAMENTO_MILHOES = 2.85;

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

  const fetchProdutos = useCallback(async () => {
    try {
      const data = await functions.products.list();
      setProdutos((data ?? []).map((p) => ({ id: p.id, nome: p.name, descricao: p.description ?? '', preco: p.price, tipo: 'digital', ativo: p.active })).slice(0, 4));
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [functions]);

  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

  useEffect(() => {
    if (authLoading) return;
    if (user && (profile?.role === 'admin' || profile?.role === 'member')) {
      router.replace(profile.role === 'admin' ? '/admin' : '/escritorio');
    }
  }, [authLoading, user, profile?.role, router]);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onScroll = () => setMobileMenuOpen(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mobileMenuOpen]);

  if (!authLoading && user && (profile?.role === 'admin' || profile?.role === 'member')) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-steel-500 border-t-transparent" />
      </div>
    );
  }

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
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-steel-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rich-black text-white selection:bg-steel-500 selection:text-steel-950">
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="logo-circle-gold flex-shrink-0 w-14 h-14 transition-all duration-300">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-rich-black">
                  <Image src="/logo-as.png" alt="AS Digital" fill sizes="56px" className="object-contain p-1" />
                </div>
              </div>
              <span className="brand-logo-text font-semibold text-xl sm:text-2xl group-hover:opacity-95 transition-opacity">AS Digital</span>
            </Link>
            <div className="hidden md:flex items-center space-x-2">
              <Link href="#beneficios" className="px-4 py-2 text-steel-400 hover:text-white font-medium rounded-full hover:bg-white/5 transition-all duration-200">Benefícios</Link>
              <Link href="#fluxo-rede" className="px-4 py-2 text-steel-400 hover:text-white font-medium rounded-full hover:bg-white/5 transition-all duration-200">Fluxo da Rede</Link>
              <Link href="#como-funciona" className="px-4 py-2 text-steel-400 hover:text-white font-medium rounded-full hover:bg-white/5 transition-all duration-200">Como Entrar</Link>
              <Link href="#produtos" className="px-4 py-2 text-steel-400 hover:text-white font-medium rounded-full hover:bg-white/5 transition-all duration-200">Produtos</Link>
              {user ? (
                <Link href={isAdmin ? '/admin' : '/escritorio'} className="ml-4 px-6 py-2.5 btn-gold-metallic font-semibold rounded-full transition-all duration-200 flex items-center space-x-2">
                  <span>Meu Escritório</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="flex items-center space-x-3 ml-4">
                  <Link href="/login" className="px-6 py-2.5 btn-silver-metallic font-medium rounded-full transition-all">Entrar</Link>
                  <Link href="/register" className="px-6 py-2.5 btn-gold-metallic font-bold rounded-full transition-all duration-200 flex items-center space-x-2">Começar Agora</Link>
                </div>
              )}
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-steel-400 hover:bg-white/5 hover:text-white">
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      <div className={`md:hidden fixed inset-0 z-40 ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} aria-hidden onClick={closeMobileMenu} />
        <aside className={`fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] glass-strong border-l border-white/10 z-50 flex flex-col transition-transform duration-300 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} aria-modal aria-label="Menu">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <span className="font-display text-lg font-bold text-white">Menu</span>
            <button onClick={closeMobileMenu} className="p-2 rounded-lg text-steel-400 hover:bg-white/5 hover:text-white"><FiX className="w-5 h-5" /></button>
          </div>
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            <Link href="#beneficios" onClick={closeMobileMenu} className="block py-3 px-4 text-steel-400 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-colors">Benefícios</Link>
            <Link href="#fluxo-rede" onClick={closeMobileMenu} className="block py-3 px-4 text-steel-400 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-colors">Fluxo da Rede</Link>
            <Link href="#como-funciona" onClick={closeMobileMenu} className="block py-3 px-4 text-steel-400 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-colors">Como Entrar</Link>
            <Link href="#produtos" onClick={closeMobileMenu} className="block py-3 px-4 text-steel-400 hover:text-white hover:bg-white/5 font-medium rounded-xl transition-colors">Produtos</Link>
            {user ? (
              <Link href={isAdmin ? '/admin' : '/escritorio'} onClick={closeMobileMenu} className="block mt-4 py-3 px-4 btn-gold-metallic font-semibold rounded-xl text-center transition-colors">Meu Escritório</Link>
            ) : (
              <div className="mt-4 space-y-2">
                <Link href="/login" onClick={closeMobileMenu} className="block py-3 px-4 text-center btn-silver-metallic font-medium rounded-xl transition-colors">Entrar</Link>
                <Link href="/register" onClick={closeMobileMenu} className="block py-3 px-4 btn-gold-metallic font-semibold rounded-xl text-center transition-colors">Começar Agora</Link>
              </div>
            )}
          </nav>
        </aside>
      </div>

      <section className="relative overflow-hidden pt-20 pb-24">
        <HeroBackground />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.07]" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 glass glass-gold-edge rounded-full mb-6">
              <FiUsers className="w-4 h-4 text-gold-300" />
              <span className="text-sm font-semibold text-gold-200">Renda passiva e ganhos recorrentes na rede</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-black mb-5 leading-tight text-white">
              Entre para a rede e
              <br />
              <span className="brand-logo-text">multiplique seus ganhos</span>
            </h1>
            <p className="text-lg md:text-xl text-steel-400 mb-8 max-w-2xl mx-auto">
              Indique, venda com comissão, compre com cashback e receba bônus em múltiplos níveis. Seu primeiro indicado ainda ganha dois diretos de presente para começar com renda desde o dia um.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14">
              {user ? (
                <Link href={isAdmin ? '/admin' : '/escritorio'} className="group px-8 py-4 btn-gold-metallic font-bold text-lg rounded-full transition-all duration-200 flex items-center space-x-3">
                  <span>Acessar Meu Escritório</span>
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link href="/register" className="group px-8 py-4 btn-gold-metallic font-bold text-lg rounded-full transition-all duration-200 flex items-center space-x-3">
                    <span>Começar Agora</span>
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="/login" className="px-8 py-4 btn-silver-metallic font-bold text-lg rounded-full transition-all duration-200">Entrar</Link>
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="px-8 py-4 font-bold text-lg rounded-full transition-all duration-200 bg-[#25D366]/20 border border-[#25D366]/50 text-white hover:bg-[#25D366]/35 hover:border-[#25D366]/70 hover:brightness-110 flex items-center space-x-3">
                    <SiWhatsapp className="w-5 h-5" />
                    <span>Tirar dúvidas no WhatsApp</span>
                  </a>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-6 sm:gap-10 max-w-3xl mx-auto">
              <div className="glass-strong rounded-2xl p-6 border border-gold-500/30">
                <div className="text-3xl sm:text-4xl md:text-5xl counter-gold mb-1">
                  <AnimatedGoldCounter value={MOCK_MEMBROS_REDE} duration={2200} suffix="+" />
                </div>
                <div className="text-sm text-steel-400">Membros na rede</div>
              </div>
              <div className="glass-strong rounded-2xl p-6 border border-gold-500/30">
                <div className="text-3xl sm:text-4xl md:text-5xl counter-gold mb-1">
                  R$ <AnimatedGoldCounter value={MOCK_FATURAMENTO_MILHOES} duration={2500} decimals={2} suffix=" M" />
                </div>
                <div className="text-sm text-steel-400">Faturamento da rede</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-gold-600/20 rounded-full blur-[120px] opacity-60 pointer-events-none" aria-hidden />
        <div className="absolute top-40 right-10 w-96 h-96 bg-gold-500/15 rounded-full blur-[120px] opacity-50 pointer-events-none" aria-hidden />
      </section>

      <section id="dia-do-milhao" className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-950/40 via-rich-black to-rich-black" aria-hidden />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.06]" aria-hidden />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-500/20 rounded-full blur-[140px] pointer-events-none" aria-hidden />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 border border-gold-400/50 text-gold-200 text-sm font-semibold mb-6">
              <FiVideo className="w-4 h-4" />
              Exclusivo para membros da rede
            </span>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
              Dia do <span className="brand-logo-text">Milhão</span>
            </h2>
            <p className="text-xl sm:text-2xl text-steel-300 max-w-2xl mx-auto mb-12">
              Uma live por mês. <strong className="text-white">R$ 5,00</strong> para entrar. <strong className="text-gold-300">Um sorteado leva tudo.</strong>
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="glass-strong rounded-2xl p-6 border-2 border-gold-500/40 text-center">
              <div className="text-4xl md:text-5xl font-black text-gold-300 mb-1">R$ 5</div>
              <div className="text-steel-400 text-sm">por participação</div>
            </div>
            <div className="glass-strong rounded-2xl p-6 border-2 border-gold-500/40 text-center">
              <div className="text-4xl md:text-5xl font-black text-gold-300 mb-1">1x</div>
              <div className="text-steel-400 text-sm">por mês</div>
            </div>
            <div className="glass-strong rounded-2xl p-6 border-2 border-gold-500/40 text-center">
              <div className="text-4xl md:text-5xl font-black text-gold-300 mb-1">1</div>
              <div className="text-steel-400 text-sm">ganhador leva o pot</div>
            </div>
          </div>
          <div className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-gold-900/30 to-gold-950/20 border-2 border-gold-500/50 mb-12">
            <p className="text-steel-300 text-center text-lg mb-4">
              Todo membro da rede pode entrar na live pagando apenas <strong className="text-white">R$ 5,00</strong>. Uma vez por mês sorteamos <strong className="text-gold-300">um membro para levar todo o valor</strong> arrecadado. Quando o pot ultrapassar <strong className="text-white">um milhão</strong>, o que passar vai para a <strong className="text-gold-300">Virada do Milhão</strong>: sorteamos o acumulado para toda a rede, na mesma lógica.
            </p>
            <p className="text-gold-200 text-center font-semibold">
              Pouco para entrar. Tudo para ganhar.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <Link href={isAdmin ? '/admin' : '/escritorio'} className="group px-10 py-4 btn-gold-metallic font-bold text-lg rounded-full transition-all duration-200 flex items-center space-x-3 shadow-lg shadow-gold-500/20">
                <span>Ver no Meu Escritório</span>
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link href="/register" className="group px-10 py-4 btn-gold-metallic font-bold text-lg rounded-full transition-all duration-200 flex items-center space-x-3 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30">
                  <span>Entrar na rede e participar</span>
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="px-10 py-4 font-bold text-lg rounded-full border-2 border-gold-500/50 text-gold-200 hover:bg-gold-500/15 transition-all flex items-center gap-2">
                  <SiWhatsapp className="w-5 h-5" />
                  Dúvidas no WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="beneficios" className="py-16 bg-rich-gray relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3">Por que entrar na rede?</h2>
            <p className="text-steel-400 max-w-xl mx-auto">Renda passiva, ganhos recorrentes, comissão em indicações e cashback em compras.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FiTrendingUp, title: 'Renda passiva', desc: 'Ganhe bônus da sua rede em múltiplos níveis, mesmo quando não está vendendo.' },
              { icon: FiDollarSign, title: 'Ganhos recorrentes', desc: 'Cada venda e movimento na rede gera comissão para você de forma recorrente.' },
              { icon: FiUsers, title: 'Indicação com comissão', desc: 'Indique produtos e pessoas e receba percentual em todas as indicações diretas e indiretas.' },
              { icon: FiShoppingBag, title: 'Produtos exclusivos com cashback', desc: 'Compre produtos da rede com desconto e ainda acumule cashback no seu saldo.' },
            ].map((item, idx) => (
              <div key={idx} className="glass rounded-xl p-6 border border-white/10 hover:glass-gold-edge transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center border border-gold-400/40 mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7 text-gold-300" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-steel-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="fluxo-rede" className="py-16 bg-rich-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3">Fluxo da rede e regra dos 3 primeiros</h2>
            <p className="text-steel-400 max-w-2xl mx-auto">Quem você indica entra na sua rede. Quem o seu upline indica também pode virar ganho para você.</p>
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
            <div className="flex flex-col items-center text-center max-w-[200px]">
              <div className="w-20 h-20 rounded-full bg-gold-500/20 border-2 border-gold-400/50 flex items-center justify-center mb-3">
                <FiUsers className="w-10 h-10 text-gold-300" />
              </div>
              <span className="font-bold text-white">Você (patrocinador)</span>
              <span className="text-sm text-steel-500">Indica pessoas</span>
            </div>
            <FiArrowRight className="w-8 h-8 text-gold-400/80 hidden lg:block flex-shrink-0" />
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex flex-col items-center">
                  <div className="coin-gold w-16 h-16">
                    <div className="coin-face">
                      <span className="text-gold-200 font-black text-lg">1º</span>
                    </div>
                  </div>
                  <span className="text-xs text-steel-400 mt-1">1º indicado</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="coin-silver w-16 h-16">
                    <div className="coin-face">
                      <span className="text-silver-200 font-bold text-lg">2º</span>
                    </div>
                  </div>
                  <span className="text-xs text-steel-400 mt-1">2º indicado</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="coin-silver w-16 h-16">
                    <div className="coin-face">
                      <span className="text-silver-200 font-bold text-lg">3º</span>
                    </div>
                  </div>
                  <span className="text-xs text-steel-400 mt-1">3º indicado</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold-900/40 border border-gold-500/50">
                <FiGift className="w-5 h-5 text-gold-300" />
                <span className="text-sm font-semibold text-gold-200">Presente da rede</span>
              </div>
              <p className="text-steel-400 text-sm mt-3 max-w-sm text-center">
                O <strong className="text-white">1º indicado</strong> recebe como diretos de presente o <strong className="text-gold-300">2º e o 3º</strong> que você indicar. Ele já começa com rede e renda.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="py-16 bg-rich-gray relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3">Como entrar na rede</h2>
            <p className="text-steel-400 max-w-xl mx-auto">Três passos para começar a ganhar.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, icon: FiUsers, title: 'Cadastre-se', desc: 'Crie sua conta e informe quem te indicou. É rápido e seguro.' },
              { step: 2, icon: FiDollarSign, title: 'Pague a adesão via PIX', desc: 'Valor único de adesão. Você recebe o QR Code e pode enviar o comprovante pelo WhatsApp para aprovação rápida.' },
              { step: 3, icon: FiTrendingUp, title: 'Construa sua rede', desc: 'Indique pessoas, indique produtos e acompanhe seus ganhos no escritório virtual.' },
            ].map((item) => (
              <div key={item.step} className="relative glass rounded-2xl p-8 border border-white/10">
                <div className="absolute -top-4 left-8 w-12 h-12 bg-gold-gradient rounded-full flex items-center justify-center text-gold-950 font-black text-xl border border-gold-400/70 shadow-gleam-gold">{item.step}</div>
                <div className="mt-4 mb-4">
                  <item.icon className="w-12 h-12 text-gold-300" />
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-steel-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="produtos" className="py-14 bg-rich-black relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-black text-white mb-2">Produtos em destaque</h2>
            <p className="text-steel-500 text-sm">Mais vendidos na rede • Compre com cashback</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-steel-500 border-t-transparent" />
            </div>
          ) : produtos.length === 0 ? (
            <p className="text-center text-steel-500 py-8">Nenhum produto em destaque no momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {produtos.map((produto) => (
                <div key={produto.id} className="glass rounded-xl p-5 border border-white/10 hover:border-gold-400/30 transition-all group">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/5 rounded-xl mb-3 border border-gold-400/30">
                    <FiShoppingBag className="w-6 h-6 text-gold-300" />
                  </div>
                  <h3 className="font-display font-bold text-white mb-1 line-clamp-2">{produto.nome}</h3>
                  <p className="text-steel-500 text-sm mb-3 line-clamp-2">{produto.descricao}</p>
                  <div className="font-display text-xl font-black text-gold-300 mb-3">R$ {produto.preco.toFixed(2)}</div>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedProduct(produto)} className="flex-1 py-2 text-sm btn-silver-metallic font-medium rounded-lg">Ver</button>
                    <button onClick={() => handleComprar(produto)} className="flex-1 py-2 text-sm btn-gold-metallic font-semibold rounded-lg">Comprar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {!user && (
        <section className="py-16 bg-rich-gray relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">Pronto para entrar na rede?</h2>
            <p className="text-steel-400 mb-8">Cadastre-se, pague a adesão via PIX e comece a construir sua rede com bônus em múltiplos níveis.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
              <Link href="/register" className="px-8 py-4 btn-gold-metallic font-bold text-lg rounded-full transition-all duration-200">Começar Agora</Link>
              <Link href="/login" className="px-8 py-4 btn-silver-metallic font-bold text-lg rounded-full transition-all duration-200">Entrar</Link>
              <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="px-8 py-4 font-bold text-lg rounded-full transition-all duration-200 bg-[#25D366]/20 border border-[#25D366]/50 text-white hover:bg-[#25D366]/35 hover:border-[#25D366]/70 hover:brightness-110 flex items-center gap-2">
                <SiWhatsapp className="w-5 h-5" />
                Tirar dúvidas no WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}

      <footer className="bg-rich-black text-steel-400 py-10 border-t border-steel-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
            <div>
              <div className="brand-logo-text font-semibold text-xl mb-3">AS Digital</div>
              <p className="text-sm text-steel-500">Rede de indicação com renda passiva e ganhos recorrentes.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Rede</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#beneficios" className="hover:text-white transition-colors">Benefícios</Link></li>
                <li><Link href="#dia-do-milhao" className="hover:text-white transition-colors">Dia do Milhão</Link></li>
                <li><Link href="#fluxo-rede" className="hover:text-white transition-colors">Fluxo da rede</Link></li>
                <li><Link href="#como-funciona" className="hover:text-white transition-colors">Como entrar</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Produtos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#produtos" className="hover:text-white transition-colors">Em destaque</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Conta</h3>
              <ul className="space-y-2 text-sm">
                {user ? (
                  <li><Link href={isAdmin ? '/admin' : '/escritorio'} className="hover:text-white transition-colors">Meu Escritório</Link></li>
                ) : (
                  <>
                    <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
                    <li><Link href="/register" className="hover:text-white transition-colors">Criar conta</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-steel-800 pt-6 text-center text-sm text-steel-500">
            <p>&copy; {new Date().getFullYear()} <span className="brand-logo-text font-medium">AS Digital</span>. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
          <div className="glass-strong rounded-2xl max-w-2xl w-full p-8 border border-white/20 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-2xl font-black text-white">{selectedProduct.nome}</h3>
              <button onClick={() => setSelectedProduct(null)} className="w-10 h-10 rounded-full btn-silver-metallic flex items-center justify-center transition-colors text-white"><FiX className="w-5 h-5" /></button>
            </div>
            <p className="text-steel-400 mb-6">{selectedProduct.descricao}</p>
            <div className="flex items-center justify-between mb-6 p-6 bg-white/5 rounded-xl border border-white/10">
              <div>
                <div className="text-sm text-steel-400 mb-1">Investimento</div>
                <div className="font-display text-3xl font-black text-white">R$ {selectedProduct.preco.toFixed(2)}</div>
              </div>
              <span className="px-4 py-2 bg-gold-800/80 text-gold-200 font-bold rounded-full text-sm border border-gold-500/50">{selectedProduct.tipo.toUpperCase()}</span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setSelectedProduct(null)} className="flex-1 px-6 py-3 btn-silver-metallic font-semibold rounded-xl transition-colors">Fechar</button>
              <button onClick={() => handleComprar(selectedProduct)} disabled={buying} className="flex-1 px-6 py-3 btn-gold-metallic font-semibold rounded-xl disabled:opacity-50 transition-all">{buying ? 'Processando...' : 'Comprar Agora'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
