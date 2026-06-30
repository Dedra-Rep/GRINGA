# Regras de Segurança e Privacidade — Mordomo.AI

A privacidade não é um adendo regulatório no Mordomo.AI; ela é o pilar mais valioso de nossa arquitetura tecnológica.

---

## 🔒 Princípios de Segurança e Governança

### 1. Conformidade Absoluta com a LGPD/GDPR
O Mordomo.AI foi concebido sob a filosofia de *Privacy by Design*. Toda coleta de informação possui uma finalidade explícita de cuidado, comunicada de forma cristalina ao usuário.

### 2. O Usuário é o Único Dono dos Seus Dados
Qualquer informação entregue ao ecossistema pertence única e exclusivamente ao usuário. Ele detém controle total e soberania.

### 3. Liberdade Total: Apagar e Exportar Dados
O usuário tem o direito inalienável de, a qualquer momento:
*   Visualizar todas as informações em posse do Mordomo.
*   Exportar sua base de memória inteligente em formato padrão JSON.
*   Requisitar a exclusão total, permanente e irrecuperável de todos os registros de nossos servidores de banco de dados (`clearMemory()`).

### 4. Zero Salvamento de Dados Sensíveis Sem Consentimento
Heurísticas de segurança no `MemoryService` monitoram as conversas. Senhas, números de cartão de crédito e documentos de segurança nunca são arquivados ou indexados sem criptografia robusta ou consentimento explícito.

### 5. Não Treinar Modelos com Dados Privados do Usuário
Garantimos contratualmente que as interações individuais e dados de sonhos dos usuários nunca são compartilhados ou utilizados para treinamento público de grandes modelos de linguagem (LLMs). As APIs são tratadas sob chaves empresariais que barram o reaproveitamento de dados.

### 6. Isolamento e Variáveis de Ambiente no Backend
*   **Gemini API Key:** A chave mestra de inteligência artificial é mantida unicamente como variável de ambiente no servidor (`process.env.GEMINI_API_KEY`). Ela **nunca** é exposta nas respostas, no console do navegador, ou em requisições do frontend.
*   As rotas de API do Express (`/api/*`) atuam como pontes e proxies de segurança (API Proxies), isolando a chave secreta de acessos externos maliciosos.
