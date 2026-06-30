# Master Architecture Review (MAR) — Mordomo.AI V2
**Autor:** Arquiteto-Chefe & CTO em Exercício
**Data:** 30 de Junho de 2026
**Status:** Concluído / Pronto para Avaliação de Investimento de Classe Mundial ($100M USD)

---

## 📈 DIAGNÓSTICO GERAL DE CLASSIFICAÇÃO

### Classificação A: Excelente (Não mexer agora)
*   **Camada de Memória Inteligente (`src/memory/`)**: Estrutura abstrata de 4 camadas extremamente robusta, separação lógica de preocupações (`MemoryService`, `MemoryContext`, `useMemory`) e modularização limpa.
*   **Identidade Visual e Proposta de Valor**: Conceito "Slate & Gold" com mascot animado, tom discreto, e proposta de valor clara focada em cuidado ao invés de mera produtividade.
*   **Onboarding Conversacional (`OnboardingFlow.tsx`)**: Substituição do formulário chato padrão por jornada baseada em valores humanos com login adiado (Value First, Auth Second).

### Classificação B: Bom (Melhorar depois)
*   **Serviço de IA (`src/services/geminiService.ts`)**: Estruturado e funcional, porém muito centralizado no cliente. Precisa ser transportado 100% para o backend (`server.ts`) para proteger tokens e regras de processamento contra engenharia reversa.
*   **constants.ts & types.ts**: Tipos e constantes altamente descritivos e organizados para os locais suportados, porém precisam de internacionalização do arquivo de strings completo por meio de biblioteca padrão (ex: `i18next`).

### Classificação C: Precisa refatorar (Prioridade de Limpeza)
*   **Acoplamento em `App.tsx`**: O arquivo principal contém mais de 1000 linhas de código agregando estados de visualização de UI, manipulação de áudio, conexão direta de Firebase Auth, e regras de navegação. Precisa de quebra cirúrgica em componentes modulares.
*   **Gerenciamento de Estados de Áudio e Fala**: A função de síntese de voz (`speak`) precisa de um Custom Hook ou service dedicado (`src/services/speechService.ts`) para lidar com ciclo de vida, suporte multiplataforma e estados nativos de reprodução.

### Classificação D: Erro estrutural
*   **Dependência de Chave de API no Client**: Algumas chamadas de IA direta no cliente expõem potenciais brechas se o empacotamento vazar variáveis. Todas as rotas de inferência devem passar de forma estrita pelo proxy seguro do Express `/api/chat`.

### Classificação E: Refazer completamente (Inexistente/Incompleto para o nível de $100M)
*   **Inexistência de testes automatizados**: Zero cobertura de testes unitários (`vitest`/`jest`) ou de integração para o cérebro da memória (`MemoryService.ts`). Um sistema de $100M exige cobertura acima de 90% nas heurísticas de classificação.

---

## 📋 SEÇÕES DE ANÁLISE ESTUDADA

### 1. Pontos Fortes
1.  **Visão Inovadora de Memória de Quatro Camadas**: O modelo resolve o problema clássico de limite de contexto de IA de forma elegante, dividindo dados por taxa de volatilidade (Permanente, Longa, Curta e Instantânea).
2.  **Onboarding de Alto Engajamento**: Capturar informações cruciais antes de forçar o cadastro de conta reduz fricção e gera alta taxa de conversão preliminar de leads.
3.  **Visual Premium Singular**: O distanciamento de temas genéricos azuis de SaaS e adoção de preto, ardósia profunda e toques de ouro evoca exclusividade e segurança.
4.  **Conformidade de Arquitetura de Dados com LGPD**: Concepção *Privacy by Design* enraizada na manipulação de dados sensíveis e possibilidade de autodestruição local/remota de informações.

### 2. Pontos Fracos
1.  **Monolito de Interface em `App.tsx`**: Dificulta a colaboração paralela de engenheiros no mesmo arquivo.
2.  **Inexistência de Cache de Estado Offline**: Sem Service Workers ou sincronização offline estruturada para momentos sem conexão.
3.  **Lógica de TTS (Text-to-Speech) no Navegador**: Uso da API nativa de SpeechSynthesis que varia drasticamente em sotaque e qualidade dependendo do dispositivo do usuário final.

### 3. Riscos Técnicos
1.  **Vazamento de Tokens/Instruções**: Engenharia de prompts vulnerável se o cliente interagir diretamente com a API do Gemini sem encapsulamento robusto no backend.
2.  **Sincronização de Concorrência de Memória**: Riscos de race conditions ao atualizar múltiplos nós de memória (Instantânea e Curta) simultaneamente durante interações rápidas.

### 4. Riscos de Produto
1.  **Promessas Tecnológicas Pré-Maturidade**: Mostrar funcionalidades simuladas pode gerar frustração caso a transição para a IA real não seja sutil e transparente.
2.  **Foco Diluído**: O mercado de IA possui excesso de ruído. Tentar abraçar gerenciamento financeiro, familiar, de tarefas e emocional no mesmo MVP pode sobrecarregar a mensagem de marketing.

### 5. Riscos de UX
1.  **Fadiga de Voz**: O áudio proativo (TTS) ligado por padrão pode ser irritante em locais públicos se o onboarding não capturar esse contexto imediatamente.
2.  **Navegação não intuitiva**: A transição entre telas institucionais e o console interativo precisa ser extremamente fluida e indolor em telas móveis de baixa resolução.

### 6. Riscos de Escalabilidade
1.  **Gargalo de I/O em Coleções do Firestore**: Atualizar múltiplos campos e subcoleções de memória a cada mensagem do chat pode estourar as quotas gratuitas do Firebase rapidamente sob milhões de usuários ativos simultâneos. Exige camada de cache (Redis) ou debouncing local de persistência.

### 7. Riscos Financeiros
1.  **Custo de Processamento de Tokens (LLM)**: O envio redundante de amplos blocos de memória permanente e de longo prazo a cada turno de conversação aumentará o custo de API. Precisa de otimização de sumarização.

### 8. Riscos Jurídicos (LGPD, Privacidade, Cookies, Dados)
1.  **Armazenamento de Dados de Terceiros**: Guardar informações sobre familiares (nomes de filhos, datas de aniversário, preferências de cônjuges) sem o consentimento direto desses terceiros infringe as regras estritas da LGPD/GDPR. O sistema precisa registrar que estes dados são guardados sob responsabilidade direta do titular da conta principal.
2.  **Consentimento Expresso**: Necessidade de manter logs auditáveis de consentimento de privacidade e termos de uso em banco de dados, protegendo a startup contra litígios.

### 9. Oportunidades de Crescimento
1.  **Integração de APIs de Calendar e Workspace**: Tornar o Mordomo o real orquestrador silencioso que gerencia reuniões e tarefas sem que o usuário abra o e-mail.
2.  **Modelos de Linguagem Locais (On-Device)**: Executar modelos ultra-leves diretamente no hardware do usuário para privacidade de 100% offline.

### 10. O que pode virar diferencial mundial
1.  **O "Cérebro" Proprietário de Camadas de Memória**: O algoritmo proprietário que decide de forma autônoma o que guardar, resumir ou deletar de forma inteligente e humana.

### 11. O que qualquer concorrente conseguiria copiar rapidamente
1.  **O design escuro sofisticado e a landpage de marketing**.

### 12. O que precisa ser extremamente difícil de copiar
1.  **Heurísticas de manutenção cognitiva da memória** e a integração fluida entre os hubs de hardware (iOS, Android, Web, IoT).

### 13. Quais funcionalidades devem sair do MVP
1.  **Vínculos avançados de APIs de terceiros não essenciais** (ex: automações de compras de e-commerce complexas).

### 14. Quais funcionalidades precisam entrar obrigatoriamente no MVP
1.  **Sincronização em Nuvem em tempo real criptografada**.
2.  **Histórico de Logs de Consentimento**.

### 15. O que ainda não faz sentido implementar
1.  **Pagamentos integrados para parceiros ou assistentes físicos reais** (concierges humanos).

### 16. Prioridade Absoluta das Próximas 10 Semanas
*   **Semanas 1-2**: Desmembramento completo de `App.tsx` em componentes modulares.
*   **Semanas 3-4**: Transposição estrita do `geminiService.ts` para endpoints de backend encapsulados.
*   **Semanas 5-6**: Integração do Firebase Auth e sincronização debounced de dados de memória no Firestore.
*   **Semanas 7-8**: Implementação de testes automatizados com 100% de cobertura lógica para heurísticas da Memória.
*   **Semanas 9-10**: Auditoria externa de segurança e testes de stress de concorrência.

---

## 📊 METRIC SCORECARD (0 - 10)

*   **Arquitetura:** 8.5/10 (Estrutura cognitiva de camadas de alto nível, porém acoplada na camada de visualização).
*   **UX (Experiência do Usuário):** 9.0/10 (Onboarding brilhante, focado em valores e com tom impecável).
*   **Design (Interface):** 9.5/10 (A estética slate-gold traz um refinamento de nível mundial e forte personalidade).
*   **Código:** 7.5/10 (Módulos de memória limpos, mas `App.tsx` monolítico precisa de refatoração urgente).
*   **Escalabilidade:** 8.0/10 (Preparado logicamente, mas necessita de debouncing e caches para evitar gargalo de I/O de dados).
*   **Segurança:** 7.0/10 (Privacidade bem pensada, mas chaves de API expostas em código de frontend precisam ser consolidadas no proxy seguro do backend).
*   **IA (Inteligência Artificial):** 8.5/10 (Regras de tom e personalidade muito bem direcionadas pelo prompt oficial).
*   **Retenção:** 8.0/10 (Proposta de briefing diário tem alto potencial de gerar engajamento diário recorrente).
*   **Monetização:** 8.5/10 (Roadmap inteligente com transição clara do gratuito para planos premium avançados).
*   **Globalização:** 9.0/10 (Suporte nativo a múltiplos mercados pré-configurados em arquivos de constantes).

### 🏆 NOTA GERAL: 8.35 / 10
*Status da Startup: Excelente oportunidade de investimento, necessitando apenas de saneamento de código e blindagem de segurança para escala global imediata.*

---

## 🏆 TOP 100 MELHORIAS (Ordenadas por Impacto)

### 🚨 SEGURANÇA E PRIVACIDADE (Impacto Máximo)
1.  Migrar totalmente as chaves e chamadas da API Gemini para rotas exclusivas e protegidas de backend (`/api/chat`).
2.  Criar rota segura de exclusão permanente de conta no Firebase Auth que remova todos os dados do usuário no Firestore (`clearUserData`).
3.  Criptografar campos confidenciais da Memória Permanente e Longa (nomes, e-mails de família) antes do envio ao Firestore usando criptografia AES client-side.
4.  Inserir consentimento expresso em formato de caixas de marcação ativas (opt-in) nas telas de privacidade, salvando o hash de consentimento do usuário.
5.  Criar barreira de dados que impeça o salvamento de documentos identificáveis de terceiros sem a declaração de custódia pelo usuário principal.
6.  Bloquear tentativas de injeção de prompt (Prompt Injection) sanitizando todo texto enviado via console de entrada.
7.  Implementar limitação de taxa (Rate Limiting) no servidor Express para evitar sobrecarga de consultas à API do Gemini por robôs.
8.  Criar política estrita de Cookies com banner adaptável às leis do país detectado via IP.
9.  Configurar rota segura `/api/export-data` que consolide e entregue um arquivo JSON estruturado de memória de forma instantânea para fins de portabilidade de dados.
10. Validar tokens de autorização (Firebase ID Tokens) em cada requisição de endpoint do backend de forma criptográfica.

### 📦 REESTRUTURAÇÃO DE ARQUITETURA E CLEAN CODE (Impacto Altíssimo)
11. Dividir `src/App.tsx` em submódulos de UI (componentes de Header, Hero, Console, Dashboard).
12. Criar hook especializado `useSpeech.ts` para isolar todo o gerenciamento de estados, voz e falas ativas.
13. Implementar testes unitários para a heurística de memória inteligente em `MemoryService.test.ts`.
14. Migrar strings fixas e constantes de idioma para sistema de tradução formal (`i18next`).
15. Implementar barreira de controle de ciclo de vida (`React.memo` / `useMemo`) nas listas do dashboard de controle para evitar re-renders desnecessários.
16. Unificar as interfaces de `UserProfile` entre os arquivos `src/types.ts` e `src/memory/types.ts`.
17. Mover as simulações e dados fictícios de mercado para arquivos específicos de sementes (`/seeds/`).
18. Isolar a lógica de conexão de dados do Firebase em repositórios dedicados (`UserRepository`, `MemoryRepository`).
19. Remover imports absolutos legados e padronizar rotas relativas limpas de TypeScript.
20. Configurar logs estruturados de auditoria de alterações em memória em desenvolvimento.

### 📱 EXPERIÊNCIA DO USUÁRIO & RETAINMENT (Impacto Alto)
21. Adicionar micro-interações de feedback tátil e sonoro sutil ao clicar em elementos chave em dispositivos móveis.
22. Adicionar animações de transição de rota suaves (staggered animations) usando a biblioteca `motion`.
23. Permitir pausa e silenciamento permanente do mascot com apenas um toque no cabeçalho em todas as telas.
24. Criar esqueleto de carregamento elegante (Skeleton Loader) para simulações de geração de briefing por IA.
25. Implementar modo de acessibilidade de alto contraste e redimensionamento dinâmico de fontes.
26. Customizar o avatar do mascot com variações sutis baseadas na categoria do briefing em foco.
27. Criar sistema de conquista visual secreta ao fechar todas as missões semanais (Gamificação do Cuidado).
28. Adicionar atalhos de teclado ágeis para navegação do console em desktops.
29. Implementar barra de busca de contexto histórica para a camada de Memória Longa do usuário.
30. Desenvolver notificações sutis e elegantes no aplicativo para atualizações importantes do sistema.

### ⚡ PERFORMANCE E OTIMIZAÇÃO (Impacto Médio-Alto)
31. Configurar Code Splitting e Lazy Loading nos componentes pesados de interface (como o Dashboard e Onboarding).
32. Otimizar tamanho de pacote de fontes importadas por meio de arquivos WOFF2 comprimidos.
33. Comprimir todas as imagens e ícones do ecossistema para formatos de nova geração (WebP / SVG).
34. Implementar debouncing de salvamento de estado de memória curta em localStorage e banco.
35. Configurar cache agressivo de ativos estáticos por meio do arquivo de configuração do Express.
36. Reduzir o overhead do bundle de compilação expurgando dependências não utilizadas da raiz.
37. Implementar compressão GZIP/Brotli ativa no tráfego de saída do servidor web.
38. Criar rotinas assíncronas em segundo plano para o processamento de manutenção de memória antiga (`MemoryService.runMemoryMaintenance`).
39. Otimizar a árvore de componentes React reduzindo níveis desnecessários de aninhamento de Providers.
40. Monitorar Web Vitals críticos (LCP, FID, CLS) diretamente pelo console de desenvolvimento.

### 🌐 GLOBALIZAÇÃO E ADAPTABILIDADE (Impacto Médio)
41. Adicionar suporte completo para tradução em espanhol (es-LATAM) em todas as camadas e prompts.
42. Automatizar a detecção de fuso horário local para agendamento preciso de lembretes e missões diárias.
43. Adaptar formatos de datas, moedas e calendários dinamicamente ao locale selecionado de forma nativa.
44. Traduzir as heurísticas do `MemoryService` para que palavras em inglês também ativem gatilhos de armazenamento.
45. Ajustar a velocidade padrão da voz do TTS baseada nas preferências culturais de idioma.
46. Integrar APIs de geolocalização segura para adaptar serviços sugeridos às regras regulatórias locais.
47. Homologar os textos legais de privacidade para as leis específicas de cada território internacional ativo.
48. Criar chaves de afiliado dinâmicas de múltiplos países de forma automática para monetização transfronteiriça.
49. Testar responsividade e renderização de caracteres especiais de outros alfabetos nos cabeçalhos.
50. Oferecer alteração rápida de idioma visível nas preferências do rodapé.

### 🤖 INTELIGÊNCIA ARTIFICIAL & MODELOS (Impacto Médio)
51. Atualizar o SDK do Gemini para a versão mais recente e estável suportada (`@google/genai`).
52. Adicionar detecção de sentimentos sutil na mensagem do usuário para ajustar o nível de empatia do tom de voz.
53. Implementar validação de saída estruturada usando JSON Schema nativo nas respostas de IA do backend.
54. Criar rotina de fallback caso a API de IA falhe, oferecendo respostas prontas de alta utilidade humana.
55. Desenvolver sistema de "Few-Shot Prompting" no backend para calibrar a precisão das decisões do `MemoryService`.
56. Limitar estritamente o tamanho das mensagens enviadas ao modelo para evitar estouro de orçamento de tokens.
57. Criar base de conhecimento vetorial local para indexar termos comuns do ecossistema de cuidados de saúde e segurança.
58. Permitir que o usuário avalie com joinha (Upvote/Downvote) as respostas e sugestões da IA para aprendizado local.
59. Programar o mascot para mudar de expressão corporal ao sugerir lembretes mais importantes ou sonhos próximos.
60. Isolar as instruções de sistema em templates YAML fáceis de editar sem alterar códigos JS/TS.

### ☁️ INFRAESTRUTURA E CLOUD (Impacto Médio-Baixo)
61. Desenvolver arquivos Dockerfile otimizados para contêineres Docker de produção de baixo consumo.
62. Configurar orquestração local de desenvolvimento usando docker-compose.
63. Configurar caminhos lógicos para migração futura de dados do Firestore para bancos relacionais na AWS (PostgreSQL / RDS).
64. Preparar arquivos de configuração de deploy rápido para plataformas de nuvem escaláveis.
65. Estabelecer rotinas automáticas de backup de segurança diárias criptografadas para as bases do Firestore.
66. Configurar monitoramento básico de integridade de endpoints de API (Health Check).
67. Criar regras de balanceamento de carga para gerenciar picos de tráfego repentinos.
68. Habilitar HTTPS estrito e cabeçalhos avançados de segurança (Helmet) no servidor Express.
69. Estabelecer ambientes espelhados de Homologação (Staging) e Produção isolados.
70. Configurar esteiras simples de Integração e Entrega Contínuas (CI/CD).

### 💼 ESTRUTURA DE NEGÓCIOS & MONETIZAÇÃO (Impacto Médio-Baixo)
71. Integrar portal de faturamento Stripe nativo e invisível para upgrade de planos na conta.
72. Implementar controle rigoroso de limites de requisições de IA para contas da camada gratuita (Free Tier).
73. Criar painel de controle simples de afiliados para monitorar cliques em sugestões e links gerados.
74. Adicionar tags de rastreamento de marketing em conformidade com as regras de privacidade e exclusão.
75. Implementar checkout simplificado de um clique (1-Click Checkout) para o plano de apoio inicial.
76. Desenvolver cartões interativos de recomendação de parceiros com opções de descarte ou salvamento.
77. Criar cupom de desconto exclusivo de fundadores acionado por tempo de tela.
78. Estruturar o banco para suportar faturamento por uso (Metred Billing) em fases futuras.
79. Oferecer faturas detalhadas e relatórios de uso de IA mensais para planos corporativos.
80. Criar sistema interno de cupons de indicação de amigos que destravem limites maiores de memória curta.

### 📱 CLIENTES NATIVOS - ANDROID / IOS / DESKTOP (Impacto Baixo)
81. Desenvolver manifestos de aplicativo PWA (Progressive Web App) completos para instalação rápida na tela do celular.
82. Configurar cores e splash screens nativas para sistemas operacionais mobile.
83. Garantir suporte perfeito de toque e gestos de arrastar no carrossel de missões e dashboard.
84. Preparar wrappers leves (Capacitor / Cordova) para validação preliminar nas lojas de apps.
85. Otimizar viewport de tela impedindo zoom acidental de inputs em navegadores nativos do iOS (Safari).
86. Utilizar fontes do sistema como fallback nativo para ganho de velocidade de pintura inicial.
87. Prevenir travamento do áudio do TTS quando o aplicativo for minimizado ou a tela bloqueada.
88. Criar suporte básico a atalhos de toque longo (Haptic Shortcuts) no ícone do PWA na tela inicial.
89. Testar renderização de fontes e escala de botões em tablets e telas ultra-grandes de desktop.
90. Oferecer opção de fechar o app local de forma nativa por comandos do sistema operacional.

### 🛠️ MANUTENIBILIDADE, CI/CD E QUALIDADE (Impacto Baixo)
91. Configurar regras rígidas de ESLint para garantir consistência no uso de hooks e tipagens complexas.
92. Automatizar testes de regressão visual para garantir que novos componentes não quebrem o design.
93. Criar arquivo de contribuição do projeto (`CONTRIBUTING.md`) para onboarding de novos programadores na startup.
94. Implementar barreira contra dead-code ativando regras de remoção de variáveis não utilizadas no build do compilador.
95. Separar dados estáticos de configuração visual do mascot de comportamentos lógicos funcionais.
96. Configurar relatórios detalhados de cobertura de código a cada pull request.
97. Monitorar vazamentos de memória (Memory Leaks) em ouvintes de estados de áudio e conexões Firestore.
98. Unificar scripts de compilação em pacotes de scripts claros e padronizados.
99. Utilizar pre-commit hooks (Husky) para impedir a inclusão de códigos com erro no repositório.
100. Estabelecer esteiras automáticas de revisão de vulnerabilidades em dependências npm (npm audit).
