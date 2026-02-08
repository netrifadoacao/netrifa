# Usuários de exemplo (seed)

Após rodar o seed (`supabase db reset` ou executar `seed.sql` no SQL Editor), use estes logins.

**Senha de todos:** `Senha123!`

| Tipo   | Email                     | Nome             | Observação              |
|--------|---------------------------|------------------|--------------------------|
| Admin  | admin@projetodoacao.com   | Admin AS Miranda | Acesso ao painel admin   |
| Membro | membro1@projetodoacao.com | Maria Silva      | Indicada pelo admin      |
| Membro | membro2@projetodoacao.com | João Santos      | Indicado pelo admin      |
| Membro | membro3@projetodoacao.com | Ana Costa        | Indicada pela Maria (2º nível) |

Rede de exemplo: Admin → Maria, João; Maria → Ana.

**Como aplicar o seed:**

- **Local:** `supabase db reset` (aplica migrações + seed).
- **Projeto remoto:** no Dashboard do Supabase, abra o SQL Editor e execute o conteúdo de `supabase/seed.sql`. Só faça isso se o projeto ainda não tiver usuários; o script não verifica duplicados.

**Criar só um admin em projeto já em uso:** no SQL Editor, execute apenas o bloco do seed para um usuário (admin), ajustando e-mail e senha, e em seguida:  
`update public.profiles set role = 'admin' where id = '<uuid_do_usuario>';`
