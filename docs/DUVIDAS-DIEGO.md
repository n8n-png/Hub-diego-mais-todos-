# Hub MaisTODOS — Perguntas para o Diego

**De:** Matheus Torquato / Adabtech
**Data:** 03/09/2026
**Base:** nossa reunião, o handoff técnico v1.0, o briefing de segurança e a leitura completa do código exportado do Lovable.

---

Diego, li tudo o que você mandou — a transcrição, os dois PDFs e os 188 arquivos do projeto exportado. Ficou muito claro o que o Hub precisa ser, e o documento que você enriqueceu está excelente: é o melhor handoff que eu recebi de cliente.

Já levantei o ambiente da MaisTODOS por dentro (Dokploy, DNS, produção) e as **decisões técnicas eu resolvo sozinho**. O que está abaixo é só o que depende de você ou de alguém aí dentro — informação, acesso ou decisão de negócio.

São 39 itens, mas a maioria é resposta curta. **Marquei com 🔴 os que travam o início do trabalho** — se você conseguir só esses primeiro, eu já começo.

---

## A. Acessos e infraestrutura

**🔴 D-01 — Existe SSO corporativo?**
O login vai ser Google restrito ao domínio de vocês. Só preciso saber se a MaisTODOS já usa algum sistema central de login que os outros sistemas internos usam (Google Workspace puro, Azure AD, Okta). Se existir, eu ligo o Hub nele em vez de criar um login isolado.

**🔴 D-02 — Quem é meu contato na Infra?**
Preciso de uma pessoa nomeada para pedir banco de dados e domínio. Pelo que vi no ambiente, o Victor Betini aparece como responsável — é com ele ou tem outra pessoa?

**D-03 — Subdomínio (já encaminhado, só confirmando com você).**
Corrigindo o handoff: o documento fala em `maistodos.br`, mas **o domínio da empresa é `maistodos.com.br`** — o endereço que estava escrito lá não existe.

Fechei como **`hub.maistodos.com.br`** e já abri o pedido com a Infra, para não travar o resto. Se você preferir outro nome, me avisa que eu ajusto o pedido — só não dá para deixar em aberto, porque é o item de maior espera do projeto (explico no D-07).

**🔴 D-04 — Qual é o repositório oficial?**
O documento diz que o repositório no GitHub oficial já foi criado, mas o que eu tenho em mãos não está na organização da MaisTODOS. E o Compa publicou o projeto em outro Git. Preciso de:
- link do repositório oficial da MaisTODOS + acesso para mim
- link do repositório que o Compa criou, para eu consolidar tudo em um lugar só

**D-05 — Lista de e-mails para convite.**
Quem você quer que tenha acesso ao repositório? (Você, o Compa, mais alguém?)

**🔴 D-06 — Que banco de dados a Infra vai entregar?**
Três perguntas em uma:
1. É um banco gerenciado da AWS (RDS) ou um banco novo dentro do servidor de vocês?
2. Se for RDS: ele tem a extensão **pgvector** habilitada? É o que faz a busca inteligente da base de conhecimento funcionar.
3. Se for RDS: o servidor onde o Hub vai rodar **está fora da AWS**, então a Infra precisa liberar o acesso (IP liberado ou VPN). Isso é um pedido a mais e é bom já ir junto.

**🔴 D-07 — Quem acompanha o pedido na Akamai do lado de vocês?**
Descobri uma coisa importante olhando o ambiente: os sites de vocês passam pela **Akamai** (a camada que fica na frente e protege/acelera o site). Isso significa que criar `hub.maistodos.com.br` **não é só criar um DNS** — precisa de uma configuração feita pelo time de infra dentro da Akamai.

O pedido já está aberto. O que eu preciso de você: **alguém aí dentro empurrando esse chamado**, porque enquanto o subdomínio não existir, não tem como colocar o Hub no ar nem para vocês validarem — e é a única tarefa do projeto que eu não consigo acelerar sozinho.

Aproveitando: quando a Akamai for configurada, preciso que ela **não remova os cabeçalhos de segurança** que a aplicação vai enviar. É um detalhe técnico, mas é bom já ir no mesmo chamado — evita uma segunda rodada depois.

---

## B. Convenia e permissões

Essa parte é o coração do MVP: a ideia que combinamos de a pessoa entrar e já receber a permissão certa pelo setor dela, sem ninguém configurar na mão.

**🔴 D-08 — Quem é o dono do Convenia?**
Preciso de: quem administra o Convenia aí dentro, o endereço da API e um token de acesso. O documento diz que já é fonte oficial em outros sistemas, então imagino que exista caminho.

**🔴 D-09 — O que o Convenia devolve sobre cada pessoa?**
Preciso saber se vem: **setor/área**, **nível hierárquico (N1, N2, N3)**, **cargo** e **status (ativo ou desligado)**.
E o mais prático: **você consegue exportar a lista de setores como estão escritos lá dentro?** Porque eu preciso fazer o "de-para" — por exemplo, o setor que no Convenia se chama "Atendimento App" vira a área "App" no Hub. Sem essa lista, o de-para é chute.

**D-10 — O Convenia avisa quando algo muda?**
Ele tem webhook (avisa sozinho) ou só dá para consultar? Se só consultar, eu sincronizo quando a pessoa faz login + uma vez por dia de madrugada, para pegar desligamentos. Funciona para vocês?

**D-11 — Desligamento e mudança de setor.**
Quando alguém sai da empresa ou muda de área no Convenia, o Hub deve **tirar o acesso automaticamente**? E se essa pessoa tinha uma liberação manual (exceção dada por um admin), essa liberação cai junto ou continua valendo?

**D-12 — Nível hierárquico vira qual permissão?**
Combinamos que o MVP é N1. Mas o gestor precisa ver a auditoria do time dele. Meu palpite:
- N1 → opera atendimento
- N2 e N3 → veem a trilha de auditoria do time, mas não operam
- Admin → sempre liberado na mão, nunca automático

Está certo?

**D-13 — Conteúdo continua aberto a todo mundo?**
Confirma que, mesmo depois do Convenia, uma pessoa da Logística continua podendo **estudar** o guia de Crédito PF? A regra que entendi é: conteúdo é aberto, operação é restrita. Só quero confirmar porque isso muda o desenho (e tem relação com o D-23).

**D-14 — Quantos administradores o Hub deve ter?**
Hoje o protótipo tem **10 admins em 18 contas**. O próprio briefing aponta isso como problema: quando quase todo mundo é admin, o controle de permissão perde o sentido. Quantos admins você quer em produção, e quem são?

---

## C. Integrações

**🔴 D-15 — Liberação de cashback: qual sistema está por trás?**
Hoje isso roda em lote por um fluxo no Retool. Para o Hub fazer isso direto, eu não preciso do Retool — preciso saber **qual API o Retool chama** (é o MaisCash? o Motor?). Consegue me passar o print/export desse fluxo, ou o contato de quem o construiu?

**D-16 — Confirmação da ordem de ataque.**
O documento sugere: **Convenia → Notion → cashback**. Concorda? Se sim, as outras (Jira, Zendesk, Metabase, Motor, Softnex, Univers, Adyen, Awin, Rakuten, Mixpanel) ficam para depois e não entram no MVP.

**D-17 — Existe ambiente de teste nessas APIs?**
MaisCash, Motor e Softnex têm ambiente de homologação/sandbox? Se não tiverem, vamos ter que testar liberação de cashback **contra produção** — e aí eu preciso de uma conta de filiado de teste combinada com quem opera, para não mexer em dinheiro de gente real durante o desenvolvimento.

**D-18 — Credenciais que já vazaram.**
O documento registra que as coleções de API trazem senha em texto claro, incluindo a **senha do usuário de suporte, que já foi exposta antes**. Isso foi trocado? Eu não vou usar essas credenciais no ambiente novo sem a confirmação de que foram rotacionadas — preciso saber quem trocou e quando.

**D-19 — Notion.**
Preciso de:
- quantos workspaces e **quais espaços/páginas exatamente** devem ser sincronizados
- o token de integração de cada workspace, gerado pelo administrador de cada um

⚠️ Importante: vou sincronizar **só uma lista específica de espaços, nunca o workspace inteiro**. O Notion de vocês tem RH, financeiro e informação sensível, e o Hub é consultado por todo colaborador. Se puxar tudo, vaza tudo.

**D-20 — O chamado que o atendente registra.**
Na auditoria o atendente preenche "link do chamado" e "número do chamado". Em qual sistema o afiliado abre esse chamado? (Zendesk? aquele "SUS" que você citou?) Se for um sistema só, eu valido o formato do link e no futuro dá até para puxar o número automaticamente.

---

## D. Conteúdo e base de conhecimento

**🔴 D-21 — O conteúdo que está no projeto hoje é real ou fictício?**
Tem cerca de 3.900 linhas de conteúdo dentro dos arquivos do sistema (guias de operação, fluxos, processos de App, Logística, Conta Digital). Preciso saber se isso é **conteúdo real** que vocês montaram exportando do Notion, ou se também é dado de exemplo.

E a pergunta que vem junto: dali para frente, **quem é a fonte da verdade — o Notion ou o Hub?** Ou seja, quando alguém precisar atualizar um processo, edita no Notion e o Hub puxa, ou edita direto no Hub?

**D-22 — As regras de negócio do Compa.**
O documento diz que o levantamento dele vira "fonte de alimentação do Hub". Em que formato ele vai entregar — Notion, planilha, documento? Pergunto porque isso muda como eu preparo a estrutura para receber esse conteúdo.

**D-23 — Dados de colaboradores no sistema.**
Os guias de operação hoje incluem **nome, cargo, telefone e e-mail corporativo de pessoas reais**. Hoje isso está de um jeito que qualquer colaborador logado consegue ler, independente do que a tela mostra.

Como você quer no produto novo?
- (a) Continua visível para todo colaborador (é lista de contato interno, faz sentido)
- (b) Só quem é da área vê os contatos daquela área
- (c) Só gestor e admin veem

Eu vou tirar do pacote do navegador de qualquer jeito — isso é técnico. Mas **quem pode ver é decisão sua**, e quero registrado.

**D-24 — Upload de material.**
O admin vai subir vídeo e documento. Qual o tamanho máximo de arquivo e mais ou menos quanto conteúdo vocês têm? (10 vídeos? 500?) Isso define onde o arquivo vai ficar guardado.

---

## E. Assistente Maísa

**D-25 — Material da identidade visual.**
Preciso do kit oficial da Maísa: logo, cores, avatar e tom de voz. Eu construí a Maísa originalmente — só quero saber se replico a identidade de lá ou se o time de marca tem material novo.

**D-26 — Até onde o assistente responde?**
Confirmando o desenho: ele responde **só com base no conteúdo indexado**, cita a fonte com versão e data, e quando não acha diz "não encontrei" em vez de inventar.
A dúvida: ele pode responder sobre setores que a pessoa não opera (já que o conteúdo é aberto), ou deve responder só sobre o setor dela?

**D-27 — Orçamento de IA.**
O assistente tem custo por uso — cada pergunta consome créditos do provedor de inteligência artificial. Duas perguntas:
1. Existe um teto mensal que vocês aceitam para isso?
2. A conta do provedor fica no nome da MaisTODOS ou eu contrato e repasso?

Vou colocar limite por usuário e alerta no painel de qualquer forma, mas o teto precisa ser um número seu.

**D-28 — O que a pessoa digita no chat sai da empresa.**
Preciso ser transparente: quando alguém digita uma pergunta no assistente, esse texto é **enviado para o provedor de IA**. Se um atendente colar o CPF de um filiado dentro da pergunta, aquele CPF sai da MaisTODOS.

Minha proposta: aviso claro na tela + o sistema mascara CPF e e-mail antes de enviar. Isso é suficiente para vocês, ou o jurídico vai querer algo mais duro (por exemplo, **bloquear** o envio quando detectar padrão de CPF)?

---

## F. Segurança e jurídico

**🔴 D-29 — O documento de segurança da TI.**
Ficou combinado que eu desenvolvo em cima do documento de segurança da TI da MaisTODOS, o mesmo padrão dos outros sistemas. **Eu ainda não recebi esse documento.** Os dois PDFs que você mandou são o briefing do protótipo e o handoff técnico — outra coisa.

Preciso dele **antes de começar**, senão eu desenvolvo e depois refaço.

*(Chegou até mim a política de segurança de outro sistema interno de vocês, e ela me ajuda como referência do padrão da casa — mas não é a norma da TI. Continua faltando.)*

**D-30 — O time de segurança ainda revisa?**
Combinamos que, indo por mim, não precisamos entrar na fila deles. Só confirmando: **eles vão revisar a entrega final** ou o processo com eles foi encerrado? Se vão revisar, eu prefiro alinhar os critérios com eles agora, no começo, do que descobrir no fim.

**D-31 — Por quanto tempo guardar a trilha de auditoria?**
Essa é do jurídico. Toda ação de atendimento fica registrada (quem fez, o quê, quando, por quê). A pergunta é: **guardar por quanto tempo?**
Os registros do assistente já têm expurgo de 12 meses. A trilha de auditoria está de propósito fora disso, esperando definição. Para provocar a decisão, uma sugestão comum é **5 anos** (alinhado ao prazo de reclamação de consumidor) — mas quem decide é o jurídico de vocês.

**D-32 — LGPD.**
O Hub trata CPF, e-mail e telefone de filiado. Existe um encarregado de dados (DPO) na MaisTODOS que precisa validar o desenho? E vocês exigem relatório de impacto (RIPD) para sistema interno?

**D-33 — A conta de fora do domínio.**
Existe uma conta com e-mail de fora da MaisTODOS, criada em 26/08, que foi mantida por decisão. Ela precisa continuar existindo no Hub novo ou morre junto com o protótipo?

---

## G. Validação

**D-34 — Quem valida cada etapa?**
Minha sugestão: você valida o módulo de App, que é onde você domina o processo. E na fase de expansão, cada líder de time valida o conteúdo do próprio setor. Fecha assim, ou tem alguém que precisa aprovar antes de liberar para os times?

---

## H. Confirmações rápidas (resposta de uma linha)

**D-35 — Nomes.** Vou usar daqui para frente: **MaisCash** (não MyCash), **Univers** (não Universe), **Adyen** (não Adem), e "Motor Softnex" são **dois sistemas separados** — Motor (transações do App) e Softnex (private label e carteirinhas). Confere?

**D-36 — A extensão de navegador.** O `maisia-copiloto` que está no projeto hoje aponta para outra aplicação (a que deu origem ao Hub no remix), não para o Hub. Ela entra no escopo agora ou fica para depois?

**D-37 — Painel N2.** Existe o campo de definição na tela de acessos, mas o painel em si não existe. Fica em standby, como combinamos? Confirmado?

---

## I. Duas coisas que descobri olhando o ambiente de vocês

**D-38 — Já existe outro sistema chamado "Hub MaisTODOS".**
Ao levantar o ambiente, encontrei um portal interno de colaboradores rodando em `astronauta.maistodos.com.br`, no mesmo servidor, também chamado de Hub — com perfis, aniversários, reconhecimentos e comunicados. Aparentemente é mantido por outra pessoa (Pedro).

Não é problema técnico, é problema de nome: **vão existir dois sistemas internos chamados "Hub" na MaisTODOS**, e o de vocês vai ficar justamente no endereço mais genérico (`hub.maistodos.com.br`). Isso confunde colaborador e vira chamado de suporte.

Você sabia desse outro sistema? Faz sentido diferenciar o nome de um dos dois — ou os times já entendem a diferença naturalmente?

**D-39 — Talvez já exista uma fonte de dados de colaborador pronta.**
Esse mesmo portal tem uma integração que entrega **15 campos de colaborador** para o time de Segurança/Acessos, por token, servidor a servidor. É basicamente o tipo de informação que eu preciso do Convenia.

Vale a pena perguntar: **essa integração serve como fonte para o Hub também?** Pode ser um caminho mais rápido que o Convenia, ou uma alternativa caso o acesso ao Convenia demore. Quem sabe você já conhece quem cuida disso.

---

## Resumo: o que trava o início

| # | O que eu preciso | De quem |
|---|------------------|---------|
| D-29 | **Documento de segurança da TI MaisTODOS** | TI |
| D-06 | **Definição do banco (com pgvector) e liberação de rede** | Infra |
| D-04 | **Link e acesso ao repositório oficial + o do Compa** | Você |
| D-02 | **Nome do contato na Infra** | Você |
| D-07 | **Alguém empurrando o chamado da Akamai** | Você + Infra |
| D-08 + D-09 | **Acesso ao Convenia + lista de setores** | Você |
| D-19 | **Tokens do Notion + lista de espaços liberados** | Você + admins |
| D-15 | **Qual API está por trás da liberação de cashback** | Você |

Os outros eu consigo tocar em paralelo — mas esses, sem eles eu fico parado.

---

Qualquer item que você achar que é decisão minha e não sua, me fala que eu resolvo. A ideia desse documento é justamente não te dar trabalho com o que é técnico.

**Matheus Torquato · Adabtech**
