# 🎯 RifaNet - Sistema de Rifas Digital

Sistema completo de gestão de rifas com escritório virtual, pagamento automatizado via Mercado Pago e sistema de bônus multinível.

## 📁 Estrutura do Monorepo

```
doacao/
├── frontend/          # Next.js + React + Tailwind CSS
├── backend/           # Node.js + Supabase
├── requisitos/        # Documentação de requisitos
└── BACKLOG.md        # Backlog detalhado do projeto
```

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 16.1+ (App Router)
- **UI Library**: React 19.2+
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript 5+
- **Animações**: CSS Animations + Glassmorphism
- **Deploy**: Vercel

### Backend
- **Runtime**: Node.js 20+
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Supabase REST API + Real-time subscriptions
- **Payments**: Mercado Pago SDK
- **Deploy**: Vercel Serverless Functions / Railway

## 🎨 Design System

- **Tema**: Dark mode futurista
- **Estilo**: Glassmorphism + Gradientes high-tech
- **Cores Principais**:
  - Purple: `#8b5cf6` (Primary)
  - Cyan: `#06b6d4` (Secondary)
  - Amber: `#f59e0b` (Accent)
- **Tipografia**: System UI fonts
- **Componentes**: Glass cards, Gradient buttons, Animated backgrounds

## 🏃‍♂️ Getting Started

### Pré-requisitos

- Node.js 20+ instalado
- npm ou yarn
- Conta Supabase (gratuita)
- Conta Mercado Pago (para integração de pagamentos)

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd doacao
```

2. **Configure o Frontend**
```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

3. **Configure o Backend** (em breve)
```bash
cd backend
npm install
# Configurar variáveis de ambiente
npm run dev
```

### Variáveis de Ambiente

Crie os arquivos `.env.local`:

**Frontend (.env.local)**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=your_mp_public_key
```

**Backend (.env)**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
MERCADO_PAGO_ACCESS_TOKEN=your_mp_access_token
MERCADO_PAGO_WEBHOOK_SECRET=your_webhook_secret
```

## 📦 Estrutura do Frontend

```
frontend/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Estilos globais + Glassmorphism
│   ├── (auth)/             # Rotas de autenticação
│   ├── (dashboard)/        # Escritório virtual
│   └── (admin)/            # Painel administrativo
├── components/             # Componentes reutilizáveis
├── lib/                    # Utilitários e configurações
└── public/                 # Assets estáticos
```

## 🗄️ Estrutura do Backend (Supabase)

### Tabelas Principais

- `users` - Usuários do sistema
- `raffles` - Rifas disponíveis
- `tickets` - Bilhetes de rifas
- `purchases` - Histórico de compras
- `bonuses` - Bônus e comissões
- `withdrawals` - Solicitações de saque
- `network` - Estrutura de rede (indicações)

### Supabase Features Utilizados

- ✅ **Authentication**: Sistema de login/cadastro
- ✅ **Database**: PostgreSQL com Row Level Security
- ✅ **Storage**: Upload de imagens das rifas
- ✅ **Real-time**: Atualizações em tempo real
- ✅ **Edge Functions**: Webhooks e processamento
- ✅ **API Auto-gerada**: REST API automática

## 🎯 Funcionalidades Principais

### Escritório Virtual (Usuário)
- ✅ Dashboard com rifas disponíveis
- ✅ Compra de rifas com Mercado Pago
- ✅ Visualização da estrutura de rede (5 níveis)
- ✅ Extrato financeiro detalhado
- ✅ Solicitação de saques via PIX
- ✅ Gerenciamento de dados cadastrais

### Painel Administrativo
- ✅ Criação e gestão de rifas
- ✅ Aprovação manual de compras
- ✅ Gestão de saques (aprovar/pagar/recusar)
- ✅ Configuração de bônus multinível
- ✅ Dashboard com KPIs
- ✅ Relatórios gerenciais

### Sistema Automático
- ✅ Integração com Mercado Pago
- ✅ Cálculo automático de bônus (5 níveis)
- ✅ Notificações por e-mail
- ✅ Webhooks para confirmação de pagamento
- ✅ Auditoria completa de transações

## 🔐 Segurança

- Autenticação JWT via Supabase
- Row Level Security (RLS) no banco
- HTTPS obrigatório
- Proteção CSRF
- Rate limiting
- Criptografia de dados sensíveis
- Logs de auditoria

## 📊 Roadmap

Veja o [BACKLOG.md](./BACKLOG.md) para o roadmap completo com 52 histórias de usuário organizadas em 20 épicos.

### Fase 1 - MVP (8 sprints)
- [ ] Infraestrutura e autenticação
- [ ] Integração Mercado Pago
- [ ] Gestão de rifas (Admin)
- [ ] Escritório virtual básico
- [ ] Sistema de bônus
- [ ] Deploy inicial

### Fase 2 - Expansão (6 sprints)
- [ ] Visualização de rede
- [ ] Dashboard administrativo
- [ ] Sistema de notificações
- [ ] Segurança avançada

### Fase 3 - Refinamento (5 sprints)
- [ ] Relatórios e analytics
- [ ] Otimizações de performance
- [ ] Documentação completa
- [ ] Testes automatizados

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📞 Suporte

Para dúvidas e suporte:
- Email: suporte@rifanet.com
- Discord: [Link do servidor]
- Documentação: [Link da docs]

---

**Desenvolvido com 💜 usando Next.js, Supabase e muito café ☕**

