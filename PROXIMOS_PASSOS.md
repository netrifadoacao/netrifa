# 🚀 Próximos Passos - RifaNet

## ✅ O que já foi feito

1. ✅ Estrutura de monorepo criada (frontend/backend)
2. ✅ Frontend configurado com Next.js 16 + React 19 + Tailwind v4
3. ✅ Landing page futurista com glassmorfismo criada
4. ✅ BACKLOG.md atualizado com stack tecnológico definido
5. ✅ README.md completo criado
6. ✅ Documentação de configuração de ambiente

## 🎯 Próximos Passos Recomendados

### Fase 1: Configurar Supabase (Backend)

#### 1.1 Criar Projeto Supabase
```bash
# Acesse https://supabase.com
# Crie uma conta e um novo projeto
# Anote as credenciais (URL e anon key)
```

#### 1.2 Criar Schema do Banco de Dados
```sql
-- Criar tabelas principais
-- users, raffles, tickets, purchases, bonuses, withdrawals, network

-- Exemplo de tabela users (estendendo auth.users do Supabase)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  pix_key TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

#### 1.3 Configurar Variáveis de Ambiente
```bash
cd frontend
# Criar .env.local com as credenciais do Supabase
# Ver ENV_SETUP.md para detalhes
```

### Fase 2: Instalar Dependências do Supabase

```bash
cd frontend
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
```

### Fase 3: Implementar Autenticação

#### 3.1 Criar Cliente Supabase
```typescript
// frontend/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

#### 3.2 Criar Páginas de Auth
- [ ] `/app/(auth)/login/page.tsx` - Tela de login
- [ ] `/app/(auth)/register/page.tsx` - Tela de cadastro
- [ ] `/app/(auth)/forgot-password/page.tsx` - Recuperação de senha

### Fase 4: Criar Componentes Base

#### 4.1 Componentes de UI Reutilizáveis
- [ ] `Button.tsx` - Botão estilizado
- [ ] `Card.tsx` - Card com glassmorfismo
- [ ] `Input.tsx` - Input field
- [ ] `Modal.tsx` - Modal/Dialog
- [ ] `Navbar.tsx` - Navegação
- [ ] `Footer.tsx` - Rodapé

#### 4.2 Layouts
- [ ] `/app/(dashboard)/layout.tsx` - Layout do escritório virtual
- [ ] `/app/(admin)/layout.tsx` - Layout administrativo

### Fase 5: Implementar Escritório Virtual

#### 5.1 Dashboard do Usuário
- [ ] `/app/(dashboard)/page.tsx` - Home com rifas
- [ ] `/app/(dashboard)/dados/page.tsx` - Dados do usuário
- [ ] `/app/(dashboard)/rede/page.tsx` - Estrutura de rede
- [ ] `/app/(dashboard)/saque/page.tsx` - Solicitar saque
- [ ] `/app/(dashboard)/extrato/page.tsx` - Extrato financeiro

### Fase 6: Integração com Mercado Pago

#### 6.1 Instalar SDK
```bash
cd frontend
npm install @mercadopago/sdk-react
```

#### 6.2 Implementar Fluxo de Pagamento
- [ ] Criar preferência de pagamento
- [ ] Redirecionar para checkout
- [ ] Implementar webhook para confirmação
- [ ] Atualizar status da compra

### Fase 7: Implementar Painel Admin

- [ ] `/app/(admin)/page.tsx` - Dashboard admin
- [ ] `/app/(admin)/rifas/page.tsx` - Gestão de rifas
- [ ] `/app/(admin)/saques/page.tsx` - Gestão de saques
- [ ] `/app/(admin)/bonus/page.tsx` - Configuração de bônus

### Fase 8: Sistema de Bônus

- [ ] Função para calcular bônus (Supabase Edge Function)
- [ ] Trigger no banco para distribuir bônus
- [ ] Atualização de saldo automática

### Fase 9: Testes e Deploy

#### 9.1 Deploy Frontend (Vercel)
```bash
# Conectar repositório GitHub com Vercel
# Configurar variáveis de ambiente
# Deploy automático a cada push
```

#### 9.2 Testes
- [ ] Testes de funcionalidade manual
- [ ] Testes de performance
- [ ] Testes de segurança

## 📝 Comandos Úteis

### Desenvolvimento
```bash
# Rodar frontend
npm run dev:frontend
# ou
cd frontend && npm run dev

# Rodar backend (quando configurado)
npm run dev:backend
```

### Build
```bash
# Build do frontend
npm run build:frontend
```

## 🎨 Design System Criado

A landing page já está com:
- ✅ Glassmorfismo implementado
- ✅ Gradientes animados
- ✅ Seções responsivas:
  - Hero com CTAs
  - Features (6 recursos)
  - How it Works (4 passos)
  - Benefits
  - CTA Final
  - Footer completo
- ✅ Navegação fixa com glass effect
- ✅ Animações suaves
- ✅ Tema dark futurista

## 🔗 Links Úteis

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Mercado Pago Docs](https://www.mercadopago.com.br/developers)

## 💡 Dicas

1. **Comece configurando o Supabase** - É a base de tudo
2. **Use Row Level Security** - Segurança desde o início
3. **Teste localmente primeiro** - Use o Supabase local dev
4. **Commits frequentes** - Versione cada feature
5. **Documentação** - Documente decisões importantes

---

**Status Atual:** Landing Page ✅ | Backend Config ⏳ | Auth ⏳ | Dashboard ⏳

