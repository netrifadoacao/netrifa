# Configuração de Variáveis de Ambiente

## Frontend (.env.local)

Crie um arquivo `.env.local` na raiz da pasta `frontend` com as seguintes variáveis:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mercado Pago
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=your_mercado_pago_public_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RifaNet
```

## Como Obter as Credenciais

### Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Vá em Settings > API
5. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Mercado Pago
1. Acesse [developers.mercadopago.com](https://developers.mercadopago.com)
2. Crie uma conta de desenvolvedor
3. Crie uma aplicação
4. Copie a **Public Key** (para desenvolvimento, use a chave de teste)
5. Cole em `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`

## Notas Importantes

- ⚠️ Nunca commite o arquivo `.env.local` no Git
- 📝 O arquivo `.env.local` já está no `.gitignore`
- 🔑 As variáveis com `NEXT_PUBLIC_` são expostas no browser
- 🔒 Variáveis sem `NEXT_PUBLIC_` são server-side only

