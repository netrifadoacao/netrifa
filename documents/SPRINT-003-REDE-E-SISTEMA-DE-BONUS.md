# SPRINT 003: Rede e Sistema de Bônus (Database Logic)

**Objetivo Macro:** Implementar a lógica "core" do negócio (multinível) inteiramente dentro do banco de dados PostgreSQL usando Functions e Triggers. Isso garante que nenhuma transação financeira seja perdida por falha de aplicação.

**Período Estimado:** 1 Semana

---

## 1. Definição de Pronto (DoD)
- [ ] Tabela `bonus_config` criada com valores padrão.
- [ ] Tabela `transactions` criada para log financeiro.
- [ ] Função Recursiva PostgreSQL para identificar a linha ascendente (upline) implementada.
- [ ] Função `distribute_bonuses` implementada e testada.
- [ ] Trigger na tabela `orders` configurado para disparar a distribuição ao pagar.
- [ ] View `network_tree` criada para facilitar a visualização da rede no frontend.

---

## 2. Tarefas e Implementação Técnica

### US08 - Tabelas Financeiras e Configuração
**Descrição:** Estrutura para suportar o plano de compensação.

**Passos Técnicos:**
1.  Migration `financial_schema`:
    ```sql
    create table public.bonus_config (
      level int primary key, -- 1 a 5
      percentage decimal(5,2) not null -- ex: 10.0
    );

    create table public.transactions (
      id uuid default gen_random_uuid() primary key,
      user_id uuid references public.profiles(id), -- Quem recebe
      amount decimal(10,2) not null,
      type text check (type in ('bonus', 'withdrawal', 'purchase')),
      description text,
      origin_order_id uuid references public.orders(id),
      created_at timestamptz default now()
    );

    -- Adicionar campo de saldo no perfil
    alter table public.profiles add column wallet_balance decimal(10,2) default 0.00;
    ```

### US09 - Lógica de Distribuição (PL/pgSQL)
**Descrição:** A mágica acontece aqui. Quando um pedido é pago, o banco deve automaticamente encontrar os pais e pagar.

**Passos Técnicos:**
1.  Criar Função `distribute_bonuses(order_id uuid)`:
    *   Pegar o pedido e o usuário comprador.
    *   Loop de 1 a 5 (Níveis):
        *   Encontrar o patrocinador do nível atual.
        *   Se existir, calcular valor (Preço Pedido * % do Nível).
        *   Inserir em `transactions`.
        *   Update `profiles` set `wallet_balance = wallet_balance + valor`.
        *   Subir para o próximo patrocinador (`current_sponsor = sponsor.sponsor_id`).

2.  Criar Trigger:
    ```sql
    create or replace function on_order_paid() returns trigger as $$
    begin
      if new.status = 'paid' and old.status != 'paid' then
        perform public.distribute_bonuses(new.id);
      end if;
      return new;
    end;
    $$ language plpgsql security definer;

    create trigger trigger_distribute_bonuses
    after update on public.orders
    for each row execute procedure on_order_paid();
    ```

### US10 - Visualização de Rede
**Descrição:** Permitir que o frontend desenhe a árvore de forma eficiente.

**Passos Técnicos:**
1.  Criar uma View ou Função que retorne JSON hierárquico ou lista com profundidade.
2.  Exemplo de Query Recursiva:
    ```sql
    with recursive network as (
      select id, full_name, sponsor_id, 1 as depth
      from profiles where sponsor_id = auth.uid()
      union all
      select p.id, p.full_name, p.sponsor_id, n.depth + 1
      from profiles p
      inner join network n on p.sponsor_id = n.id
      where n.depth < 5
    )
    select * from network;
    ```
3.  Expor isso via View protegida por RLS ou Função RPC (`supabase.rpc('get_network')`).

---

## 3. Segurança
- **Transactions:** Usuário só vê as suas (`user_id = auth.uid()`). Ninguém pode inserir/editar manualmente (apenas o Sistema via Trigger).
- **Bonus Config:** Apenas Admin vê e edita.

