# Sistema RifaNetDoAção

## Blueprint Técnico –  Funcionalidade de Rede

## 1. Objetivo

Este documento define, de forma inequívoca, a arquitetura funcional, lógica de negócio, modelo de dados e regras operacionais da **rede multinível** do Sistema de Renda Recorrente Universal, garantindo robustez, escalabilidade e transparência para redes com até **5 níveis ativos**, servindo como guia direto para desenvolvimento por humanos ou agentes de I.A.

O foco é transformar a funcionalidade atual de “Rede” em um **motor de relacionamento econômico em cadeia**, comparável a sistemas maduros de renda coletiva e marketing de rede.

---

## 2. Conceitos Fundamentais

### 2.1 Entidades-Chave

- **Usuário**: qualquer pessoa cadastrada (comprador, vendedor, afiliado)
- **Patrocinador (Upline)**: usuário que indicou diretamente outro usuário
- **Indicado (Downline)**: usuário indicado direta ou indiretamente
- **Nível**: distância hierárquica entre dois usuários na rede
- **Evento Econômico**: ação que gera cálculo financeiro (venda, recompra, assinatura)

### 2.2 Regras Estruturais da Rede

- Cada usuário possui **1 patrocinador direto** (exceto raiz/global)
- Um usuário pode ter **N indicados diretos** (ilimitado)
- Profundidade máxima considerada para ganhos: **5 níveis**
- A rede é **estritamente hierárquica (árvore)**, não grafo
- Não é permitido ciclo (loop de indicação)

---

## 3. Modelo de Dados (Obrigatório)

### 3.1 Tabela: users

Campos relevantes:

- id (UUID)
- name
- email
- sponsor\_id (UUID | nullable)
- network\_path (ltree ou string hierárquica)
- level\_depth (int)
- created\_at

> network\_path exemplo: `root.userA.userB.userC`

### 3.2 Tabela: network\_relations (opcional, mas recomendado para escala)

- id
- ancestor\_id
- descendant\_id
- level (1 a 5)

Usada para consultas rápidas de rede e relatórios massivos.

### 3.3 Tabela: bonus\_config

- id
- direct\_bonus\_percent
- level\_1\_percent
- level\_2\_percent
- level\_3\_percent
- level\_4\_percent
- level\_5\_percent
- active\_from

### 3.4 Tabela: bonus\_ledger

- id
- user\_id (quem recebe)
- source\_user\_id (quem gerou)
- event\_id (venda/pagamento)
- level
- bonus\_type (direct | network)
- amount
- status (pending | available | paid)
- created\_at

---

## 4. Fluxo de Construção da Rede

### 4.1 Cadastro via Link de Indicação

1. Usuário acessa link contendo sponsor\_id
2. Sistema valida sponsor\_id
3. Cria usuário com:
   - sponsor\_id definido
   - network\_path herdado + próprio id
   - level\_depth = sponsor.level\_depth + 1

### 4.2 Indexação Automática da Rede

Após cadastro:

- Gerar relações até 5 níveis acima
- Persistir network\_relations (ancestor → descendant)

Regra:

- Se ultrapassar 5 níveis, apenas armazena estruturalmente, mas ignora financeiramente

---

## 5. Motor de Cálculo de Bônus (Coração do Sistema)

### 5.1 Evento Disparador

Qualquer evento que gere receita:

- Compra de produto
- Recompra
- Assinatura

Dispara:
`process_network_bonus(event_id, buyer_id, amount)`

### 5.2 Algoritmo Base

Pseudo-fluxo:

1. Identificar patrocinador direto
2. Aplicar bônus direto
3. Subir hierarquia até 5 níveis
4. Para cada nível:
   - Buscar percentual configurado
   - Calcular valor proporcional
   - Registrar no bonus\_ledger

### 5.3 Princípios do Cálculo

- Percentuais **não somam 100% necessariamente**
- Bônus é sempre derivado do valor base do produto
- Configuração vigente no momento do evento é congelada

---

## 6. Visualização da Rede (Escritório Virtual)

### 6.1 Requisitos Funcionais

- Visualização gráfica em árvore
- Foco no usuário logado como raiz
- Expansão progressiva até nível 5
- Indicadores por nó:
  - Nome
  - Nível
  - Total ganho gerado
  - Status (ativo/inativo)

### 6.2 Performance

- Lazy loading por nível
- Cache por usuário
- Limite de nós simultâneos renderizados

---

## 7. Transparência Financeira

### 7.1 Extrato Detalhado

Cada bônus deve exibir:

- Quem gerou
- Em qual nível
- Qual evento
- Percentual aplicado
- Valor bruto

### 7.2 Auditoria

Administrador pode:

- Reprocessar evento
- Auditar cadeia completa de um pagamento
- Simular cenários de bônus

---

## 8. Segurança e Anti-Abuso

- Validação contra autoindicação
- Bloqueio de alteração manual de sponsor
- Logs imutáveis de eventos financeiros
- Rate limit em geração de rede

---

## 9. Escalabilidade

- Suporte a milhares de usuários
- Consultas O(log n) via path ou tabela auxiliar
- Processamento assíncrono de bônus (fila)

