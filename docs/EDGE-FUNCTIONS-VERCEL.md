# Backend: Supabase Edge Functions na Vercel

## O que funciona hoje

- **Auth** (`/auth/v1/token`) e **REST** (`/rest/v1/profiles`) são serviços nativos do Supabase. CORS e roteamento são tratados pela própria Supabase. Por isso login e perfil funcionam.

## O que precisa estar deployado

- **Edge Functions** (`/functions/v1/*`) são o *seu* código (Deno) no Supabase. Elas **precisam ser publicadas** no projeto e **devem devolver CORS** em todas as respostas (incluindo OPTIONS e erros).

## Checklist para as outras rotas funcionarem

1. **Deploy das Edge Functions no Supabase**
   - No projeto: `npx supabase link --project-ref SEU_PROJECT_REF`
   - Depois: `npx supabase functions deploy` (ou deploy de cada uma: `products`, `admin-dashboard`, `network`, `profile`, `orders`, `withdrawals`, `bonus`, `bonus-config`, `create-checkout`)

2. **Config no Supabase**
   - No repositório, `supabase/config.toml` está com `verify_jwt = false` para as funções chamadas pelo browser. Assim o preflight OPTIONS chega na função e o CORS é retornado.
   - Após alterar `config.toml`, é preciso fazer **deploy de novo** para o projeto remoto usar essa config.

3. **CORS nas funções**
   - O código em `supabase/functions/_shared/cors.ts` já envia os headers necessários.
   - Todas as respostas (sucesso e erro) devem incluir `corsHeaders`.
   - O tratamento de OPTIONS deve ser a primeira coisa no handler de cada função.

## Next.js / Vercel

- As rotas de admin e escritório usam `export const dynamic = 'force-dynamic'`, então a Vercel não as trata como estáticas.
- Os dados são carregados no **client** (React) via `fetch` para `https://SEU_PROJECT.supabase.co/functions/v1/...`. Não é server-side; não depende de build ou Server Components para essas chamadas.

## Se a página fica em loading

- No DevTools → Network, verifique se aparece a requisição para `https://...supabase.co/functions/v1/network` (ou a função da página).
  - **Não aparece:** o efeito da página pode não estar rodando (auth/rota) ou o `getSession()` pode estar travando.
  - **Aparece e falha (CORS / vermelho):** conferir deploy e CORS (incluindo OPTIONS e `verify_jwt = false`).
  - **Aparece e fica pendente:** a função pode estar demorando ou não respondendo; há timeout de 20s no cliente e mensagem de erro correspondente.
