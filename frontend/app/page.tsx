export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-xl">
              R
            </div>
            <span className="text-xl font-bold">RifaNet</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="hover:text-purple-400 transition-colors">Recursos</a>
            <a href="#how-it-works" className="hover:text-purple-400 transition-colors">Como Funciona</a>
            <a href="#benefits" className="hover:text-purple-400 transition-colors">Vantagens</a>
            <a href="/login" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all">
              Começar Agora
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 glass rounded-full text-sm font-semibold text-purple-400 border border-purple-500/30">
                ✨ Plataforma Digital de Rifas
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Transforme Rifas em
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 text-transparent bg-clip-text animate-gradient">
                Oportunidades Digitais
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Sistema completo de gestão de rifas com escritório virtual, 
              pagamento automatizado e sistema de bônus multinível. 
              Venda rifas e ganhe com sua rede.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <a href="/login" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full font-bold text-lg hover:scale-105 transition-transform glow-purple">
                Criar Conta Grátis
              </a>
              <a href="/login" className="px-8 py-4 glass rounded-full font-semibold text-lg hover:glass-strong transition-all">
                Ver Demonstração
              </a>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-16">
              <div className="glass rounded-2xl p-6">
                <div className="text-3xl font-bold text-purple-400">100+</div>
                <div className="text-gray-400 text-sm mt-2">Usuários Ativos</div>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="text-3xl font-bold text-cyan-400">R$ 50k+</div>
                <div className="text-gray-400 text-sm mt-2">Distribuídos</div>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="text-3xl font-bold text-pink-400">5 Níveis</div>
                <div className="text-gray-400 text-sm mt-2">De Bonificação</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Recursos <span className="text-purple-400">Poderosos</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Tudo que você precisa para vender rifas e construir sua rede
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "Escritório Virtual",
                description: "Gerencie suas rifas, vendas e ganhos em um painel completo e intuitivo"
              },
              {
                icon: "💳",
                title: "Pagamento Automático",
                description: "Integração com Mercado Pago para pagamentos instantâneos e seguros"
              },
              {
                icon: "🌐",
                title: "Sistema de Rede",
                description: "Visualize e gerencie sua estrutura de indicados até 5 níveis"
              },
              {
                icon: "💰",
                title: "Bônus Automático",
                description: "Ganhe comissões automáticas de toda sua rede de indicados"
              },
              {
                icon: "📊",
                title: "Relatórios Detalhados",
                description: "Acompanhe performance, vendas e ganhos em tempo real"
              },
              {
                icon: "🔒",
                title: "Segurança Total",
                description: "Criptografia e proteção de dados em todas as transações"
              }
            ].map((feature, index) => (
              <div key={index} className="glass rounded-2xl p-8 hover:glass-strong transition-all group hover:scale-105">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">
              Como <span className="text-cyan-400">Funciona</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Simples, rápido e totalmente automatizado
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500"></div>
            
            {[
              {
                step: "01",
                title: "Cadastre-se",
                description: "Crie sua conta gratuitamente através de um link de indicação"
              },
              {
                step: "02",
                title: "Compre Rifas",
                description: "Escolha suas rifas favoritas e pague com Mercado Pago"
              },
              {
                step: "03",
                title: "Compartilhe",
                description: "Divulgue seu link e construa sua rede de indicados"
              },
              {
                step: "04",
                title: "Ganhe Bônus",
                description: "Receba comissões automáticas de 5 níveis da sua rede"
              }
            ].map((step, index) => (
              <div key={index} className="relative z-10">
                <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-transform">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl font-bold mb-4 glow-purple">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="glass-strong rounded-3xl p-12 md:p-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold">
                  Por que escolher a
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400"> RifaNet</span>?
                </h2>
                <div className="space-y-4">
                  {[
                    "✅ Sistema 100% automatizado",
                    "✅ Ganhos em até 5 níveis",
                    "✅ Pagamentos via PIX instantâneos",
                    "✅ Plataforma escalável e segura",
                    "✅ Suporte técnico dedicado",
                    "✅ Sem taxas ocultas"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 text-lg">
                      <span className="text-green-400">{benefit}</span>
                    </div>
                  ))}
                </div>
                <a href="/login" className="inline-block mt-8 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full font-bold text-lg hover:scale-105 transition-transform glow-cyan">
                  Começar Agora →
                </a>
              </div>
              
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6 border-l-4 border-purple-500">
                  <h4 className="font-bold text-xl mb-2">💎 Transparência Total</h4>
                  <p className="text-gray-400">Acompanhe cada centavo ganho em tempo real no seu extrato detalhado</p>
                </div>
                <div className="glass rounded-2xl p-6 border-l-4 border-cyan-500">
                  <h4 className="font-bold text-xl mb-2">⚡ Performance Máxima</h4>
                  <p className="text-gray-400">Infraestrutura otimizada para suportar milhares de usuários simultâneos</p>
                </div>
                <div className="glass rounded-2xl p-6 border-l-4 border-pink-500">
                  <h4 className="font-bold text-xl mb-2">🚀 Crescimento Exponencial</h4>
                  <p className="text-gray-400">Construa uma rede sólida e veja seus ganhos crescerem automaticamente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold">
            Pronto para começar sua
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              jornada digital?
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Junte-se a centenas de pessoas que já estão transformando rifas em renda extra
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <a href="/login" className="px-10 py-5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full font-bold text-xl hover:scale-105 transition-transform glow-purple">
              Criar Minha Conta Grátis
            </a>
          </div>
          <p className="text-sm text-gray-500">
            Sem cartão de crédito necessário • Comece em menos de 2 minutos
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-xl">
                  R
                </div>
                <span className="text-xl font-bold">RifaNet</span>
              </div>
              <p className="text-gray-400 text-sm">
                Plataforma digital de rifas com sistema de rede multinível
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Preços</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Segurança</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 RifaNet. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
