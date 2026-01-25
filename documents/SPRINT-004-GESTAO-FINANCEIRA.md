# SPRINT 004: Gestão Financeira (RLS e Segurança)

**Objetivo Macro:** Implementar o fluxo de saída de dinheiro (Saques) com segurança máxima, garantindo que o usuário só possa sacar o que realmente tem e que o Admin tenha ferramentas para auditar e pagar.

**Período Estimado:** 1 Semana

---

## 1. Definição de Pronto (DoD)
- [ ] Tabela `withdrawals` criada.
- [ ] Função de banco `request_withdrawal` (RPC) criada para garantir atomicidade (verifica saldo e debita na hora).
- [ ] RLS Policies configuradas para Saques.
- [ ] Painel Admin para Aprovar/Recusar saques.

---

## 2. Tarefas e Implementação Técnica

### US11 - Solicitação de Saque Segura (RPC)
**Descrição:** Não podemos confiar no frontend para verificar saldo. A solicitação deve ser uma "transação bancária".

**Passos Técnicos:**
1.  Migration `withdrawals_schema`:
    ```sql
    create table public.withdrawals (
      id uuid default gen_random_uuid() primary key,
      user_id uuid references public.profiles(id),
      amount decimal(10,2) not null,
      pix_key text not null,
      status text default 'pending', -- pending, paid, rejected
      created_at timestamptz default now()
    );
    ```
2.  Criar Função PostgreSQL `request_withdrawal(amount, pix_key)`:
    *   Verificar se `auth.uid()` tem `wallet_balance >= amount`.
    *   Se não tiver, levantar exceção (`raise exception 'Saldo insuficiente'`).
    *   Se tiver:
        *   `UPDATE profiles SET wallet_balance = wallet_balance - amount WHERE id = auth.uid()`.
        *   `INSERT INTO withdrawals ...`.
        *   `INSERT INTO transactions (type: 'withdrawal')` para manter histórico.
    *   Tudo isso dentro de um bloco `BEGIN ... END` (Transaction).

### US12 - Gestão Administrativa
**Descrição:** Admin revisa e paga.

**Passos Técnicos:**
1.  Frontend Admin: Listar `withdrawals` onde `status = 'pending'`.
2.  Função Admin `process_withdrawal(withdrawal_id, new_status)`:
    *   Se `new_status = 'paid'`: Apenas atualizar status (Admin já fez o pix no banco real).
    *   Se `new_status = 'rejected'`:
        *   Atualizar status para `rejected`.
        *   **Estornar valor:** `UPDATE profiles SET wallet_balance = wallet_balance + amount`.
        *   Inserir transação de estorno.

---

## 3. Segurança (RLS)
- **Withdrawals:**
    *   `SELECT`: Usuário vê os seus. Admin vê todos.
    *   `INSERT`: Ninguém (uso exclusivo via Função RPC `request_withdrawal` para garantir validação de saldo).
    *   `UPDATE`: Apenas Admin.

---

## 4. Exemplo de Chamada Frontend
```typescript
const { data, error } = await supabase
  .rpc('request_withdrawal', { 
    amount_req: 100.00, 
    pix_key_req: 'meupix@email.com' 
  })
```
