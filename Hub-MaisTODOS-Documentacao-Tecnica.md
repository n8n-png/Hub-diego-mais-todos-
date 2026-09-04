# Hub MaisTODOS, documentação técnica do projeto

**Versão 1.1 · 03/09/2026**
Documento de handoff para o time de desenvolvimento. Consolida a reunião de escopo com a Adabtech, o documento de visão do produto e o inventário técnico do protótipo, verificado no código e no banco.

| Campo | Valor |
| --- | --- |
| Produto | Hub MaisTODOS |
| Domínio definido | `hub.maistodos.com.br` |
| Product owner e demandante | Diego Daniel Torini, MaisTODOS, Técnico de App CX/CS |
| Responsável técnico | Matheus Torquato, Adabtech |
| Apoio interno | Levantamento de regras de negócio, Infra e TI MaisTODOS, time de Segurança |
| Protótipo de origem | Lovable, publicado em `mais-todos-hub.lovable.app`, commit `f0eed254` |
| Estado do protótipo | Navegável, base de conhecimento e acessos reais, operação em dados fictícios |
| Prazo alvo | Plataforma rodando para validação dos times até o fim do mês corrente |

## Como usar este documento

As seções 1 a 3 dizem o que é o produto e o que já está decidido. A seção 4 é o inventário do que existe hoje, e é a resposta para "o que eu ganho de graça". A seção 5 é a mais importante para planejar: separa o que se aproveita do que precisa ser reescrito. Da seção 6 em diante é construção: arquitetura alvo, dados, integrações, requisitos aba a aba, backlog e faseamento.

Tudo que este documento afirma sobre o banco foi lido do banco. Tudo sobre o código foi lido do código, no commit citado. O que não foi verificado está marcado como a confirmar, com o nome de quem confirma. Nenhuma credencial aparece aqui.

---

## 1. Problema e objetivo

Hoje o atendimento abre de três a quatro sistemas diferentes para resolver o caso de um único cliente. Isso alonga o tempo de resposta, aumenta a curva de aprendizado de quem entra e espalha o processo. Em paralelo, o conhecimento operacional de cada setor fica descentralizado, então quem precisa de uma resposta rápida sobre outro time depende de perguntar para alguém.

O Hub resolve os dois lados com uma plataforma só:

- **Operação em uma tela.** O atendente resolve o caso do filiado sem trocar de sistema, com ação auditada.
- **Conhecimento centralizado.** Qualquer colaborador consulta rotinas, processos, fluxos e materiais de qualquer setor, de forma autônoma.

Na segunda fase, a plataforma evolui para uma ferramenta de CRM de atendimento.

**Times atendidos:** Crédito PF, Conta Digital, Pagamentos, Logística, App e Cashback. O piloto é modelado sobre o time de **App**, que é onde o demandante atua e tem domínio do processo. Os demais entram depois, por levantamento com cada squad.

---

## 2. Decisões fechadas

Decisões da reunião de escopo entre Adabtech e MaisTODOS, mais as decisões de produto já tomadas ao longo da construção do protótipo. Não reabrir sem falar com o responsável indicado.

| Tema | Decisão | Quem decidiu |
| --- | --- | --- |
| Plataforma de desenvolvimento | Sair do Lovable. O código exportado é ponto de partida, não o produto. | Reunião de escopo |
| Repositório | GitHub oficial da MaisTODOS, privado, colaboradores por convite. Consolidar o repositório avulso que já foi publicado. | Reunião de escopo |
| Hospedagem | Dokploy da MaisTODOS, com ambiente de homologação e de produção. | Reunião de escopo |
| Banco de dados | Banco próprio da MaisTODOS, provisionado pela Infra. Sem serviço externo. | Reunião de escopo |
| Domínio | `hub.maistodos.com.br`. | Diego |
| Segurança | Seguir o documento de segurança da TI MaisTODOS, mesmo padrão dos demais sistemas. Isso dispensa o ciclo de validação externa do protótipo. | Reunião de escopo |
| Permissões | Derivadas automaticamente do **Convenia**, por setor e nível hierárquico. Sem configuração manual como regra. | Reunião de escopo |
| Escopo do MVP | Foco em **N1**, que atende o filiado diretamente. N2 e N3 ficam em standby, porque hoje o fluxo deles corre no Jira. | Reunião de escopo |
| Identidade do assistente | Aplicar a identidade visual da **Maísa**, o chatbot da MaisTODOS. | Reunião de escopo |
| Conteúdo x operação | Conteúdo é didático e aberto a todo colaborador autenticado do domínio. Operação é restrita por papel, com trava no servidor. | Diego, 31/08 |
| Ação sensível | Toda escrita passa por confirmação explícita com justificativa obrigatória e registro em trilha. | Diego |
| Validação de identidade do filiado | Continua humana, feita pela equipe. Nada de visão por IA. | Diego |
| Marca | Marca MaisTODOS aplicada de forma estrita, com arquivos oficiais de logo. | Diego |

---

## 3. Escopo do MVP

**Entra:**

1. Login Google restrito ao domínio corporativo, com habilitação por usuário.
2. Permissão automática por setor e nível, vinda do Convenia, com tela de exceção e auditoria de quem tem o quê.
3. Base de conhecimento por time, com sincronização via API do Notion.
4. Módulo operacional do time de App: busca de filiado por CPF, pendências do filiado, liberação de cashback e alteração de dados cadastrais.
5. Trilha de auditoria com motivo, link e número do chamado.
6. Assistente conectado à base de conhecimento, com a identidade da Maísa.

**Fica fora do MVP, explicitamente:**

- Painel N2 e o fluxo de N3, que hoje correm no Jira. O campo de definição de N2 que existe no protótipo fica em standby.
- Os demais seis times. Entram por levantamento, depois que o modelo do App estiver funcionando.
- Evolução para CRM de atendimento.
- Triagem de tickets por IA. A triagem é manual pelo atendente, por decisão de produto.

---

## 4. Estado atual: o que existe no protótipo

Verificado no commit `f0eed254` e no banco, em 02/09/2026.

### 4.1 Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | TanStack Start com SSR, React, TypeScript |
| Build | Vite |
| Estilo | Tailwind CSS com tokens em oklch, shadcn/ui |
| Roteamento | TanStack Router, com rotas em arquivo e layout `_authenticated` |
| Banco | PostgreSQL gerenciado, com `pgvector` |
| Autenticação | Supabase Auth, Google e senha |
| IA | Embeddings `text-embedding-3-small` e chat `gemini-3.6-flash`, por gateway da plataforma |
| Servidor | Entrada própria em `src/server.ts`, com tratamento de erro e cabeçalhos de segurança |

### 4.2 Rotas

**Públicas:** `/` e `/auth`.

**Autenticadas, camada de conteúdo, abertas a qualquer colaborador do domínio:**
`/dashboard`, `/universidade`, `/base` (aceita `?q=`), `/processos`, `/fluxogramas`, `/scripts`, `/faq`, `/downloads`, `/progresso`, `/perfil`, `/configuracoes`.

**Operação, guia por área, em modo consulta aberto:**
`/operacao`, `/operacao/{area}`, e dentro de cada área: `comercial` (com segmento e regional), `comunicados`, `ferramentas`, `financeiras`, `fluxo`, `fluxos`, `materiais`, `onboarding`, `processos`, `reprovacoes`.

**Operação, execução, restrita por papel:**
`/atendimento/filiados`, `/atendimento/cashback`, `/atendimento/estornos`, `/atendimento/carteirinhas`, `/atendimento/n2`, `/atendimento/auditoria`.

**Gestão e administração:** `/gestor`, `/acessos`, `/central-ia`.

### 4.3 Componentes que carregam regra de produto

Estes não são enfeite: são a padronização que evita que cada tela invente a própria regra. Vale reimplementar o conceito, mesmo trocando a stack.

| Componente | O que faz |
| --- | --- |
| `AcaoSensivel` | Padrão único de escrita: mostra o preview do payload, exige justificativa com mínimo de caracteres, exige confirmação explícita e grava a trilha. Os quatro módulos de escrita usam este mesmo componente, sem reimplementação. |
| `GuardaOperacional` | Guarda único de rota. Cada rota declara apenas o módulo, e o guarda decide. Bloqueia acesso por URL direta. |
| `AcessoRestrito` | Tela única de acesso negado. |
| `AppLayout`, `OperacaoShell`, `AtendimentoShell` | Cascas de navegação, com a sidebar filtrada pelo que a pessoa pode operar. |
| `BuscaFiliadoCpf` | Busca por CPF com e sem máscara, com estados de vazio e carregando. |
| `CabecalhoFiliado`, `TabelaAtendimento`, `BadgeStatus`, `EstadoVazio`, `Carregando`, `AvisoDadoFicticio` | Vocabulário visual comum dos módulos de atendimento. |
| `ChatFlutuante` | Assistente global, arrastável, com posição persistida. Único ponto de acesso ao assistente. |
| `FontesConhecimento` | Aba de fontes da base: documentos, Notion e base da plataforma. |
| `ConsumoTokens` | Painel de consumo de IA, por tipo e por período. |
| `MatrizPermissoes` | Matriz de papel por módulo, na tela de acessos. |

### 4.4 Modelo de dados atual

Dez tabelas no schema público, todas com RLS habilitado.

| Tabela | Conteúdo | Escrita pelo cliente |
| --- | --- | --- |
| `profiles` | Perfil do usuário: id, nome, e-mail. Criada por gatilho no cadastro. | Só o próprio |
| `user_roles` | Papel por usuário. Enum `app_role`. | Nenhuma |
| `user_area_access` | Permissão de operar por área. | Nenhuma |
| `kb_documents` | Documento da base: título, conteúdo, tipo, status, versão, categoria, origem Notion | Só administrador |
| `kb_chunks` | Trechos com embedding vetorial | Só administrador |
| `kb_categories` | Categorias da base | Só administrador |
| `kb_document_versions` | Histórico de versões | Só administrador |
| `atendimento_auditoria` | Trilha de ações sensíveis | Só inserir a própria ação |
| `ai_queries` | Perguntas ao assistente e se houve resultado | Só inserir a própria |
| `ai_usage` | Consumo de tokens por tipo e modelo | Nenhuma, só servidor |

**Papéis existentes:** `admin`, `gestor`, `colaborador`, `atendimento_n1`, `atendimento_n2`.

**Áreas de operação existentes:** `credito-pf`, `conta-digital`, `pagamentos`, `logistica`, `app`, `cashback`, e a liberação interna `app_n2`.

**Funções de banco:**

| Função | Tipo | O que faz |
| --- | --- | --- |
| `has_role(uuid, app_role)` | definer, `search_path` fixo | Checagem de papel usada por toda policy, isolada para não recursionar |
| `handle_new_user()` | definer | Cria a linha em `profiles` no cadastro |
| `enforce_corporate_email_domain()` | definer | Recusa cadastro fora do domínio corporativo |
| `expurgar_dados_ia_antigos()` | definer | Expurgo de 12 meses em `ai_queries` e `ai_usage` |
| `match_kb_chunks(vector, int)` | definer | Busca vetorial, filtra documento ativo internamente |
| `search_kb_chunks_text(text, int)` | definer | Busca textual em português, filtra documento ativo |
| `update_updated_at_column()` | comum | Carimbo de atualização |

**Gatilhos:** `enforce_corporate_email_domain` em INSERT e em UPDATE de `auth.users`, `on_auth_user_created` para criar o perfil, e três de `updated_at`.

**Storage:** três buckets privados, `kb-files`, `kb-imagens` e `avatars`.

### 4.5 Modelo de acesso atual

O protótipo já implementa o conceito em três camadas, com a fonte única em `src/data/permissoes.ts`:

1. **Fonte única.** O arquivo declara os nove módulos operacionais, o grupo de cada um, quem opera e a liberação alternativa por área. A função `podeOperar(modulo, papeis, areas)` é a única regra de decisão.
2. **Guarda de rota.** `GuardaOperacional` envolve os shells, então cada rota só declara o módulo. Cobre acesso por URL direta.
3. **Trava no servidor.** Funções de escrita validam papel com `has_role`, e a RLS acompanha.

Os nove módulos operacionais hoje são: Gerenciamento de Filiados, Cashback, Estornos, Carteirinhas, Painel N2, Auditoria, Painel do Gestor, Gestão de acessos e Publicar ou treinar a base.

**Este modelo muda no produto final**, porque a fonte do papel passa a ser o Convenia. Ver a seção 6.4.

### 4.6 Base de conhecimento e assistente

Funciona de ponta a ponta, e é a parte mais madura do protótipo.

- **Alimentar:** administrador sobe documento ou arquivo em `/central-ia`, o conteúdo vira `kb_documents`, é fatiado em trechos, cada trecho recebe embedding e vai para `kb_chunks`.
- **Notion:** integração real, multi workspace, lendo os tokens da variável `NOTION_TOKENS` no servidor. Percorre os workspaces, tolera falha isolada, faz upsert por identificador da página e evita reprocessar página não alterada. **Pendente:** os tokens ainda não foram entregues pelos administradores de cada workspace do Notion.
- **Consultar:** o assistente busca por similaridade, responde apenas com base nos documentos, cita fonte, versão e data, registra a pergunta e o consumo de tokens, e sugere onde resolver dentro da plataforma.
- **Medição:** consumo real de tokens é registrado por tipo de operação e exibido em painel, com custo estimado.

### 4.7 Auditoria atual

A trilha grava quem executou, o quê, quando e com qual justificativa. O payload passa por uma função central de sanitização antes de gravar, então CPF e e-mail não vão completos. A tabela aceita apenas inserir e ler, nunca alterar ou apagar.

**Limitação conhecida e assumida:** a gravação hoje acontece no navegador. A política impede gravar em nome de terceiro e impede apagar, mas o conteúdo vem do cliente e alguém com o console aberto pode bloquear o registro. **No produto final a gravação tem que acontecer no servidor, na mesma transação da execução da ação.** Ver a seção 10.

### 4.8 Segurança já endurecida no protótipo

Correções aplicadas entre 31/08 e 02/09, verificadas. Servem de checklist para não regredir na reconstrução:

- Cadastro travado no domínio corporativo por gatilho no banco, o que cobre também o login por Google.
- Confirmação de e-mail ativa.
- Removida a função de auto promoção a administrador.
- `user_roles` sem nenhuma policy de escrita.
- Policies permissivas em trechos e categorias substituídas por filtro herdado do documento.
- Payload de auditoria e registros de IA sanitizados.
- `GRANT` amplo revogado, sem `TRUNCATE` para papel de cliente, e nenhum privilégio para papel anônimo.
- Cabeçalhos de segurança na resposta HTTP.
- Extensão de navegador sem permissão ampla.

### 4.9 Marca

Aplicada e verificada no ar. Roxo `#7600D6` como cor principal e estrutural, verde `#54B900` apenas para sucesso e conquista, branco e neutros claros, fundo escuro em roxo `#22023C`, nunca preto. Proporção aproximada de 70 branco, 20 roxo e 10 verde. Tipografia **Lexend**. Logos sempre do arquivo oficial, guardados em `src/assets/brand/`, nunca recriados. Na escrita: nada de travessão nem meia-risca, acentuação correta, sem emoji.

### 4.10 Extensão de navegador

Existe em `extension/`, empacotada em `public/maisia-copiloto.zip`. Abre um painel lateral com o assistente e oferece menu de contexto sobre texto selecionado. Hoje aponta para a aplicação de origem do remix, não para o Hub. Não é escopo do MVP, mas o código está no repositório e o time precisa saber que ele existe.

---

## 5. Reaproveitável e a refazer

A tabela mais importante para planejar a reconstrução.

| Item | Situação | Recomendação |
| --- | --- | --- |
| Telas, navegação e fluxo de uso | Aproveitável | Portar. É onde está o maior valor acumulado, com jornada já validada em uso. |
| Design system, tokens e marca | Aproveitável | Portar como está. Já verificado no ar e aderente à marca. |
| Componentes de regra (`AcaoSensivel`, `GuardaOperacional`) | Aproveitável como conceito | Reimplementar mantendo o contrato, inclusive a justificativa obrigatória. |
| Modelo de acesso em `permissoes.ts` | Aproveitável como conceito | Manter a ideia de fonte única e de guarda por módulo, trocando a origem do papel para o Convenia. |
| Modelo de dados da base de conhecimento | Aproveitável | Portar o desenho de documento, trecho, categoria e versão. Ele funciona. |
| Fluxo de embeddings e busca | Aproveitável como referência | O desenho é bom. A implementação depende do gateway da plataforma antiga e precisa apontar para o provedor que a MaisTODOS escolher. |
| Integração com o Notion | Aproveitável como referência | A lógica de multi workspace, upsert por página e dedupe por data de edição economiza trabalho. Reescrever no novo backend. |
| **Backend, autenticação e RLS** | **Refazer** | Está amarrado ao Supabase e ao gateway da plataforma. Sai tudo: autenticação, autorização, funções de servidor e políticas de banco. |
| **Camada de dados operacionais** | **Refazer** | Hoje é mock em arquivo. Vira integração real. |
| Gravação da auditoria | Refazer | Tem que sair do navegador e ir para o servidor. |
| Migrations | Não confiar | O projeto nasceu de remix, e as migrations não descrevem o schema completo. Use o dump de políticas anexo como referência do estado real. |

---

## 6. Arquitetura alvo

### 6.1 Infraestrutura

| Camada | Definição |
| --- | --- |
| Repositório | GitHub oficial MaisTODOS, privado. Consolidar os repositórios avulsos antes de qualquer desenvolvimento paralelo. |
| Deploy | Dokploy MaisTODOS, com homologação e produção separadas. |
| Banco | PostgreSQL próprio da MaisTODOS, provisionado pela Infra. Requer a extensão `pgvector` para a busca semântica. |
| Domínio | `hub.maistodos.com.br`. Certificado gerenciado pela Infra. |
| Autenticação | Google Workspace restrito ao domínio corporativo, mais camada de autorização própria alimentada pelo Convenia. |
| Segredos | Cofre do ambiente. Nenhuma credencial em arquivo versionado. |

### 6.2 Fronteira de confiança

Esta é a regra que precisa sobreviver à mudança de stack, porque foi o ponto mais atacado na revisão de segurança do protótipo.

1. **Navegador.** Renderiza e esconde o que a pessoa não pode operar. Não é controle de segurança, é experiência de uso.
2. **Servidor.** Autentica, confere o papel e só então usa credencial privilegiada. Toda chamada a sistema externo sai daqui.
3. **Banco.** Última fronteira. Se um controle não existe aqui, ele não existe.
4. **Integrações.** Nenhum token de sistema externo chega ao navegador, em nenhuma hipótese.

**Requisito duro:** o navegador nunca fala direto com banco nem com API de parceiro. No protótipo isso era mitigado por RLS porque a chave publicável ia para o navegador. No produto final, com backend próprio, a regra é mais simples: o front conversa apenas com a API do Hub.

### 6.3 Autenticação

- Login Google restrito ao domínio corporativo.
- **Domínio não basta.** Além de ser do domínio, o usuário precisa estar habilitado. Hoje o protótipo libera qualquer e-mail do domínio, e isso precisa ser fechado.
- Liberação de exceção, por exemplo um N3 que precise acessar, é feita pelo administrador liberando o e-mail, não por configuração manual de permissão.
- A validação de domínio precisa existir no servidor e no banco, não apenas no formulário. Validação de formulário não protege nada, e o login social cria o usuário por outro caminho.

### 6.4 Autorização pelo Convenia

Mudança central em relação ao protótipo.

- O Convenia já é a fonte oficial de RH e traz **área ou setor** e **nível hierárquico N1, N2, N3**.
- Ao entrar, a pessoa recebe permissão automaticamente: quem é de Logística enxerga Logística, quem é de Crédito enxerga Crédito. Sem setup manual.
- A tela de gestão de acesso continua existindo, agora para três coisas: exceção, override e auditoria de quem tem o quê.
- Mapear setor do Convenia para área do Hub, e nível hierárquico para papel operacional. Guardar o vínculo com a origem, para saber se a permissão veio do Convenia ou de exceção manual.
- Definir a política de sincronização: no login, periódica, ou por webhook. **A confirmar com quem opera o Convenia.**

O conceito que precisa sobreviver: **conteúdo é aberto a todo colaborador autenticado, operação é restrita.** A permissão derivada do Convenia governa a operação, não o acesso ao conteúdo didático.

### 6.5 Segurança

O desenvolvimento segue o documento de segurança da TI MaisTODOS. Além dele, estes pontos vêm da revisão do protótipo e valem como requisito:

- Nenhum privilégio para usuário anônimo em nenhuma tabela.
- Papel de usuário nunca é escrito pelo cliente. Toda concessão passa por função de servidor que valida administrador.
- Nenhum caminho de auto promoção. Se existir bootstrap de primeiro administrador, ele é removido depois do primeiro uso.
- Conteúdo arquivado não vaza por tabela filha. Toda tabela filha repete o filtro de status do pai.
- Função que contorna a política de acesso filtra por conta própria.
- Trilha de auditoria imutável: apenas inserir e ler.
- Dado pessoal mascarado no que é gravado, principalmente em trilha e em registro de IA.
- Retenção definida para dado operacional de IA. Hoje são 12 meses. **O prazo de guarda da trilha de auditoria continua pendente de definição jurídica.**
- Cabeçalhos de segurança na resposta, incluindo `Content-Security-Policy` com `frame-ancestors` e `X-Frame-Options`.

**Ponto que o domínio próprio resolve.** No protótipo, a camada de borda da hospedagem remove os cabeçalhos que impedem o enquadramento em iframe, o que deixa a aplicação exposta a clickjacking sobre ações de atendimento. Medido e confirmado. Com o Hub em `hub.maistodos.com.br`, atrás da infraestrutura da MaisTODOS, os cabeçalhos passam a valer. **Este ponto precisa estar fechado antes de qualquer integração real**, porque é quando a ação induzida passa a produzir efeito em sistema produtivo.

---

## 7. Modelo de dados alvo

Ponto de partida sugerido, herdando o que funciona e acrescentando o que o novo modelo exige.

**Identidade e acesso**

- `usuarios`: identidade local espelhada do Google, com estado de habilitação.
- `usuario_papeis`: papel por usuário, com origem (`convenia` ou `excecao`) e data de sincronização.
- `usuario_areas`: área de operação liberada, com a mesma marcação de origem.
- `convenia_sync`: registro de cada sincronização, para auditar de onde veio cada permissão.

**Conhecimento**

- `documentos`, `documento_trechos` com vetor, `categorias`, `documento_versoes`. Mesmo desenho de hoje.
- Manter o campo de origem e o identificador da página do Notion, que é o que permite upsert sem duplicar.

**Operação e trilha**

- `auditoria`: usuário, módulo, ação, alvo mascarado, **motivo, link do chamado, número do chamado**, payload sanitizado, resultado da execução e data. Apenas inserir e ler.
- `ia_consultas` e `ia_consumo`: como hoje, com política de expurgo.

**Regra:** toda tabela nasce com política de acesso definida. Nenhuma tabela entra em produção com liberação ampla "para resolver depois".

---

## 8. Integrações

Este é o trabalho de bastidor que destrava tudo. **Nenhuma credencial de API foi obtida até o momento.** Enquanto isso não avança, a plataforma continua sendo uma casca navegável com dados fictícios.

### 8.1 Catálogo

| Sistema | Uso no Hub | Situação |
| --- | --- | --- |
| **Convenia** | Fonte de RH: setor e nível, para permissão automática | Já é fonte oficial em outros sistemas MaisTODOS, integração viável |
| **Notion** | Base de conhecimento, hoje exportada à mão | API conhecida, código de referência pronto. Falta o token de cada workspace |
| **Jira** | Chamados técnicos e fluxo de N2 | API conhecida |
| **Zendesk** | Portal de chamados e atendimento ao cliente | A confirmar |
| **Metabase** | Banco central de consulta: filiados, transações e campanhas | A confirmar. Consulta por `POST /api/dataset` com chave de API |
| **Motor** | Consulta de transações do time de App | A confirmar |
| **Softnex** | Consulta de PL e carteirinhas vinculadas | A confirmar. Sem endpoint definido |
| **Retool** | Onde hoje se executa liberação de cashback e alteração de dados | A confirmar. Pode ser substituído pelo Hub |
| **MaisCash e MaisCash 2.0** | Dados de parceiros e cashback | A confirmar |
| **Univers** | Cadastro e gestão de filiados na parceira Raia e Drogasil | A confirmar. Sem endpoint definido |
| **Adyen** | Transações financeiras, incluindo cartas de cancelamento | A confirmar |
| **Awin** | Transações de lojas online | A confirmar |
| **Rakuten** | Transações de lojas online | A confirmar |
| **Mixpanel** | Jornada do usuário, relevante para N2 e N3 | Fase posterior |
| **Maísa** | Identidade visual do assistente | Solicitar material ao responsável pelo chatbot |

**Ordem sugerida de ataque:** Convenia, Notion e o sistema de cashback. São os três que destravam, respectivamente, permissões, conteúdo e a primeira operação real.

### 8.2 Correções de nomenclatura

A transcrição da reunião trouxe alguns nomes distorcidos. Os corretos são:

| Na transcrição | Correto |
| --- | --- |
| MyCash, MyCash 2.0 | **MaisCash** e **MaisCash 2.0** |
| Universe | **Univers** |
| Adem | **Adyen** |
| Motor Softnex, como um sistema | São **dois sistemas**: Motor, para transações do App, e Softnex, para PL e carteirinhas |

### 8.3 O que já está levantado tecnicamente

Levantado a partir das coleções usadas hoje pelo N1 do time de App. Serve de ponto de partida, e precisa ser reconfirmado com o dono de cada sistema. **Credenciais não constam deste documento e devem ser solicitadas e guardadas no cofre do ambiente.**

**Busca de filiado**
`GET https://api.cartaodetodos.com.br/api/filiado/{cpf}/ctn`, autenticação por token de portador.

**Support API**, base `https://wallet.maistodos.com.br/api/`, autenticação básica com usuário de suporte:

| Operação | Chamada |
| --- | --- |
| Atualizar contato | `PATCH /v1/admin/support/{cpf}/contact`, com e-mail e telefone. Valor nulo remove o contato |
| Ativar ou desativar conta | `PATCH .../account/status/{cpf}`, corpo com ação `enable` ou `disable` |
| Alterar documento | `PATCH .../user/{cpf_antigo}/document` |
| Estorno | `POST .../transaction/{id}/refund`, sem corpo |
| Data de liquidação | `PATCH .../transaction/{id}`, com a nova data |
| Segunda via de private label | `POST .../private-label/user/{documento}` |
| Sincronização CDT | `PATCH .../support/{documento}` retorna 405, **não confirmado** |

**Cashback**
`GET https://server.solatioenergialivre.com.br/ProspectorAPI/Cashback`, com autorização, intervalo de datas no formato mês, dia e ano, e o CPF. Estados possíveis: pendente, autorizado, expirado, morto e cancelado.

**Liberação de cashback pendente**
Hoje executada em lote por um workflow do Retool, identificado por um código de fluxo, informando o CPF no gatilho inicial. O objetivo é o Hub executar isso diretamente.

**Alerta de segurança:** as coleções de origem trazem credenciais em texto claro, incluindo a senha do usuário de suporte, que já foi exposta anteriormente. **Recomendação técnica: rotacionar essas credenciais antes de usá-las no novo ambiente**, e colocá-las apenas no cofre.

---

## 9. Requisitos funcionais, aba a aba

### 9.1 Autenticação e primeiro acesso

Login Google restrito ao domínio. Usuário do domínio mas não habilitado recebe mensagem clara de que o acesso precisa ser liberado, não um erro genérico. Perfil criado automaticamente no primeiro acesso, com nome e e-mail vindos do provedor.

### 9.2 Gestão de acesso

Lista de usuários com papel, área e origem da permissão. Concessão e remoção com trava contra remover o próprio acesso e contra remover o último administrador. Matriz de papel por módulo visível na tela, para a pessoa entender o que cada papel permite. Toda alteração de acesso é ação sensível e vai para a trilha.

### 9.3 Base de conhecimento

Conteúdo segmentado por time: rotinas de trabalho, documentação de fluxos, guias operacionais e o que a pessoa executa no dia a dia. Área colaborativa: administrador inclui conteúdo e vídeo, usuário comum consulta e **baixa** material para enviar a filiado e parceiro. Busca por texto e por similaridade. Sincronização com o Notion por allowlist de espaços, nunca o workspace inteiro, por causa de conteúdo de RH, financeiro e segredo de negócio. As regras de negócio que estão sendo levantadas internamente entram como conteúdo estruturado.

### 9.4 Módulo operacional do App, piloto

1. **Busca de filiado por CPF**, com e sem máscara, mostrando o cadastro e o estado da conta.
2. **Pendências do filiado.** No piloto, cashback pendente de liberação.
3. **Liberação de cashback**, hoje feita no Retool, passa a ser executada no Hub.
4. **Alteração de dados cadastrais**, hoje feita no Retool.
5. Toda escrita usa o padrão de ação sensível: preview do que vai ser enviado, justificativa obrigatória, confirmação explícita, execução e registro.

Os demais módulos que já existem em protótipo, estornos e carteirinhas, seguem o mesmo padrão e entram conforme a integração correspondente for liberada.

### 9.5 Assistente Maísa

Identidade visual oficial da Maísa. Conectado à base de conhecimento e às regras de negócio consolidadas. Responde apenas com base no conteúdo indexado, cita a fonte com versão e data, e aponta o caminho dentro da plataforma quando a resolução estiver em uma tela específica. Quando não encontra, diz que não encontrou e oferece o caminho alternativo, sem inventar resposta.

---

## 10. Auditoria, requisito detalhado

Toda ação executada precisa ser rastreável. Antes de confirmar a operação, o atendente informa:

1. **Motivo do atendimento**
2. **Link do chamado** aberto pelo filiado
3. **Número do chamado**

Só então a operação é executada. O registro guarda quem executou, o quê, quando, sobre qual alvo e com qual justificativa.

**Requisitos técnicos:**

- A gravação acontece **no servidor**, na mesma transação da execução. Registro escrito pelo navegador não é confiável.
- A trilha aceita apenas inserir e ler. Nunca alterar nem apagar, por ninguém.
- Dado pessoal é mascarado no registro. O alvo da ação aparece de forma identificável para auditoria, mas sem expor o documento completo.
- Leitura restrita a gestor e administrador. A gravação continua valendo para todos.
- O resultado da execução entra no registro, incluindo falha. Ação que falhou também é rastro.

---

## 11. Backlog de execução

Consolidação das tarefas da reunião com o que o inventário técnico acrescentou.

| # | Tarefa | Responsável | Depende de | Fase |
| --- | --- | --- | --- | --- |
| 1 | Criar o repositório privado na organização GitHub oficial e subir o export | Adabtech | Saber quem administra a organização | Imediato |
| 2 | Convidar os colaboradores | Adabtech | Lista de e-mails | Imediato |
| 3 | Consolidar os repositórios avulsos no Git oficial | Adabtech | Acesso aos repositórios | Imediato |
| 4 | Solicitar à Infra o provisionamento do banco, com `pgvector` | Adabtech | Infra | Imediato |
| 5 | Solicitar a criação do subdomínio `hub.maistodos.com.br` | Adabtech | Nome definido | Imediato |
| 6 | Configurar deploy no Dokploy, homologação e produção | Adabtech | Itens 4 e 5 | Setup |
| 7 | Revisar o documento de segurança da TI e aplicar desde o início | Adabtech | Documento | Setup |
| 8 | Remover o `.env` do versionamento e colocá-lo no `.gitignore` | Adabtech | | Setup |
| 9 | Reescrever o backend: modelo de dados, API e autenticação | Adabtech | Itens 4 e 6 | Dev |
| 10 | Login Google restrito ao domínio, mais habilitação por usuário | Adabtech | Item 9 | Dev |
| 11 | Integrar o Convenia e derivar permissão por setor e nível | Adabtech | API do Convenia | Dev |
| 12 | Base de conhecimento com sincronização via API do Notion | Adabtech | Tokens do Notion | Dev |
| 13 | Módulo operacional do App: busca por CPF e cashback | Adabtech | APIs de cashback e filiado | Dev |
| 14 | Trilha de auditoria gravada no servidor, com motivo, link e número do chamado | Adabtech | Item 9 | Dev |
| 15 | Aplicar a identidade visual da Maísa no assistente | Adabtech | Material da Maísa | Dev |
| 16 | Incorporar as regras de negócio levantadas como fonte do Hub | Adabtech | Entrega do levantamento | Dev |
| 17 | Publicar em homologação e liberar acesso para validação dos times | Adabtech | Anteriores | Homologação |
| 18 | Confirmar os cabeçalhos de segurança no domínio próprio, medindo a resposta | Adabtech | Item 5 | Homologação |
| 19 | Portar o design system e a marca, com os arquivos oficiais de logo | Adabtech | | Dev |
| 20 | Definir e implementar a retenção da trilha de auditoria | MaisTODOS, jurídico | Definição | Homologação |

---

## 12. Faseamento

| Fase | Entrega | Critério de conclusão, verificável |
| --- | --- | --- |
| **0. Setup** | Repositório, banco, domínio, deploy e requisitos de segurança | A aplicação responde em `hub.maistodos.com.br`, com os cabeçalhos de segurança medidos na resposta |
| **1. Fundação** | Backend próprio, login restrito, permissão via Convenia, auditoria | Um usuário entra e vê apenas o que seu setor e nível permitem, e a ação dele aparece na trilha gravada pelo servidor |
| **2. Conhecimento** | Base sincronizada com o Notion, regras de negócio, assistente Maísa | O time de App consulta e baixa material sem sair do Hub, e o assistente cita a fonte |
| **3. Operação** | Módulo operacional real do App, com CPF e cashback, auditado | Liberação de cashback executada pelo Hub, não pelo Retool |
| **4. Expansão** | Demais times, N2 e N3, Mixpanel e Jira, evolução para CRM | Backlog levantado time a time |

---

## 13. Riscos

| Risco | Efeito | Mitigação |
| --- | --- | --- |
| **Ausência total de credenciais de API** | Maior ameaça ao prazo. Sem elas, a entrega é uma casca navegável com dados fictícios | Começar por Convenia, Notion e cashback. Abrir chamado por sistema, com dono identificado |
| **Dependência do levantamento de regras de negócio** | A base consolidada depende de entrega que não está sob controle do projeto | Estruturar a base para receber o conteúdo depois, sem bloquear o resto |
| **Backend do Lovable não é reaproveitável** | Trabalho de backend começa do zero | Já previsto no plano. Front e telas aceleram |
| **Escopo tende a crescer** | Sete times e a visão de CRM são fase posterior | MVP é N1 do time de App. Manter |
| **Governança de repositórios** | Existe mais de um Git com o projeto | Consolidar antes de qualquer desenvolvimento paralelo |
| **Clickjacking enquanto não há domínio próprio** | Ação de atendimento induzida por site de terceiro | Fecha na Fase 0, com os cabeçalhos no domínio próprio. Não integrar API real antes disso |
| **Credenciais já expostas em coleções** | Uso indevido de API de produção | Rotacionar antes de usar no novo ambiente |

---

## 14. Pendências por pessoa

**Diego, MaisTODOS**
- Enviar a lista de e-mails para convite no GitHub.
- Correr atrás das credenciais de API dos sistemas da seção 8.
- Obter os tokens do Notion com os administradores de cada workspace.
- Obter o material de identidade visual da Maísa.
- Depois que o modelo do App estiver funcionando, levantar com os demais times as ferramentas e processos de cada um.

**Adabtech**
- Repositório, convites e consolidação dos Gits.
- Solicitações à Infra: banco e subdomínio.
- Aplicação do documento de segurança desde o início.

**Infra e TI MaisTODOS**
- Provisionar o banco, com `pgvector`.
- Criar o subdomínio.
- Entregar o documento de segurança.

**Levantamento interno de regras de negócio**
- Concluir o levantamento, que é fonte de alimentação do Hub.

**Jurídico e compliance**
- Definir o prazo de guarda da trilha de auditoria.

---

## 15. Glossário

| Termo | Significado |
| --- | --- |
| **Filiado** | Cliente do Cartão de TODOS |
| **N1, N2, N3** | Níveis de atendimento. N1 atende o filiado diretamente |
| **Convenia** | Sistema de RH, fonte oficial de setor e nível hierárquico |
| **Ação sensível** | Escrita em sistema real, que exige preview, justificativa, confirmação e trilha |
| **Área de operação** | Recorte por time que define o que a pessoa pode operar |
| **Conteúdo x operação** | Conteúdo é didático e aberto a todo colaborador. Operação executa ação e é restrita |
| **PL, private label** | Cartão de marca própria |
| **Mock** | Dado fictício, usado para validar a tela sem tocar em sistema real |

---

## Anexos

1. **Hub MaisTODOS, dump de políticas RLS e privilégios**, de 02/09/2026. Estado real do banco do protótipo: políticas, RLS por tabela, privilégios por papel e funções. Necessário porque as migrations do repositório não descrevem o schema completo.
2. **Documento de escopo e plano de execução**, gerado a partir da reunião com a Adabtech.
3. **Documento de visão do produto**, com o ecossistema de sistemas a integrar.

## Histórico de revisões

| Versão | Data | Mudança |
| --- | --- | --- |
| 1.0 | 02/09/2026 | Versão inicial. Consolida a reunião de escopo, o documento de visão e o inventário técnico do protótipo verificado no código e no banco. |
| 1.1 | 03/09/2026 | Domínio definido como `hub.maistodos.com.br` e correção do domínio da empresa para `maistodos.com.br`. Correção do item 1 do backlog: o repositório oficial na organização MaisTODOS ainda não existe, e não havia sido criado. |
