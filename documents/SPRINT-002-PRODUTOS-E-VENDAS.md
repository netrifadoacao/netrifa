# SPRINT 002: Produtos e Vendas (Supabase Edge Functions)

**Objetivo Macro:** Implementar o catálogo de produtos no banco de dados e utilizar Edge Functions para orquestrar o pagamento seguro via Mercado Pago, sem expor credenciais no frontend.

**Período Estimado:** 1 Semana

---

## 1. Definição de Pronto (DoD)
- [ ] Tabela `products` e `orders` criadas com RLS.
- [ ] Bucket no Supabase Storage para imagens de produtos.
- [ ] Edge Function `create-checkout` implementada e integrada com SDK do Mercado Pago.
- [ ] Edge Function `mp-webhook` implementada para receber notificações de pagamento.
- [ ] Fluxo completo: Clique em Comprar -> Checkout MP -> Pagamento -> Status do Pedido atualizado no Banco.

---

## 2. Tarefas e Implementação Técnica

### US05 - Modelagem de Vendas e Storage
**Descrição:** Criar as tabelas necessárias para armazenar o catálogo e os pedidos.

**Passos Técnicos:**
1.  Nova Migration `product_order_schema`:
    ```sql
    create table public.products (
      id uuid default gen_random_uuid() primary key,
      name text not null,
      description text,
      price decimal(10,2) not null,
      image_url text,
      active boolean default true
    );

    create table public.orders (
      id uuid default gen_random_uuid() primary key,
      user_id uuid references public.profiles(id),
      product_id uuid references public.products(id),
      amount decimal(10,2) not null,
      status text default 'pending', -- pending, paid, cancelled
      mp_preference_id text,
      created_at timestamptz default now()
    );
    ```
2.  Configurar Storage:
    *   Criar bucket `product-images`.
    *   Policy: Public Read, Admin Write.

### US06 - Edge Function: Create Checkout
**Descrição:** Função server-side segura para comunicar com o Mercado Pago.

**Passos Técnicos:**
1.  Criar função: `supabase functions new create-checkout`.
2.  Lógica (TypeScript/Deno):
    *   Receber `productId` e `token` do usuário.
    *   Validar usuário com `supabase.auth.getUser()`.
    *   Buscar produto no banco.
    *   Chamar API do Mercado Pago criando a preferência.
    *   Inserir registro em `public.orders` com status 'pending'.
    *   Retornar `init_point` (URL de pagamento) para o frontend.
3.  Deploy: `supabase functions deploy create-checkout`.
4.  Configurar Secrets: `supabase secrets set MP_ACCESS_TOKEN=...`

### US07 - Edge Function: Webhook
**Descrição:** O Mercado Pago notifica esta função quando o pagamento ocorre.

**Passos Técnicos:**
1.  Criar função: `supabase functions new mp-webhook`.
2.  Lógica:
    *   Verificar assinatura/origem da requisição (segurança).
    *   Consultar status do pagamento na API do MP usando o ID recebido.
    *   Se status == 'approved':
        *   Atualizar `public.orders` para 'paid'.
        *   (Opcional) Trigger de banco vai disparar a distribuição de bônus (Sprint 3).

---

## 3. Segurança (RLS)
- **Products:** `SELECT` para todos (auth e anon). `INSERT/UPDATE` apenas para Admin.
- **Orders:** `SELECT` apenas para o dono (`auth.uid() = user_id`) ou Admin. `INSERT` apenas via Service Role (Edge Function) ou Admin.

---

## 4. Exemplo de Código (Edge Function Checkout)
```typescript
serve(async (req) => {
  const { productId } = await req.json()
  const supabase = createClient(...)
  
  // 1. Get Product
  const { data: product } = await supabase.from('products').select('*').eq('id', productId).single()
  
  // 2. Create MP Preference
  const preference = await mp.preferences.create({
    items: [{ title: product.name, unit_price: product.price, quantity: 1 }],
    external_reference: userId, // ou ID temporário
    notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`
  })

  // 3. Save Order
  const { data: order } = await supabase.from('orders').insert({ ... }).select().single()

  return new Response(JSON.stringify({ url: preference.body.init_point }))
})
```
