# Arquitetura do MVP — Mordomo.AI

Este documento descreve as frentes técnicas e de interface que compõem a versão de MVP (Minimum Viable Product) do Mordomo.AI V2.

---

## 🗺️ Escopo do MVP

O MVP foi projetado como um aplicativo mobile-first e responsivo focado na construção de valor inicial e captação de leads qualificados (Lista de Fundadores). Suas principais seções e componentes são:

### 1. Home Institucional (Apresentação do Cuidado)
*   **Propósito:** Apresentar a promessa ("Enquanto você vive, o Mordomo cuida.") e gerar encantamento imediato por meio de design sóbrio, limpo e elegante.
*   **Mascote:** O Mordomo virtual atua como avatar que reage em tempo real (Pensando, Ouvindo, Falando, Idle).

### 2. Onboarding Humano (Telas 1 a 8 + Final)
*   **Inovação:** Substitui o cadastro tradicional de emails/senhas por uma conversa acolhedora de menos de 2 minutos sobre valores, sonhos, focos de vida e privacidade.
*   **Gate de Cadastro:** O cadastro de conta (Google, Apple, Email) é solicitado exclusivamente no final, após o usuário visualizar o plano de cuidado personalizado construído com suas respostas.

### 3. Perfil Inicial ("O Que Importa")
*   **Campos de Interesse:** Armazena o foco de vida primário, sonhos a proteger e pessoas que o usuário nunca gostaria de esquecer.

### 4. Briefing Diário
*   **Visão Geral:** Um resumo claro e acolhedor gerado por IA que condensa as prioridades urgentes, missões curtas e lembretes para que o usuário sinta alívio imediato da sobrecarga cognitiva.

### 5. Memória Inteligente
*   **Camadas:** Estruturada em 4 divisões cognitivas (Permanente, Longa, Curta e Instantânea) prontas para persistência.

### 6. Painel de Tranquilidade (Dashboard de Cuidado)
*   **Propósito:** Visualizar as áreas da vida que estão protegidas (Família, Finanças, Saúde, etc.) e acompanhar as pendências com leveza.

### 7. Lista de Fundadores (Lista de Espera)
*   **Propósito:** Validação de tração de mercado. Permite que entusiastas deixem o email de contato para acesso prioritário ou de "Falta de Vagas".

### 8. Simulação de IA
*   **Interatividade:** Chat em tempo real conectado ao modelo de linguagem Gemini para que o usuário interaja e teste a precisão de sugestões e criação de listas de cuidado.

---

## 🛠️ Prontidão para Firebase
A estrutura de dados e os serviços do frontend foram construídos com objetos planos TypeScript e contextos locais persistentes no localStorage, desenhados para fácil mapeamento direto para o **Google Firestore** e o **Firebase Auth** em etapas futuras.
