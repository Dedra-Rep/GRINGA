# Arquitetura da Memória Inteligente — Mordomo.AI

Bem-vindo ao centro cognitivo do **Mordomo.AI**. Este diretório define a estrutura arquitetônica responsável por gerenciar o contexto vital e a privacidade de nossos usuários com foco em escalabilidade para milhões de contas, segurança absoluta de dados e conformidade estrita com a LGPD.

---

## 🧠 Divisão Arquitetônica das Quatro Camadas de Memória

Para imitar o cérebro humano e maximizar a utilidade da IA com consumo inteligente de tokens, dividimos a memória em 4 camadas bem delimitadas:

### 1. Memória Permanente (`PermanentMemory`)
*   **Definição:** Informações estruturais básicas do usuário que quase nunca mudam.
*   **O que contém:** Primeiro nome, preferências de tratamento (ex: "Senhor", "Marcos"), idioma padrão, membros do círculo familiar direto, valores filosóficos fundamentais, metas de vida superiores de longo prazo e preferências explícitas de privacidade LGPD.
*   **Fluxo de Atualização:** **Nunca automática.** Qualquer alteração nesta camada exige confirmação expressa do usuário em tela (ex: pop-up de consentimento ou edição manual no painel).

### 2. Memória Longa (`LongTermMemory`)
*   **Definição:** Projetos ativos, aspirações, conexões estratégicas e históricos consolidados.
*   **O que contém:** Lista de sonhos ativos (ex: "Comprar casa própria"), grandes projetos de carreira/negócios, relacionamentos importantes (sócios, clientes chave), hábitos recorrentes cadastrados e conquistas históricas do usuário.
*   **Fluxo de Atualização:** Identificada através de heurísticas linguísticas do modelo e sempre sugerida com a pergunta: *"Deseja que eu registre este objetivo para te ajudar de forma recorrente?"*

### 3. Memória Curta (`ShortTermMemory`)
*   **Definição:** O contexto operacional e as pendências das últimas semanas.
*   **O que contém:** Missões semanais ativas, lembretes agendados com data/hora e pendências operacionais ativas sob supervisão direta do Mordomo.
*   **Fluxo de Atualização:** Reativa. Adicionada automaticamente quando o usuário solicita agendamentos ("me lembre de..."), mas limpa e rotacionada semanalmente.

### 4. Memória Instantânea (`InstantMemory`)
*   **Definição:** O "buffer" da conversa e contexto operacional imediato.
*   **O que contém:** ID da sessão ativa, timestamp da última mensagem, tópico central em andamento na discussão e o buffer de tokens do último par de pergunta-resposta.
*   **Fluxo de Atualização:** Dinâmica e puramente temporária. Redefinida ao iniciar uma nova sessão ou expirar o tempo limite de ociosidade.

---

## ⚖️ Heurística de Decisão Cognitiva (Como a IA Decide)

O `MemoryService` analisa cada interação baseando-se em quatro regras lógicas fundamentais:

```
                  ┌────────────────────────┐
                  │ Mensagem do Usuário    │
                  └───────────┬────────────┘
                              │
               [Contém Dados Sensíveis/Senhas?]
               ┌──────────────┴──────────────┐
              Sim                            Não
               │                              │
     ┌─────────▼─────────┐         [Muda Perfil ou Preferência?]
     │ Ação: FORGET      │         ┌──────────┴──────────┐
     │ (Descarte Imediato)│        Sim                   Não
     └───────────────────┘         │                      │
                         ┌─────────▼─────────┐     [Sinaliza Sonhos/Planos?]
                         │ Ação: ASK_USER    │     ┌──────┴──────┐
                         │ (Solicita Aceite) │    Sim            Não
                         └───────────────────┘     │              │
                                         ┌─────────▼─────────┐  ┌─▼───────────────┐
                                         │ Ação: ASK_USER    │  │ Ação: SAVE      │
                                         │ (Registra Sonho)  │  │ (Atualiza Curto)│
                                         └───────────────────┘  └─────────────────┘
```

### A. O que Guardar de Forma Permanente?
Apenas informações de alta fidelidade ligadas aos pilares de cuidado (família, saúde, proteção financeira, sonhos reais).

### B. O que Esquecer Imediatamente? (Guardrails de Segurança)
Dados confidenciais como chaves de acesso, números de cartão de crédito, senhas digitadas acidentalmente, e CPF/RG são interceptados pelo algoritmo de heurística e descartados na memória instantânea (`action: 'forget'`). **Nunca persistem em nuvem.**

### C. O que Resumir? (Data Aging)
A memória de curto prazo passa por faxinas periódicas (garbage collection). Pendências concluídas há mais de 7 dias são condensadas em métricas gerais de produtividade na Memória Longa (ex: "Concluiu 5 missões de cuidado na semana passada") liberando o espaço de processamento da IA.

### D. O que Perguntar Antes de Salvar?
Acontecimentos pessoais e novos membros familiares só são consolidados após consentimento explícito em interface.

---

## 🔒 Governança de Privacidade e LGPD

1.  **Consentimento Proativo:** O usuário define na tela de consentimento se deseja habilitar backup seguro ou se prefere armazenamento local criptografado.
2.  **Direito ao Esquecimento:** O hook `useMemory` disponibiliza a rotina `clearMemory()`, que apaga de forma permanente e irreversível todos os dados em custódia do Mordomo.AI.

---

## 🚀 Prontidão para Firebase e Infraestrutura Cloud

A arquitetura foi estruturada usando objetos TypeScript nativos de formato JSON plano para mapeamento direto com coleções do **Google Firestore**:
*   **`/users/{userId}/memory/permanent`** -> Mapeia diretamente para `PermanentMemory`.
*   **`/users/{userId}/memory/longTerm`** -> Mapeia diretamente para `LongTermMemory`.
*   **`/users/{userId}/memory/shortTerm`** -> Mapeia diretamente para `ShortTermMemory`.
*   As regras de segurança do Firestore (`firestore.rules`) garantem que apenas o usuário autenticado correspondente ao `userId` tenha privilégios de leitura e gravação nestas subcoleções.
