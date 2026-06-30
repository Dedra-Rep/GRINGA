# Mordomo.AI — Sistema de Cuidado Inteligente (V2)

## 📌 Sobre o Projeto
O **Mordomo.AI** é um ecossistema projetado sob a filosofia de Cuidado Inteligente. Ele atua de forma discreta, humana e proativa na vida do usuário, ajudando-o a lembrar, organizar e priorizar o que realmente importa (família, saúde, proteção financeira e sonhos), com conformidade estrita à LGPD e segurança absoluta desde a primeira linha de código.

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
*   Node.js (v18 ou superior recomendado)
*   NPM

### Passo a Passo

1. **Instalar Dependências:**
   ```bash
   npm install
   ```

2. **Configurar as Variáveis de Ambiente:**
   Copie o arquivo `.env.example` para `.env` na raiz do projeto:
   ```bash
   cp .env.example .env
   ```
   Abra o arquivo `.env` e configure sua chave de API do Gemini:
   ```env
   GEMINI_API_KEY=sua_chave_real_aqui
   PORT=3000
   NODE_ENV=development
   ```

3. **Iniciar Servidor de Desenvolvimento:**
   Você pode iniciar em modo integrado (Express + Vite juntos na mesma porta, recomendado para simular a produção e desenvolvimento rápido) ou em modo duplo (processos separados):
   
   *   **Modo Integrado (Recomendado):**
       ```bash
       npm run dev
       ```
       *Inicia o servidor Express integrado na porta configurada (ou 3000 padrão), que cuida de carregar o middleware de desenvolvimento do Vite e servir a API.*

   *   **Modo Separado/Duplo (Concorrente):**
       ```bash
       npm run dev:full
       ```
       *Inicia o Express em uma porta e o servidor Vite do frontend separadamente utilizando `concurrently`.*

4. **Compilar para Produção (Build):**
   ```bash
   npm run build
   ```

---

## 🔒 Diretrizes de Segurança e Publicação
1. **Não Publicar Sem Autorização:** Este é um repositório interno e protegido de homologação da V2. Não faça deploys manuais ou alterações de rotas sem consentimento da gerência técnica.
2. **Isolamento de Chaves:** Nunca adicione chaves de API secretas (como `GEMINI_API_KEY`) diretamente em arquivos do frontend ou no repositório de controle de versão.
3. **Preservar Checkpoints:** Sempre siga o padrão de checkpoints definidos pela equipe principal de arquitetura para registrar as fases estáveis da aplicação.

---

## 📑 Documentação Interna (Pasta `/docs`)
Para detalhes profundos da visão do produto, consulte os arquivos dentro de `/docs`:
*   `docs/00-CONSTITUICAO-MORDOMO.md`: Missão, promessa e regra de ouro do sistema de cuidado.
*   `docs/01-DESIGN-PRINCIPLES.md`: Os 11 mandamentos de design (no-anxiety, mobile-first, etc.).
*   `docs/02-IA-PERSONALIDADE.md`: Diretrizes e termos permitidos/proibidos de linguagem do Mordomo.
*   `docs/03-ARQUITETURA-MVP.md`: Detalhes de interface e a estrutura de módulos do MVP.
*   `docs/04-ROADMAP.md`: Planejamento detalhado de 7 dias, 30 dias, 90 dias, 180 dias e 1 ano.
*   `docs/05-REGRAS-DE-SEGURANCA.md`: Implementação de privacidade, LGPD e fluxo de dados.
*   `docs/06-PROMPTS-OFICIAIS.md`: Catálogo de instruções de sistema e heurísticas lógicas de IA.
*   `src/memory/MEMORIA.md`: Arquitetura cognitiva das 4 camadas de memória inteligível.

---

## 🏗️ Como Continuar o Desenvolvimento (Próximos Passos)
O ambiente está 100% configurado com tipos, constantes e arquitetura prontos para o início da integração direta de persistência do Firebase e Auth. Para continuar, execute os prompts de implementação de banco de dados ou painéis descritos no cronograma do Roadmap de 30 dias.
