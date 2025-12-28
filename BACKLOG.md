# BACKLOG DO SISTEMA DE RIFAS DIGITAL
**Versão:** 1.0  
**Tipo:** Sistema Web com Escritório Virtual e Painel Administrativo  
**Integração:** Mercado Pago

---

## 📋 DEFINIÇÃO DE PRONTO (DEFINITION OF DONE)

Para que uma história de usuário seja considerada pronta, ela deve atender aos seguintes critérios:

### Critérios Técnicos
- [ ] Código implementado e revisado
- [ ] Código versionado no repositório Git
- [ ] Testes unitários implementados (cobertura mínima de 70%)
- [ ] Testes de integração implementados (quando aplicável)
- [ ] Documentação técnica atualizada
- [ ] Código segue os padrões de codificação do projeto
- [ ] Sem vulnerabilidades de segurança identificadas
- [ ] Responsivo para mobile, tablet e desktop

### Critérios Funcionais
- [ ] Funcionalidade implementada conforme critérios de aceite
- [ ] Testado manualmente em ambiente de desenvolvimento
- [ ] Validações de formulário implementadas
- [ ] Mensagens de erro e sucesso apropriadas
- [ ] Navegação intuitiva e acessível

### Critérios de Qualidade
- [ ] Performance adequada (tempo de resposta < 3s)
- [ ] Sem erros no console do navegador
- [ ] Sem warnings críticos
- [ ] Logs implementados para operações críticas
- [ ] Tratamento de erros adequado

### Critérios de Entrega
- [ ] Testado em ambiente de homologação
- [ ] Aprovado pelo Product Owner
- [ ] Manual de usuário atualizado (quando aplicável)
- [ ] Deploy em produção realizado com sucesso

---

## 🎯 ÉPICOS E HISTÓRIAS DE USUÁRIO

---

## ÉPICO 1: INFRAESTRUTURA E AUTENTICAÇÃO

### **US-001: Configurar Estrutura do Projeto**
**Como:** Desenvolvedor  
**Quero:** Configurar a estrutura base do projeto  
**Para:** Ter um ambiente de desenvolvimento organizado e escalável

**Prioridade:** Crítica  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [x] Estrutura de monorepo organizada (frontend/backend)
- [x] Frontend configurado com Next.js 16+ e Tailwind CSS v4
- [ ] Projeto Supabase criado e configurado
- [ ] Tabelas do banco de dados criadas (schema SQL)
- [x] Variáveis de ambiente configuradas (.env.local)
- [x] README.md com instruções de instalação
- [x] .gitignore configurado adequadamente
- [x] Landing page inicial criada

**Definição de Pronto Específica:**
- [x] Projeto Next.js inicia sem erros
- [ ] Conexão com Supabase funcional
- [x] Documentação de setup completa
- [x] Landing page responsiva e moderna funcionando

---

### **US-002: Sistema de Autenticação de Usuários**
**Como:** Usuário/Administrador  
**Quero:** Fazer login e logout no sistema  
**Para:** Acessar minha área privada de forma segura

**Prioridade:** Crítica  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Página de login com campos de e-mail e senha
- [ ] Validação de credenciais
- [ ] Geração e validação de JWT token
- [ ] Middleware de autenticação implementado
- [ ] Função de logout
- [ ] Recuperação de senha via e-mail
- [ ] Senha criptografada com bcrypt
- [ ] Sessão expira após inatividade (30 minutos)

**Definição de Pronto Específica:**
- [ ] Testes de autenticação bem-sucedida e falha
- [ ] Proteção contra ataques de força bruta
- [ ] Logs de tentativas de login

---

### **US-003: Sistema de Cadastro com Link de Indicação**
**Como:** Visitante  
**Quero:** Me cadastrar através de um link de indicação  
**Para:** Criar minha conta e começar a participar do sistema

**Prioridade:** Crítica  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Página de cadastro com campos: Nome, E-mail, Telefone, Senha, Confirmar Senha
- [ ] Captura do ID do indicador via parâmetro na URL (ex: /cadastro?ref=ABC123)
- [ ] Validação de dados obrigatórios
- [ ] Validação de formato de e-mail
- [ ] Validação de força de senha (mínimo 8 caracteres, 1 maiúscula, 1 número)
- [ ] Verificação de e-mail único (não duplicado)
- [ ] Geração automática de link único de indicação para o novo usuário
- [ ] Criação automática do Escritório Virtual após cadastro
- [ ] Vinculação do novo usuário ao indicador na estrutura de rede
- [ ] E-mail de confirmação de cadastro

**Definição de Pronto Específica:**
- [ ] Usuário consegue se cadastrar e fazer login imediatamente
- [ ] Link de indicação é gerado automaticamente
- [ ] Relação de indicação é registrada no banco de dados
- [ ] Testes de cadastro com e sem indicação

---

### **US-004: Controle de Acesso por Perfil (Usuário/Admin)**
**Como:** Sistema  
**Quero:** Diferenciar usuários comuns de administradores  
**Para:** Controlar o acesso a áreas específicas

**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Critérios de Aceite:**
- [ ] Campo "role" no banco de dados (user/admin)
- [ ] Middleware de verificação de permissão
- [ ] Redirecionamento automático após login baseado no perfil
- [ ] Usuários comuns não conseguem acessar área administrativa
- [ ] Administradores podem acessar ambas as áreas

**Definição de Pronto Específica:**
- [ ] Testes de acesso negado para usuários sem permissão
- [ ] Rotas protegidas por middleware

---

## ÉPICO 2: INTEGRAÇÃO COM MERCADO PAGO

### **US-005: Integração com API do Mercado Pago**
**Como:** Desenvolvedor  
**Quero:** Integrar o sistema com a API do Mercado Pago  
**Para:** Processar pagamentos de forma automatizada

**Prioridade:** Crítica  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Configuração das credenciais do Mercado Pago (Access Token)
- [ ] Implementação do SDK do Mercado Pago
- [ ] Criação de preferência de pagamento
- [ ] Geração de link de pagamento
- [ ] Webhook para receber notificações de pagamento
- [ ] Tratamento de status de pagamento (aprovado, pendente, recusado, cancelado)
- [ ] Logs de todas as transações

**Definição de Pronto Específica:**
- [ ] Testes em ambiente sandbox do Mercado Pago
- [ ] Pagamento de teste aprovado corretamente
- [ ] Webhook recebe e processa notificações
- [ ] Documentação de configuração do Mercado Pago

---

### **US-006: Confirmação Automática de Pagamento**
**Como:** Sistema  
**Quero:** Confirmar automaticamente pagamentos aprovados  
**Para:** Liberar rifas imediatamente após pagamento

**Prioridade:** Crítica  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Sistema recebe webhook do Mercado Pago
- [ ] Valida autenticidade da notificação
- [ ] Atualiza status da compra no banco de dados
- [ ] Libera rifas automaticamente quando pagamento aprovado
- [ ] Envia e-mail de confirmação ao usuário
- [ ] Registra transação no extrato do usuário
- [ ] Calcula e distribui bônus na rede

**Definição de Pronto Específica:**
- [ ] Teste de fluxo completo de pagamento
- [ ] Rifas liberadas em menos de 5 segundos após confirmação
- [ ] Notificação enviada ao usuário

---

## ÉPICO 3: ESCRITÓRIO VIRTUAL - PÁGINA HOME

### **US-007: Layout e Navegação do Escritório Virtual**
**Como:** Usuário  
**Quero:** Ter acesso a um menu de navegação no meu escritório virtual  
**Para:** Navegar facilmente entre as funcionalidades

**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Critérios de Aceite:**
- [ ] Menu lateral ou superior com itens: Home, Dados, Rede, Solicitar Saque, Extrato
- [ ] Menu responsivo (mobile-friendly)
- [ ] Indicação visual da página atual
- [ ] Logo e nome do usuário logado
- [ ] Botão de logout
- [ ] Design moderno e intuitivo

**Definição de Pronto Específica:**
- [ ] Navegação funcional em todos os dispositivos
- [ ] Transições suaves entre páginas
- [ ] Acessibilidade adequada (ARIA labels)

---

### **US-008: Listagem de Rifas Ativas na Home**
**Como:** Usuário  
**Quero:** Ver todas as rifas ativas disponíveis para compra  
**Para:** Escolher quais rifas quero adquirir

**Prioridade:** Crítica  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Exibição em formato de cards/cartões
- [ ] Cada card mostra: Nome da rifa, Valor por cartela, Quantidade disponível, Imagem (opcional)
- [ ] Apenas rifas ativas são exibidas
- [ ] Layout responsivo (grid adaptável)
- [ ] Botão "Ver Detalhes" em cada card
- [ ] Botão "Comprar" em cada card
- [ ] Indicação visual quando rifa está esgotada

**Definição de Pronto Específica:**
- [ ] Cards carregam em menos de 2 segundos
- [ ] Imagens otimizadas
- [ ] Mensagem exibida quando não há rifas ativas

---

### **US-009: Visualizar Detalhes da Rifa**
**Como:** Usuário  
**Quero:** Ver os detalhes completos de uma rifa  
**Para:** Entender melhor antes de comprar

**Prioridade:** Média  
**Estimativa:** 5 pontos

**Critérios de Aceite:**
- [ ] Modal ou página com detalhes completos da rifa
- [ ] Exibição de: Nome, Descrição, Valor, Total de cartelas, Cartelas disponíveis, Imagem maior
- [ ] Data do sorteio (se aplicável)
- [ ] Prêmio da rifa
- [ ] Botão para comprar
- [ ] Botão para fechar/voltar

**Definição de Pronto Específica:**
- [ ] Modal abre suavemente
- [ ] Informações claras e bem formatadas
- [ ] Responsivo

---

### **US-010: Comprar Bilhetes de Rifa**
**Como:** Usuário  
**Quero:** Comprar um ou mais bilhetes de uma rifa  
**Para:** Participar do sorteio

**Prioridade:** Crítica  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Seleção da quantidade de bilhetes desejada
- [ ] Cálculo automático do valor total
- [ ] Botão "Comprar Agora"
- [ ] Validação de estoque disponível
- [ ] Geração de pedido no banco de dados (status: pendente)
- [ ] Redirecionamento para página de pagamento do Mercado Pago
- [ ] Reserva temporária dos bilhetes (15 minutos)
- [ ] Após pagamento aprovado: atribuição definitiva dos bilhetes ao usuário

**Definição de Pronto Específica:**
- [ ] Fluxo completo de compra funcional
- [ ] Não permite comprar mais do que o disponível
- [ ] Bilhetes reservados temporariamente não aparecem como disponíveis
- [ ] Teste de compra bem-sucedida e cancelada

---

## ÉPICO 4: ESCRITÓRIO VIRTUAL - DADOS DO USUÁRIO

### **US-011: Visualizar Dados Cadastrais**
**Como:** Usuário  
**Quero:** Ver meus dados cadastrais  
**Para:** Confirmar que estão corretos

**Prioridade:** Média  
**Estimativa:** 3 pontos

**Critérios de Aceite:**
- [ ] Página exibe: Nome, E-mail, Telefone, Chave PIX
- [ ] Data de cadastro
- [ ] Link de indicação pessoal (com botão copiar)
- [ ] Informações apresentadas de forma clara

**Definição de Pronto Específica:**
- [ ] Dados carregam corretamente
- [ ] Botão copiar link funcional

---

### **US-012: Editar Dados Cadastrais**
**Como:** Usuário  
**Quero:** Editar meus dados permitidos  
**Para:** Manter minhas informações atualizadas

**Prioridade:** Média  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Formulário de edição com campos: Nome, E-mail, Telefone
- [ ] Validação de formato de e-mail
- [ ] Validação de formato de telefone
- [ ] Botão "Salvar Alterações"
- [ ] Confirmação visual de salvamento
- [ ] E-mail não pode ser alterado para um já existente no sistema
- [ ] Alguns dados são somente leitura (data de cadastro, ID)

**Definição de Pronto Específica:**
- [ ] Alterações persistem no banco de dados
- [ ] Feedback visual de sucesso/erro
- [ ] Validações impedem dados inválidos

---

### **US-013: Cadastrar/Editar Chave PIX para Saque**
**Como:** Usuário  
**Quero:** Cadastrar minha chave PIX  
**Para:** Receber meus ganhos

**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Critérios de Aceite:**
- [ ] Campo para inserir chave PIX
- [ ] Validação de formato (CPF, CNPJ, e-mail, telefone, chave aleatória)
- [ ] Confirmação de salvamento
- [ ] Chave PIX obrigatória para solicitar saque

**Definição de Pronto Específica:**
- [ ] Validação de formato de chave PIX
- [ ] Impossibilidade de solicitar saque sem chave PIX cadastrada
- [ ] Teste de diferentes tipos de chave

---

## ÉPICO 5: ESCRITÓRIO VIRTUAL - ESTRUTURA DE REDE

### **US-014: Visualização Gráfica da Rede de Indicações**
**Como:** Usuário  
**Quero:** Ver a estrutura da minha rede de indicações  
**Para:** Acompanhar o crescimento da minha equipe

**Prioridade:** Alta  
**Estimativa:** 21 pontos

**Critérios de Aceite:**
- [ ] Visualização hierárquica em formato de árvore ou organograma
- [ ] Exibição até o 5º nível de profundidade
- [ ] Cada nó mostra: Nome do usuário, Nível (direto, 2º, 3º, 4º, 5º)
- [ ] Indicação visual diferenciando indicados diretos dos indiretos
- [ ] Possibilidade de expandir/recolher níveis
- [ ] Contador de pessoas por nível
- [ ] Responsivo (em mobile pode ser em lista)

**Definição de Pronto Específica:**
- [ ] Gráfico carrega em menos de 3 segundos (até 100 usuários)
- [ ] Performance adequada com estruturas grandes (lazy loading)
- [ ] Visual atraente e profissional
- [ ] Testes com estruturas de rede variadas

---

### **US-015: Listagem Detalhada da Rede**
**Como:** Usuário  
**Quero:** Ver uma lista detalhada dos meus indicados  
**Para:** Ter informações completas sobre minha rede

**Prioridade:** Média  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Tabela com colunas: Nome, Data de cadastro, Nível, Status (ativo/inativo)
- [ ] Filtro por nível (direto, 2º, 3º, 4º, 5º)
- [ ] Ordenação por nome, data, nível
- [ ] Busca por nome
- [ ] Paginação (20 por página)
- [ ] Total de indicados por nível

**Definição de Pronto Específica:**
- [ ] Filtros funcionam corretamente
- [ ] Paginação funcional
- [ ] Performance adequada com muitos registros

---

## ÉPICO 6: ESCRITÓRIO VIRTUAL - SISTEMA DE SAQUES

### **US-016: Visualizar Saldo Disponível para Saque**
**Como:** Usuário  
**Quero:** Ver meu saldo disponível  
**Para:** Saber quanto posso sacar

**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Critérios de Aceite:**
- [ ] Exibição destacada do saldo disponível
- [ ] Formatação em moeda (R$ X.XXX,XX)
- [ ] Saldo atualizado em tempo real
- [ ] Separação visual: Saldo disponível, Saldo pendente (em análise), Total de ganhos

**Definição de Pronto Específica:**
- [ ] Cálculo correto do saldo
- [ ] Valores sempre atualizados

---

### **US-017: Solicitar Saque de Ganhos**
**Como:** Usuário  
**Quero:** Solicitar o saque dos meus ganhos  
**Para:** Receber o dinheiro que ganhei

**Prioridade:** Alta  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Formulário com campo "Valor a sacar"
- [ ] Validação de valor mínimo (ex: R$ 50,00)
- [ ] Validação de saldo suficiente
- [ ] Exibição da chave PIX cadastrada
- [ ] Confirmação antes de enviar solicitação
- [ ] Criação de registro de saque com status "Pendente"
- [ ] Subtração do valor do saldo disponível
- [ ] Notificação visual de sucesso
- [ ] Impossibilidade de solicitar novo saque se há um pendente

**Definição de Pronto Específica:**
- [ ] Validação de valor mínimo funcional
- [ ] Impossível sacar sem chave PIX
- [ ] Saldo atualizado após solicitação
- [ ] Teste de solicitação bem-sucedida

---

### **US-018: Acompanhar Status dos Saques**
**Como:** Usuário  
**Quero:** Ver o histórico e status dos meus saques  
**Para:** Acompanhar minhas solicitações

**Prioridade:** Média  
**Estimativa:** 5 pontos

**Critérios de Aceite:**
- [ ] Tabela com: Data, Valor, Status (Pendente/Aprovado/Pago/Recusado)
- [ ] Código de rastreamento (se aplicável)
- [ ] Data de processamento
- [ ] Ordenação por data (mais recente primeiro)
- [ ] Indicação visual por cor conforme status

**Definição de Pronto Específica:**
- [ ] Histórico carrega corretamente
- [ ] Status reflete a realidade do banco de dados
- [ ] Visual claro e intuitivo

---

## ÉPICO 7: ESCRITÓRIO VIRTUAL - EXTRATO FINANCEIRO

### **US-019: Visualizar Extrato de Ganhos**
**Como:** Usuário  
**Quero:** Ver o histórico detalhado dos meus ganhos  
**Para:** Ter transparência sobre minha remuneração

**Prioridade:** Alta  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Listagem de todos os bônus recebidos
- [ ] Informações exibidas: Data, Valor, Tipo de bônus (Direto/Nível 2/Nível 3/Nível 4/Nível 5)
- [ ] Origem do bônus (nome do usuário que gerou o bônus)
- [ ] ID da transação que gerou o bônus
- [ ] Ordenação por data (mais recente primeiro)
- [ ] Filtro por tipo de bônus
- [ ] Filtro por período (última semana, último mês, último ano, personalizado)
- [ ] Exportação em PDF ou Excel
- [ ] Totalização por tipo de bônus
- [ ] Paginação

**Definição de Pronto Específica:**
- [ ] Cálculos corretos de totalizações
- [ ] Filtros funcionais
- [ ] Exportação gera arquivo correto
- [ ] Performance adequada com muitos registros

---

### **US-020: Dashboard de Resumo Financeiro**
**Como:** Usuário  
**Quero:** Ver um resumo visual dos meus ganhos  
**Para:** Ter uma visão rápida do meu desempenho

**Prioridade:** Baixa  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Cards com: Total ganho (geral), Ganho no mês, Ganho na semana
- [ ] Gráfico de evolução de ganhos por mês
- [ ] Gráfico de distribuição de ganhos por tipo (direto vs níveis)
- [ ] Comparação com mês anterior (% de crescimento)

**Definição de Pronto Específica:**
- [ ] Gráficos renderizam corretamente
- [ ] Dados precisos
- [ ] Visual atraente

---

## ÉPICO 8: PAINEL ADMINISTRATIVO - HOME E DASHBOARD

### **US-021: Dashboard Administrativo com KPIs**
**Como:** Administrador  
**Quero:** Ver indicadores de desempenho do sistema  
**Para:** Monitorar o negócio

**Prioridade:** Alta  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Cards com KPIs principais:
  - Total de rifas vendidas (mês/geral)
  - Faturamento total (mês/geral)
  - Quantidade de usuários ativos
  - Quantidade de saques pendentes
  - Ticket médio
  - Taxa de conversão
- [ ] Gráficos:
  - Vendas por dia (últimos 30 dias)
  - Crescimento de usuários
  - Rifas mais vendidas
- [ ] Período selecionável (hoje, semana, mês, ano, personalizado)
- [ ] Atualização automática dos dados

**Definição de Pronto Específica:**
- [ ] Cálculos precisos de KPIs
- [ ] Gráficos renderizam rapidamente
- [ ] Dashboard responsivo
- [ ] Dados atualizam sem necessidade de refresh

---

### **US-022: Relatórios Gerenciais**
**Como:** Administrador  
**Quero:** Gerar relatórios detalhados  
**Para:** Analisar o desempenho do negócio

**Prioridade:** Média  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Relatório de vendas (por período, por rifa, por usuário)
- [ ] Relatório financeiro (faturamento, comissões pagas, lucro)
- [ ] Relatório de usuários (cadastros, ativos, inativos)
- [ ] Relatório de rede (estrutura, profundidade, conversão)
- [ ] Filtros de data e categoria
- [ ] Exportação em PDF, Excel, CSV
- [ ] Gráficos e tabelas

**Definição de Pronto Específica:**
- [ ] Relatórios geram corretamente
- [ ] Exportações funcionais
- [ ] Performance adequada com grandes volumes de dados

---

## ÉPICO 9: PAINEL ADMINISTRATIVO - GESTÃO DE RIFAS

### **US-023: Criar Blocos de Rifas**
**Como:** Administrador  
**Quero:** Criar novos blocos de rifas  
**Para:** Disponibilizar rifas para venda

**Prioridade:** Crítica  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Formulário com campos:
  - Nome da rifa
  - Descrição
  - Valor por cartela
  - Quantidade total de cartelas
  - Data do sorteio
  - Imagem (upload)
  - Descrição do prêmio
  - Status inicial (Ativa/Inativa)
- [ ] Validação de campos obrigatórios
- [ ] Validação de valores (positivos)
- [ ] Preview da rifa antes de salvar
- [ ] Geração automática de números/códigos para as cartelas
- [ ] Confirmação de criação

**Definição de Pronto Específica:**
- [ ] Rifa criada aparece no escritório virtual dos usuários (se ativa)
- [ ] Cartelas geradas corretamente
- [ ] Upload de imagem funcional
- [ ] Teste de criação completa

---

### **US-024: Listar e Gerenciar Rifas Criadas**
**Como:** Administrador  
**Quero:** Ver todas as rifas criadas  
**Para:** Gerenciar o catálogo de rifas

**Prioridade:** Alta  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Tabela com: Nome, Valor, Total de cartelas, Vendidas, Disponíveis, Status, Ações
- [ ] Filtro por status (Ativa/Inativa/Encerrada)
- [ ] Busca por nome
- [ ] Ordenação por colunas
- [ ] Ações: Editar, Ativar/Desativar, Ver detalhes, Excluir
- [ ] Confirmação antes de excluir
- [ ] Paginação

**Definição de Pronto Específica:**
- [ ] Filtros e buscas funcionais
- [ ] Ações executam corretamente
- [ ] Performance adequada

---

### **US-025: Editar Rifa Existente**
**Como:** Administrador  
**Quero:** Editar dados de uma rifa  
**Para:** Corrigir informações ou atualizar detalhes

**Prioridade:** Média  
**Estimativa:** 5 pontos

**Critérios de Aceite:**
- [ ] Formulário pré-preenchido com dados atuais
- [ ] Possibilidade de alterar: Nome, Descrição, Imagem, Data do sorteio
- [ ] Campos bloqueados: Valor por cartela (se já houver vendas), Quantidade de cartelas
- [ ] Validações apropriadas
- [ ] Confirmação de salvamento

**Definição de Pronto Específica:**
- [ ] Alterações refletidas imediatamente
- [ ] Não permite edições que quebrem integridade (ex: reduzir cartelas já vendidas)

---

### **US-026: Ativar/Desativar Rifa**
**Como:** Administrador  
**Quero:** Ativar ou desativar uma rifa  
**Para:** Controlar a disponibilidade para venda

**Prioridade:** Alta  
**Estimativa:** 3 pontos

**Critérios de Aceite:**
- [ ] Toggle ou botão para ativar/desativar
- [ ] Rifa desativada não aparece no escritório virtual dos usuários
- [ ] Rifa ativada aparece imediatamente
- [ ] Indicação visual clara do status atual
- [ ] Confirmação antes de alterar status

**Definição de Pronto Específica:**
- [ ] Alteração de status imediata
- [ ] Teste de visibilidade no escritório virtual

---

### **US-027: Visualizar Rifas Aprovadas (Vendidas)**
**Como:** Administrador  
**Quero:** Ver detalhes das rifas vendidas  
**Para:** Acompanhar as vendas e identificar compradores

**Prioridade:** Alta  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Listagem de todos os lotes de rifas
- [ ] Ao clicar em um lote, exibe:
  - Todas as cartelas vendidas
  - Número da cartela
  - Nome do comprador
  - Data da compra
  - Status do pagamento
  - Valor pago
- [ ] Filtro por rifa
- [ ] Busca por nome do comprador
- [ ] Exportação da lista
- [ ] Indicação visual de cartelas pendentes/pagas

**Definição de Pronto Específica:**
- [ ] Lista precisa de compradores
- [ ] Exportação funcional
- [ ] Performance adequada

---

## ÉPICO 10: PAINEL ADMINISTRATIVO - APROVAÇÃO MANUAL

### **US-028: Listar Compras Pendentes de Aprovação**
**Como:** Administrador  
**Quero:** Ver compras que aguardam aprovação manual  
**Para:** Processar pagamentos offline

**Prioridade:** Média  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Tabela com: Data, Usuário, Rifa, Quantidade, Valor, Ações
- [ ] Apenas compras com status "Pendente" aparecem
- [ ] Ordenação por data (mais antigas primeiro)
- [ ] Botões: Aprovar, Recusar
- [ ] Campo para observações
- [ ] Contador de pendências

**Definição de Pronto Específica:**
- [ ] Lista atualiza em tempo real
- [ ] Filtros funcionais
- [ ] Ações claramente identificadas

---

### **US-029: Aprovar ou Recusar Compra Manualmente**
**Como:** Administrador  
**Quero:** Aprovar ou recusar uma compra manualmente  
**Para:** Validar pagamentos offline (transferência, dinheiro)

**Prioridade:** Média  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Botão "Aprovar" libera as rifas para o usuário
- [ ] Botão "Recusar" cancela a compra e libera as cartelas
- [ ] Campo de observação obrigatório ao recusar
- [ ] Confirmação antes de executar ação
- [ ] Ao aprovar:
  - Status da compra muda para "Aprovada"
  - Rifas são atribuídas ao usuário
  - Bônus são calculados e distribuídos
  - Usuário recebe notificação
- [ ] Ao recusar:
  - Compra é cancelada
  - Cartelas voltam ao estoque
  - Usuário recebe notificação com motivo

**Definição de Pronto Específica:**
- [ ] Teste de aprovação e recusa
- [ ] Bônus calculados corretamente
- [ ] Notificações enviadas

---

## ÉPICO 11: PAINEL ADMINISTRATIVO - GESTÃO DE SAQUES

### **US-030: Listar Saques Solicitados**
**Como:** Administrador  
**Quero:** Ver todos os saques solicitados  
**Para:** Gerenciar pagamentos aos usuários

**Prioridade:** Alta  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Tabela com: Data, Usuário, Valor, Chave PIX, Status, Ações
- [ ] Filtro por status (Pendente/Aprovado/Pago/Recusado)
- [ ] Ordenação por data
- [ ] Busca por nome de usuário
- [ ] Contador de saques pendentes
- [ ] Total de valores pendentes
- [ ] Indicação visual por status

**Definição de Pronto Específica:**
- [ ] Lista precisa e atualizada
- [ ] Filtros funcionais
- [ ] Performance adequada

---

### **US-031: Aprovar Saque**
**Como:** Administrador  
**Quero:** Aprovar um saque solicitado  
**Para:** Autorizar o pagamento

**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Critérios de Aceite:**
- [ ] Botão "Aprovar"
- [ ] Confirmação antes de aprovar
- [ ] Status muda para "Aprovado"
- [ ] Usuário recebe notificação de aprovação
- [ ] Data de aprovação registrada

**Definição de Pronto Específica:**
- [ ] Aprovação reflete no banco de dados
- [ ] Notificação enviada
- [ ] Teste de aprovação

---

### **US-032: Marcar Saque como Pago**
**Como:** Administrador  
**Quero:** Marcar um saque como pago  
**Para:** Confirmar que o pagamento foi efetuado

**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Critérios de Aceite:**
- [ ] Botão "Marcar como Pago"
- [ ] Campo para código/comprovante de transação (opcional)
- [ ] Confirmação antes de marcar
- [ ] Status muda para "Pago"
- [ ] Data de pagamento registrada
- [ ] Usuário recebe notificação de pagamento realizado
- [ ] Saque não pode mais ser editado

**Definição de Pronto Específica:**
- [ ] Status finalizado corretamente
- [ ] Histórico preservado
- [ ] Notificação enviada

---

### **US-033: Recusar Saque**
**Como:** Administrador  
**Quero:** Recusar um saque solicitado  
**Para:** Negar solicitações inválidas

**Prioridade:** Média  
**Estimativa:** 5 pontos

**Critérios de Aceite:**
- [ ] Botão "Recusar"
- [ ] Campo de motivo obrigatório
- [ ] Confirmação antes de recusar
- [ ] Status muda para "Recusado"
- [ ] Valor retorna ao saldo disponível do usuário
- [ ] Usuário recebe notificação com motivo da recusa
- [ ] Data de recusa registrada

**Definição de Pronto Específica:**
- [ ] Saldo restaurado corretamente
- [ ] Notificação com motivo enviada
- [ ] Teste de recusa

---

## ÉPICO 12: PAINEL ADMINISTRATIVO - CONFIGURAÇÃO DE BÔNUS

### **US-034: Visualizar Plano de Bônus Atual**
**Como:** Administrador  
**Quero:** Ver as configurações atuais de bônus  
**Para:** Saber como está configurado o plano de ganhos

**Prioridade:** Alta  
**Estimativa:** 3 pontos

**Critérios de Aceite:**
- [ ] Exibição clara dos percentuais de cada nível:
  - Indicação Direta
  - Nível 2
  - Nível 3
  - Nível 4
  - Nível 5
- [ ] Data da última alteração
- [ ] Responsável pela última alteração
- [ ] Botão "Editar Configurações"

**Definição de Pronto Específica:**
- [ ] Informações precisas
- [ ] Visual claro e organizado

---

### **US-035: Configurar Percentuais de Bônus**
**Como:** Administrador  
**Quero:** Alterar os percentuais de bônus de cada nível  
**Para:** Ajustar o plano de ganhos conforme estratégia do negócio

**Prioridade:** Alta  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Formulário com campos para cada nível (Direto, 2º, 3º, 4º, 5º)
- [ ] Validação: valores entre 0% e 100%
- [ ] Validação: soma total não pode exceder um limite (ex: 50% do valor da venda)
- [ ] Alerta visual se configuração está muito alta/baixa
- [ ] Prévia de simulação de ganhos
- [ ] Confirmação antes de salvar
- [ ] Histórico de alterações
- [ ] Novas configurações aplicadas imediatamente para próximas vendas
- [ ] Vendas anteriores mantêm bônus calculados no momento da venda

**Definição de Pronto Específica:**
- [ ] Alterações aplicadas corretamente
- [ ] Cálculo de bônus usa configuração correta
- [ ] Histórico registrado
- [ ] Teste de cálculo com diferentes configurações

---

### **US-036: Histórico de Alterações de Bônus**
**Como:** Administrador  
**Quero:** Ver o histórico de alterações do plano de bônus  
**Para:** Auditar mudanças e entender evolução da estratégia

**Prioridade:** Baixa  
**Estimativa:** 5 pontos

**Critérios de Aceite:**
- [ ] Tabela com: Data, Usuário que alterou, Configuração anterior, Configuração nova
- [ ] Ordenação por data (mais recente primeiro)
- [ ] Filtro por período
- [ ] Exportação

**Definição de Pronto Específica:**
- [ ] Histórico completo e preciso
- [ ] Informações claras

---

## ÉPICO 13: SISTEMA DE BÔNUS E COMISSIONAMENTO

### **US-037: Cálculo Automático de Bônus na Venda**
**Como:** Sistema  
**Quero:** Calcular automaticamente os bônus quando uma venda é aprovada  
**Para:** Distribuir ganhos na rede corretamente

**Prioridade:** Crítica  
**Estimativa:** 21 pontos

**Critérios de Aceite:**
- [ ] Quando uma compra é aprovada (pagamento confirmado ou aprovação manual):
  - Sistema identifica o comprador
  - Busca a estrutura de rede do comprador (até 5 níveis acima)
  - Obtém configuração de bônus atual
  - Calcula valor de bônus para cada nível conforme percentual
  - Cria registros de bônus no extrato de cada usuário beneficiado
  - Adiciona valores aos saldos disponíveis
- [ ] Bônus é calculado sobre o valor pago (não sobre quantidade de cartelas)
- [ ] Se um nível não existir na estrutura, bônus daquele nível não é distribuído
- [ ] Log detalhado de cada cálculo para auditoria
- [ ] Transação atômica (tudo ou nada)

**Definição de Pronto Específica:**
- [ ] Teste com estrutura de 1 a 5 níveis
- [ ] Teste com diferentes configurações de bônus
- [ ] Valores calculados corretamente
- [ ] Performance adequada (< 1 segundo por cálculo)
- [ ] Auditoria completa em logs

---

### **US-038: Registro de Bônus no Extrato**
**Como:** Sistema  
**Quero:** Registrar cada bônus no extrato do usuário  
**Para:** Prover transparência completa

**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Critérios de Aceite:**
- [ ] Cada bônus gera um registro com:
  - Data e hora
  - Valor
  - Tipo (Direto/Nível 2/3/4/5)
  - ID da venda origem
  - Nome do usuário que gerou a venda
  - Percentual aplicado
- [ ] Registros não podem ser editados ou excluídos
- [ ] Registros vinculados à venda origem

**Definição de Pronto Específica:**
- [ ] Registros criados corretamente
- [ ] Integridade referencial mantida
- [ ] Impossível deletar/editar

---

## ÉPICO 14: NOTIFICAÇÕES E COMUNICAÇÃO

### **US-039: Sistema de Notificações por E-mail**
**Como:** Sistema  
**Quero:** Enviar e-mails automáticos aos usuários  
**Para:** Manter usuários informados

**Prioridade:** Alta  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Configuração de servidor SMTP
- [ ] Templates de e-mail:
  - Confirmação de cadastro
  - Recuperação de senha
  - Confirmação de compra
  - Pagamento aprovado
  - Novo bônus recebido
  - Saque solicitado
  - Saque aprovado/pago/recusado
- [ ] Variáveis dinâmicas nos templates (nome, valor, data, etc)
- [ ] Design responsivo dos e-mails
- [ ] Fila de envio (não bloquear operações)
- [ ] Log de e-mails enviados
- [ ] Tratamento de erros de envio

**Definição de Pronto Específica:**
- [ ] E-mails chegam corretamente
- [ ] Templates renderizam bem em diferentes clientes (Gmail, Outlook, etc)
- [ ] Fila processa sem travamentos
- [ ] Teste de todos os tipos de e-mail

---

### **US-040: Notificações In-App**
**Como:** Usuário  
**Quero:** Receber notificações dentro do sistema  
**Para:** Ser alertado sobre eventos importantes

**Prioridade:** Média  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Ícone de notificações no menu com contador
- [ ] Lista de notificações recentes
- [ ] Tipos de notificações:
  - Nova venda na rede
  - Bônus recebido
  - Saque processado
  - Novas rifas disponíveis
- [ ] Indicação visual de não lidas
- [ ] Marcar como lida
- [ ] Marcar todas como lidas
- [ ] Limpar antigas
- [ ] Link para ação relacionada (ex: ver extrato, ver rifa)

**Definição de Pronto Específica:**
- [ ] Notificações aparecem em tempo real (ou próximo disso)
- [ ] Contador atualiza corretamente
- [ ] Performance não afetada

---

## ÉPICO 15: SEGURANÇA E AUDITORIA

### **US-041: Log de Ações Críticas**
**Como:** Sistema  
**Quero:** Registrar todas as ações críticas  
**Para:** Ter auditoria completa

**Prioridade:** Alta  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Log de:
  - Cadastros
  - Logins (bem-sucedidos e falhados)
  - Compras
  - Aprovações/recusas (rifas e saques)
  - Alterações de configuração
  - Cálculos de bônus
- [ ] Registro com: Data/hora, Usuário, IP, Ação, Dados antes/depois
- [ ] Logs imutáveis (append-only)
- [ ] Retenção de logs (mínimo 1 ano)

**Definição de Pronto Específica:**
- [ ] Logs completos e precisos
- [ ] Performance não afetada
- [ ] Consulta de logs funcional

---

### **US-042: Painel de Auditoria para Administrador**
**Como:** Administrador  
**Quero:** Visualizar logs de auditoria  
**Para:** Investigar problemas e monitorar atividades

**Prioridade:** Média  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Filtros por: Data, Usuário, Tipo de ação
- [ ] Busca por palavra-chave
- [ ] Exportação de logs
- [ ] Visualização detalhada de cada log
- [ ] Paginação

**Definição de Pronto Específica:**
- [ ] Filtros funcionais
- [ ] Performance adequada
- [ ] Exportação funcional

---

### **US-043: Proteção contra Fraudes**
**Como:** Sistema  
**Quero:** Implementar mecanismos de segurança  
**Para:** Prevenir fraudes e abusos

**Prioridade:** Alta  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Limite de tentativas de login (5 tentativas, bloquear por 15 minutos)
- [ ] Validação de unicidade de e-mail
- [ ] Validação de CPF (se aplicável)
- [ ] Detecção de múltiplos cadastros do mesmo IP (alerta)
- [ ] Validação de integridade nas requisições de pagamento
- [ ] Token CSRF em formulários
- [ ] Rate limiting em APIs
- [ ] Captcha em formulários públicos

**Definição de Pronto Específica:**
- [ ] Testes de segurança realizados
- [ ] Não é possível burlar validações
- [ ] Logs de tentativas suspeitas

---

## ÉPICO 16: PERFORMANCE E OTIMIZAÇÃO

### **US-044: Otimização de Queries e Índices**
**Como:** Desenvolvedor  
**Quero:** Otimizar o banco de dados  
**Para:** Garantir performance adequada com crescimento

**Prioridade:** Alta  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Índices em campos de busca frequente
- [ ] Índices em chaves estrangeiras
- [ ] Queries otimizadas (evitar N+1)
- [ ] Paginação em todas as listagens grandes
- [ ] Lazy loading onde apropriado
- [ ] Cache de queries frequentes

**Definição de Pronto Específica:**
- [ ] Tempo de resposta < 3 segundos em queries principais
- [ ] Teste de carga com 1000+ usuários simultâneos
- [ ] Análise de explain plan das queries principais

---

### **US-045: Cache e Otimização de Frontend**
**Como:** Desenvolvedor  
**Quero:** Otimizar o carregamento do frontend  
**Para:** Melhorar experiência do usuário

**Prioridade:** Média  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Minificação de JS/CSS
- [ ] Compressão de imagens
- [ ] Lazy loading de imagens
- [ ] Code splitting
- [ ] Service Worker para PWA (opcional)
- [ ] Cache de assets estáticos

**Definição de Pronto Específica:**
- [ ] Lighthouse score > 80 em Performance
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 5s

---

## ÉPICO 17: RESPONSIVIDADE E UX

### **US-046: Design Responsivo Completo**
**Como:** Usuário  
**Quero:** Acessar o sistema de qualquer dispositivo  
**Para:** Ter flexibilidade de uso

**Prioridade:** Crítica  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Layout adaptável para: Desktop (> 1024px), Tablet (768px - 1024px), Mobile (< 768px)
- [ ] Menu responsivo (hamburger em mobile)
- [ ] Tabelas responsivas (scroll horizontal ou cards em mobile)
- [ ] Formulários otimizados para mobile
- [ ] Botões com tamanho adequado para touch
- [ ] Testes em diferentes dispositivos e navegadores

**Definição de Pronto Específica:**
- [ ] Teste em Chrome, Firefox, Safari, Edge
- [ ] Teste em iOS e Android
- [ ] Sem quebras de layout
- [ ] Usabilidade mantida em todos os tamanhos

---

### **US-047: Feedback Visual para Todas as Ações**
**Como:** Usuário  
**Quero:** Receber feedback visual para minhas ações  
**Para:** Saber que o sistema está processando

**Prioridade:** Alta  
**Estimativa:** 5 pontos

**Critérios de Aceite:**
- [ ] Spinners/loaders durante carregamentos
- [ ] Mensagens toast de sucesso/erro
- [ ] Confirmações antes de ações destrutivas
- [ ] Estados de loading em botões
- [ ] Indicação visual de campos obrigatórios
- [ ] Validação inline em formulários

**Definição de Pronto Específica:**
- [ ] Feedback em todas as ações principais
- [ ] Mensagens claras e informativas
- [ ] Animações suaves

---

## ÉPICO 18: DOCUMENTAÇÃO E AJUDA

### **US-048: Documentação de Usuário**
**Como:** Usuário  
**Quero:** Ter acesso a um guia de uso  
**Para:** Entender como utilizar o sistema

**Prioridade:** Média  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] Página de ajuda/FAQ
- [ ] Guia passo a passo:
  - Como comprar rifas
  - Como compartilhar link de indicação
  - Como solicitar saque
  - Como visualizar minha rede
- [ ] Tutoriais em vídeo (opcional)
- [ ] Tooltips em funcionalidades complexas
- [ ] Link "Ajuda" visível no menu

**Definição de Pronto Específica:**
- [ ] Documentação clara e completa
- [ ] Linguagem acessível
- [ ] Imagens ilustrativas

---

### **US-049: Documentação Técnica**
**Como:** Desenvolvedor  
**Quero:** Ter documentação técnica completa  
**Para:** Facilitar manutenção e evolução

**Prioridade:** Média  
**Estimativa:** 8 pontos

**Critérios de Aceite:**
- [ ] README completo com setup
- [ ] Documentação da API (endpoints, payloads, responses)
- [ ] Diagramas:
  - Arquitetura do sistema
  - Modelo de dados (ER)
  - Fluxogramas principais
- [ ] Guia de deploy
- [ ] Guia de troubleshooting
- [ ] Comentários no código em partes complexas

**Definição de Pronto Específica:**
- [ ] Novo desenvolvedor consegue configurar ambiente seguindo docs
- [ ] API documentada com Swagger/Postman
- [ ] Diagramas atualizados

---

## ÉPICO 19: TESTES E QUALIDADE

### **US-050: Testes Automatizados**
**Como:** Desenvolvedor  
**Quero:** Ter cobertura de testes automatizados  
**Para:** Garantir qualidade e evitar regressões

**Prioridade:** Alta  
**Estimativa:** 21 pontos

**Critérios de Aceite:**
- [ ] Testes unitários para lógica de negócio crítica:
  - Cálculo de bônus
  - Validações
  - Autenticação
- [ ] Testes de integração:
  - Fluxo completo de compra
  - Fluxo de saque
  - Cálculo de rede
- [ ] Testes E2E (Cypress/Playwright):
  - Cadastro e login
  - Compra de rifa
  - Solicitação de saque
- [ ] Cobertura mínima de 70%
- [ ] CI/CD executa testes automaticamente

**Definição de Pronto Específica:**
- [ ] Pipeline de CI configurado
- [ ] Testes passam consistentemente
- [ ] Relatório de cobertura gerado

---

## ÉPICO 20: DEPLOY E INFRAESTRUTURA

### **US-051: Configuração de Ambientes (Dev, Homolog, Prod)**
**Como:** DevOps  
**Quero:** Ter ambientes separados  
**Para:** Testar antes de colocar em produção

**Prioridade:** Alta  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Ambiente de desenvolvimento local
- [ ] Ambiente de homologação (staging)
- [ ] Ambiente de produção
- [ ] Variáveis de ambiente específicas por ambiente
- [ ] Banco de dados separado por ambiente
- [ ] Integração com Mercado Pago em sandbox (homolog) e produção

**Definição de Pronto Específica:**
- [ ] Ambientes funcionais
- [ ] Deploy automatizado ou documentado
- [ ] Segredos gerenciados adequadamente

---

### **US-052: Deploy em Produção**
**Como:** DevOps  
**Quero:** Fazer deploy do sistema em produção  
**Para:** Disponibilizar para usuários finais

**Prioridade:** Crítica  
**Estimativa:** 13 pontos

**Critérios de Aceite:**
- [ ] Sistema hospedado em servidor adequado
- [ ] HTTPS configurado (SSL)
- [ ] Domínio configurado
- [ ] Backup automático do banco de dados (diário)
- [ ] Monitoramento de uptime
- [ ] Logs centralizados
- [ ] Plano de rollback
- [ ] Documentação de deploy

**Definição de Pronto Específica:**
- [ ] Sistema acessível publicamente
- [ ] Performance adequada em produção
- [ ] Certificado SSL válido
- [ ] Backups funcionando

---

## 📊 RESUMO DO BACKLOG

### Por Prioridade
- **Crítica:** 13 histórias
- **Alta:** 17 histórias
- **Média:** 17 histórias
- **Baixa:** 3 histórias

### Por Estimativa (Pontos de Story)
- **Total:** ~452 pontos
- **Sprints estimados:** 15-20 sprints (considerando 20-25 pontos por sprint)

### Ordem Recomendada de Implementação

#### **FASE 1 - MVP (Mínimo Produto Viável)**
Sprints 1-8 (~180 pontos)
1. Infraestrutura e Autenticação (US-001 a US-004)
2. Integração com Mercado Pago (US-005, US-006)
3. Gestão de Rifas Admin (US-023, US-024, US-026)
4. Escritório Virtual - Home e Compra (US-007, US-008, US-010)
5. Sistema de Bônus (US-037, US-038)
6. Gestão de Saques (US-016, US-017, US-030, US-031, US-032)
7. Configuração de Bônus (US-034, US-035)
8. Deploy básico (US-051, US-052)

#### **FASE 2 - Expansão**
Sprints 9-14 (~150 pontos)
1. Extrato e Transparência (US-019, US-011, US-012, US-013)
2. Visualização de Rede (US-014, US-015)
3. Dashboard Admin (US-021, US-027)
4. Aprovação Manual (US-028, US-029)
5. Notificações (US-039, US-040)
6. Segurança e Auditoria (US-041, US-042, US-043)

#### **FASE 3 - Refinamento**
Sprints 15-20 (~122 pontos)
1. Relatórios e Analytics (US-020, US-022)
2. Performance e Otimização (US-044, US-045)
3. UX e Responsividade (US-046, US-047)
4. Gestão completa de rifas (US-009, US-025, US-033, US-036)
5. Documentação (US-048, US-049)
6. Testes Automatizados (US-050)

---

## 📝 NOTAS IMPORTANTES

### Stack Tecnológico Definido

**Frontend:**
- **Framework:** Next.js 16.1+ (App Router)
- **UI Library:** React 19.2+
- **Styling:** Tailwind CSS v4 (com Glassmorphism)
- **Language:** TypeScript 5+
- **State Management:** React Context API + Hooks
- **HTTP Client:** Fetch API nativo / Supabase Client
- **Deploy:** Vercel (hospedagem gratuita)

**Backend:**
- **BaaS:** Supabase (Backend as a Service)
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth (JWT)
- **Storage:** Supabase Storage
- **Real-time:** Supabase Real-time subscriptions
- **API:** Supabase REST API auto-gerada
- **Edge Functions:** Supabase Edge Functions (Deno)
- **Payments:** Mercado Pago SDK
- **Deploy:** Supabase Cloud (hospedagem gratuita)

**DevOps:**
- **Version Control:** Git/GitHub
- **CI/CD:** GitHub Actions + Vercel auto-deploy
- **Monitoring:** Supabase Dashboard
- **Hosting:** 
  - Frontend: Vercel (gratuito)
  - Backend: Supabase (gratuito até certo limite)
  - Banco de Dados: Supabase PostgreSQL (gratuito)

**Vantagens da Stack Escolhida:**
- ✅ **Custo Zero Inicial:** Vercel e Supabase têm planos gratuitos generosos
- ✅ **Escalabilidade:** Ambas plataformas escalam automaticamente
- ✅ **DX (Developer Experience):** Setup rápido, hot reload, TypeScript
- ✅ **Performance:** Next.js SSR/SSG + Edge Functions
- ✅ **Segurança:** Row Level Security do Supabase + HTTPS automático
- ✅ **Real-time:** Supabase oferece subscriptions WebSocket nativas
- ✅ **Produtividade:** API auto-gerada, Auth pronto, Storage incluído

### Considerações de Negócio
1. **Escalabilidade:** Sistema deve suportar crescimento exponencial da rede
2. **Transparência:** Todos os cálculos devem ser auditáveis
3. **Segurança:** Dados financeiros e pessoais devem ser protegidos
4. **Compliance:** Verificar legislação sobre rifas e marketing multinível
5. **Suporte:** Planejar canal de suporte aos usuários

### Riscos Identificados
1. **Integração Mercado Pago:** Webhook pode falhar - implementar retry
2. **Cálculo de Bônus:** Erro pode causar prejuízo - testes rigorosos necessários
3. **Performance:** Rede grande pode causar lentidão - otimização crítica
4. **Legal:** Verificar legalidade do modelo em diferentes jurisdições
5. **Fraudes:** Múltiplos cadastros - implementar validações

---

**Backlog criado em:** 28/12/2025  
**Versão do documento:** 1.0

