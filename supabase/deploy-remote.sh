#!/usr/bin/env bash
set -e
PROJECT_REF="${SUPABASE_PROJECT_ID:-gujyiuihodswdbttwnxd}"
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "Defina SUPABASE_ACCESS_TOKEN (crie em https://supabase.com/dashboard/account/tokens)"
  exit 1
fi
echo "Linking projeto remoto $PROJECT_REF..."
npx supabase link --project-ref "$PROJECT_REF"
echo "Aplicando migrações no banco remoto..."
npx supabase db push
echo "Concluído. Para rodar o seed (usuários de exemplo), execute supabase/seed.sql no SQL Editor do Dashboard."
npx supabase db execute --file ./seed.sql 2>/dev/null || echo "Seed: rode o conteúdo de supabase/seed.sql no SQL Editor do Dashboard."