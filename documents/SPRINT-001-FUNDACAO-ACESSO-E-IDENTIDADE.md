# SPRINT 001: Fundação Supabase, Auth e Identidade

**Objetivo Macro:** Configurar o ambiente Supabase (local e remoto), implementar a autenticação completa (Sign Up/Sign In) utilizando o pacote moderno `@supabase/ssr` para Next.js App Router, e garantir a vinculação automática de usuários aos seus patrocinadores.

**Período Estimado:** 1 Semana

---

## 1. Definição de Pronto (DoD)
- [ ] Projeto Supabase inicializado e conectado.
- [ ] Migrations aplicadas para tabela `profiles` e Triggers.
- [ ] Pacote `@supabase/ssr` instalado e configurado (Clients Server e Client-side).
- [ ] Fluxo de **Sign Up** (Cadastro) implementado enviando metadados do patrocinador.
- [ ] Fluxo de **Sign In** (Login) implementado com suporte a PKCE (Auth Callback).
- [ ] Middleware do Next.js configurado para refrescar tokens e proteger rotas.
- [ ] RLS Policies ativas e testadas.

---

## 2. Tarefas e Implementação Técnica

### US01 - Infraestrutura e Schema (Database)
**Descrição:** Preparar o banco de dados para receber os usuários.

**Passos Técnicos:**
1.  Inicializar Supabase: `npx supabase init`.
2.  Migration `init_schema`:
    ```sql
    -- Tabela de Perfis Pública (Espelho do auth.users)
    create table public.profiles (
      id uuid not null references auth.users(id) on delete cascade primary key,
      email text not null,
      full_name text,
      sponsor_id uuid references public.profiles(id),
      role text default 'member' check (role in ('admin', 'member')),
      referral_code text unique default encode(gen_random_bytes(6), 'hex'),
      wallet_balance decimal(10,2) default 0.00,
      created_at timestamptz default now()
    );
    
    -- Habilitar RLS
    alter table public.profiles enable row level security;
    
    -- Policies (Segurança)
    create policy "Public Read Sponsor" on profiles for select using (true); -- Necessário para validar código de indicação
    create policy "User View Own" on profiles for select using (auth.uid() = id);
    create policy "User Update Own" on profiles for update using (auth.uid() = id);
    create policy "Admin Full Access" on profiles for all using (
      exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    );
    ```

### US02 - Cadastro com Metadados (Sign Up)
**Descrição:** O cadastro deve receber o código do patrocinador e salvar nos metadados do usuário (`raw_user_meta_data`), que serão usados pelo Trigger para vincular na tabela `profiles`.

**Passos Técnicos:**
1.  **Frontend (Register Page):**
    *   Usar `supabase.auth.signUp()` enviando o código no campo `options.data`.
    ```typescript
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          sponsor_referral_code: codeFromUrl, // ex: ?ref=123456
          full_name: name
        }
      }
    })
    ```
2.  **Backend (Trigger Function):**
    *   Criar função `handle_new_user` que lê `new.raw_user_meta_data->>'sponsor_referral_code'`.
    *   Buscar ID do patrocinador.
    *   Inserir em `public.profiles`.

### US03 - Autenticação e Sessão (Sign In & SSR)
**Descrição:** Implementar o login seguro utilizando Cookies e PKCE para compatibilidade total com Next.js Server Components.

**Passos Técnicos:**
1.  **Instalação:** `npm install @supabase/ssr @supabase/supabase-js`.
2.  **Configuração de Clientes:**
    *   `utils/supabase/client.ts`: `createBrowserClient` (para Client Components).
    *   `utils/supabase/server.ts`: `createServerClient` (para Server Components/Actions).
3.  **Rota de Callback (PKCE):**
    *   Criar `app/auth/callback/route.ts`.
    *   Responsável por trocar o `code` retornado pelo Supabase por uma sessão (Cookies).
    ```typescript
    // app/auth/callback/route.ts
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    if (code) {
      const supabase = createClient()
      await supabase.auth.exchangeCodeForSession(code)
    }
    ```
4.  **Login Page:**
    *   Usar `supabase.auth.signInWithPassword()`.
    *   Em caso de sucesso, redirecionar para `/escritorio`.
5.  **Middleware (Proteção):**
    *   Atualizar `middleware.ts` usando `createServerClient` para gerenciar refresh de tokens e redirecionar não logados.

---

## 3. Estrutura de Arquivos Recomendada
```
/app
  /auth
    /callback
      route.ts -- Essencial para o fluxo de "Signing" do servidor
  /login
    page.tsx
  /register
    page.tsx
/utils
  /supabase
    client.ts
    server.ts
    middleware.ts
/supabase
  /migrations
    ..._init_schema.sql
```
