# Product Backlog - Sistema de Renda Recorrente Universal (Supabase Edition)

Este documento descreve as Histórias de Usuário e o planejamento de Sprints para o desenvolvimento do sistema utilizando **Supabase** como infraestrutura principal.

**Meta Geral:** Entregar um sistema funcional de vendas em rede (multinível) utilizando a robustez do PostgreSQL e a agilidade das Edge Functions do Supabase.

---

## Sprint 1: Fundação Supabase, Auth e Identidade
**Objetivo:** Configurar o projeto Supabase, tabelas base e autenticação.

### Histórias de Usuário
1.  **US01 - Infraestrutura Supabase**
    *   *Como* desenvolvedor, *quero* configurar o projeto Supabase com migrations e Auth, *para* ter um backend pronto.
    *   *DoD:* Projeto criado; CLI configurada; Tabela `public.profiles` criada e vinculada ao `auth.users` via Trigger.

2.  **US02 - Cadastro com Patrocinador (RLS)**
    *   *Como* novo usuário, *quero* me cadastrar informando quem me indicou, *para* entrar na rede correta.
    *   *DoD:* Campo `sponsor_id` na tabela `profiles`; Policies RLS garantindo segurança.

3.  **US03 - Login e Proteção de Rotas**
    *   *Como* usuário, *quero* logar e ser redirecionado para meu painel, *para* acessar minhas ferramentas.
    *   *DoD:* Integração `@supabase/auth-helpers-nextjs`; Middleware de proteção.

---

## Sprint 2: Produtos e Integração de Pagamento (Edge Functions)
**Objetivo:** Criar catálogo e processar vendas via Mercado Pago usando Serverless Functions.

### Histórias de Usuário
4.  **US04 - Gestão de Produtos (Admin)**
    *   *Como* admin, *quero* criar produtos no banco, *para* vendê-los.
    *   *DoD:* Tabela `products`; Storage para imagens; Policies RLS para Admin (CRUD) e Usuário (Read-only).

5.  **US05 - Checkout via Edge Function**
    *   *Como* usuário, *quero* gerar um link de pagamento seguro, *para* comprar um produto.
    *   *DoD:* Edge Function `create-checkout` que chama API do Mercado Pago e cria registro em `orders`.

6.  **US06 - Webhook de Pagamento**
    *   *Como* sistema, *quero* receber notificação do Mercado Pago, *para* confirmar a compra.
    *   *DoD:* Edge Function `mp-webhook` que valida assinatura e atualiza status do pedido para `PAID`.

---

## Sprint 3: Rede e Motor de Bônus (Database Triggers)
**Objetivo:** Implementar a lógica de multinível diretamente no banco de dados para performance e integridade.

### Histórias de Usuário
7.  **US07 - Árvore de Rede (Recursive Queries)**
    *   *Como* usuário, *quero* ver minha rede de indicados, *para* acompanhar o crescimento.
    *   *DoD:* View ou Função PostgreSQL recursiva para buscar descendentes até 5 níveis.

8.  **US08 - Distribuição Automática de Bônus**
    *   *Como* sistema, *quero* calcular comissões assim que um pagamento for confirmado, *para* remunerar a rede.
    *   *DoD:* Trigger PostgreSQL na tabela `orders` (quando status muda para PAID) -> Chama função `distribute_bonuses()`.

9.  **US09 - Configuração Dinâmica de Bônus**
    *   *Como* admin, *quero* alterar as porcentagens por nível, *para* ajustar a estratégia.
    *   *DoD:* Tabela `bonus_config` acessível apenas por Admin.

---

## Sprint 4: Gestão Financeira (RLS e Segurança)
**Objetivo:** Permitir saques seguros com validação no banco de dados.

### Histórias de Usuário
10. **US10 - Carteira e Extrato**
    *   *Como* usuário, *quero* ver meu saldo e histórico, *para* controle financeiro.
    *   *DoD:* Tabela `transactions`; RLS permitindo usuário ver apenas suas transações; Coluna `wallet_balance` em `profiles`.

11. **US11 - Solicitação de Saque (Atomicidade)**
    *   *Como* usuário, *quero* pedir saque, *para* receber meu dinheiro.
    *   *DoD:* Função de Banco `request_withdrawal()` que verifica saldo e debita atomicamente numa transação.

12. **US12 - Aprovação de Saque**
    *   *Como* admin, *quero* listar e aprovar saques, *para* pagar os usuários.
    *   *DoD:* Painel Admin consumindo tabela `withdrawals`.

---

## Sprint 5: Dashboard e Otimização
**Objetivo:** Monitoramento em tempo real e performance.

### Histórias de Usuário
13. **US13 - Dashboard Realtime**
    *   *Como* admin, *quero* ver vendas acontecendo agora, *para* sentir o pulso do negócio.
    *   *DoD:* Supabase Realtime habilitado na tabela `orders`.

14. **US14 - Otimização de Índices**
    *   *Como* sistema, *quero* responder rápido mesmo com milhões de usuários, *para* não travar.
    *   *DoD:* Índices em `sponsor_id`, `user_id`, `status`.

---
*Documento atualizado para arquitetura Supabase em 2025-01-25.*
