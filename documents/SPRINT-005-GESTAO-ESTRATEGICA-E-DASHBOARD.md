# SPRINT 005: Dashboard e Otimização (Realtime)

**Objetivo Macro:** Utilizar os recursos de Realtime do Supabase para criar um dashboard vivo e otimizar as consultas para suportar o crescimento da rede.

**Período Estimado:** 1 Semana

---

## 1. Definição de Pronto (DoD)
- [ ] Dashboard Admin consumindo Views otimizadas.
- [ ] Realtime ativado para notificações de vendas.
- [ ] Índices criados nas colunas chave.
- [ ] Testes de carga em Views e Functions.

---

## 2. Tarefas e Implementação Técnica

### US13 - Dashboard em Tempo Real
**Descrição:** O admin deve ver as vendas "pipocando" na tela.

**Passos Técnicos:**
1.  Habilitar Realtime na tabela `orders`:
    *   No painel Supabase ou via SQL: `alter publication supabase_realtime add table public.orders;`
2.  Frontend: Usar `supabase.channel` para escutar `INSERT` na tabela `orders`.
3.  Criar **Database Views** para métricas pesadas (evitar calcular no frontend):
    ```sql
    create view admin_stats as
    select 
      (select count(*) from profiles) as total_users,
      (select sum(amount) from orders where status = 'paid') as total_revenue,
      (select count(*) from orders where status = 'pending') as pending_orders;
    ```

### US14 - Performance e Índices
**Descrição:** Garantir que queries de rede não fiquem lentas.

**Passos Técnicos:**
1.  Criar Índices:
    *   `create index idx_profiles_sponsor on public.profiles(sponsor_id);` (Essencial para árvore).
    *   `create index idx_orders_user on public.orders(user_id);`
    *   `create index idx_transactions_user on public.transactions(user_id);`
2.  Analisar query plans com `EXPLAIN ANALYZE` se houver lentidão na função recursiva de rede.

### US15 - Auditoria e Logs
**Descrição:** Rastrear ações críticas do Admin.

**Passos Técnicos:**
1.  Criar tabela `audit_logs` (who, what, when).
2.  Adicionar inserts nessa tabela nas funções críticas (ex: aprovar saque, mudar config de bônus).

---

## 3. Entrega Final
- Dump do Schema (`supabase db dump`).
- Documentação de API das Edge Functions.
- Manual do Admin atualizado.
