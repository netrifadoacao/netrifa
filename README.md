# Sistema de Renda Recorrente Universal (AS Miranda)

Este sistema é uma plataforma digital de vendas em rede (multinível) que permite a comercialização de produtos/serviços com distribuição automática de bônus.

## 🚀 Tech Stack

*   **Frontend:** Next.js (App Router), Tailwind CSS, Lucide Icons.
*   **Backend:** Supabase (Database, Auth, Edge Functions, Storage, Realtime).
*   **Pagamentos:** Integração via Mercado Pago.
*   **Deploy:** Vercel (Frontend) + Supabase (Backend).

## 🛠️ Configuração do Ambiente

O projeto utiliza o **Supabase** como Backend-as-a-Service (BaaS). Toda a lógica de banco de dados, autenticação e funções server-side reside lá.

### Pré-requisitos
1.  Node.js 18+ instalado.
2.  Conta no [Supabase](https://supabase.com).
3.  Supabase CLI instalado (`npm install -g supabase`).

### Passo a Passo
1.  Clone o repositório.
2.  Instale as dependências: `npm install`.
3.  Crie um projeto no Supabase.
4.  Copie `.env.example` para `.env.local` e preencha:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
    SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role (apenas para scripts backend)
    ```
5.  Inicialize o Supabase localmente (opcional para dev) ou link com o projeto remoto:
    ```bash
    npx supabase login
    npx supabase link --project-ref seu-project-id
    ```
6.  Aplique as migrações de banco de dados:
    ```bash
    npx supabase db push
    ```
7.  Configuração de Secrets e Deploy das Edge Functions:
    Antes de fazer o deploy, configure as variáveis de ambiente (Secrets) no Supabase:
    ```bash
    npx supabase secrets set MP_ACCESS_TOKEN=seu_token_de_acesso_mp 
    npx supabase secrets set SUPABASE_URL=sua_url_supabase 
    npx supabase secrets set SUPABASE_ANON_KEY=sua_chave_anonima 
    npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role 
    ```

    Em seguida, faça o deploy das funções:
    ```bash
    npx supabase functions deploy create-checkout 
    npx supabase functions deploy mp-webhook
    ```

### 403 Forbidden nas Edge Functions (ex.: admin-dashboard)

As rotas de admin exigem `profiles.role = 'admin'`. Se você entrar com um usuário que não é admin (ex.: membro1@projetodoacao.com), as chamadas a `/functions/v1/admin-dashboard` e outras rotas protegidas retornam `{"error":"Forbidden"}`.

**Opções:**

1. **Entrar como admin:** use `admin@projetodoacao.com` com a senha do seed (ex.: `Senha123!`).
2. **Tornar um usuário admin:** no Supabase Dashboard → SQL Editor, execute:
   ```sql
   update public.profiles set role = 'admin' where id = 'a0000002-0000-4000-8000-000000000002';
   ```
   (troque o `id` pelo UUID do usuário desejado, ou use o script `supabase/set-admin.sql`).

## 📂 Estrutura do Projeto

*   `/app`: Código fonte do Frontend (Next.js).
*   `/supabase`: Infraestrutura do Backend.
    *   `/migrations`: Arquivos SQL para criar tabelas e triggers.
    *   `/functions`: Edge Functions (Deno/TypeScript) para lógica de negócio complexa (Webhooks, Bônus).
*   `/documents`: Documentação de Backlog e Sprints.

## 🌟 Funcionalidades Principais

1.  **Escritório Virtual:** Painel do usuário para gestão de rede e saques.
2.  **Painel Administrativo:** Controle total de produtos, configurações de bônus e aprovações.
3.  **Sistema de Rede:** Árvore multinível com comissionamento até o 5º nível.
4.  **Pagamentos:** Checkout transparente com Mercado Pago e baixa automática via Webhooks.

---
*Documentação técnica mantida pela equipe de desenvolvimento.*
