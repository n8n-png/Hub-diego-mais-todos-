# Hub MaisTODOS — Dúvidas para fechar antes de codar

> ⚠️ **Documento substituído em 03/09/2026.** Foi dividido em dois:
> - `DECISOES-TECNICAS-MATHEUS.md` — decisões técnicas da Adabtech, já com os fatos de infra levantados no Dokploy/Akamai
> - `DUVIDAS-DIEGO.md` — perguntas de negócio, para enviar ao cliente
>
> Mantido como registro do levantamento inicial.

**Versão:** 1.0
**Data:** 03/09/2026
**Base:** transcrição da reunião (Matheus x Diego), `Hub-MaisTODOS-Documentacao-Tecnica.pdf` (v1.0, 02/09/2026), `Hub-MaisTODOS-Briefing-Seguranca.pdf` e o export do Lovable (`Painel MaisTODOS Unificado`, commit `f0eed254`, 188 arquivos).

**Legenda de destinatário:**
`[MT]` decisão sua (Adabtech) · `[DG]` Diego / MaisTODOS · `[INFRA]` Infra/TI MaisTODOS · `[JUR]` Jurídico/Compliance

---

## 0. O que eu já entendi (confirmar se está correto)

- O Hub é uma ferramenta **interna** que junta duas naturezas: **conteúdo** (universidade, base de conhecimento, processos, fluxogramas, scripts, FAQ, guias de operação de todos os setores) aberto a qualquer colaborador autenticado, e **operação** (atendimento a filiado: filiados, cashback, estornos, carteirinhas, auditoria, gestão de acessos) restrita por papel.
- O protótipo do Lovable é **ponto de partida de front**, não produto. Front, telas, navegação, design system e os componentes de regra (`AcaoSensivel`, `GuardaOperacional`, shells) se aproveitam. **Backend, auth, RLS e migrations saem inteiros** (amarrados ao Supabase + gateway do Lovable).
- Alvo: repositório privado no GitHub oficial da MaisTODOS, deploy no **Dokploy** da MaisTODOS (homologação + produção), **PostgreSQL próprio com pgvector** provisionado pela Infra, domínio `hubmaistodos` sob `maistodos.br`.
- MVP = **N1 do time de App**: login Google restrito ao domínio + habilitação por usuário, permissão automática derivada do **Convenia** (setor + nível), base de conhecimento sincronizada do **Notion**, módulo operacional de App (busca por CPF, pendências, liberação de cashback, alteração cadastral), trilha de auditoria com motivo/link/nº do chamado, e assistente **Maísa** com identidade visual oficial.
- Fica fora do MVP: painel N2 e fluxo N3 (correm no Jira), os outros seis times, evolução para CRM, triagem de tickets por IA.
- **Bloqueio principal hoje: nenhuma credencial de API foi obtida.** Sem Convenia, Notion e o sistema de cashback, o Hub continua sendo uma casca navegável com dados fictícios.

Se algum ponto acima estiver errado, me corrija primeiro — o resto das perguntas depende disso.

---

## 1. Plataforma e arquitetura (as que travam o começo do código)

**1.1 `[MT]` Stack do backend novo.** A documentação diz "reescrever o backend" mas não define com o quê. Três caminhos:

- (a) **Manter TanStack Start** e usar as server functions dele como camada de API, trocando só Supabase → Postgres próprio (Drizzle/Prisma). Menor esforço, o front porta quase direto.
- (b) **API separada** (Node/NestJS ou Fastify) + front React independente. Mais limpo para o futuro CRM, mais trabalho agora.
- (c) Next.js, jogando o front para o padrão da casa.

Qual seguimos? Meu voto é **(a)** para o MVP no prazo, com a camada de dados isolada para permitir extrair a API depois.

**1.2 `[MT]/[INFRA]` Autenticação sem Supabase.** Saindo do Supabase Auth, a sessão passa a ser nossa. Google Workspace via OAuth direto (parâmetro `hd` restrito ao domínio) + sessão própria em cookie httpOnly? Ou a MaisTODOS já tem um SSO/IdP corporativo (Azure AD, Okta, Google Workspace puro) que outros sistemas internos usam e devemos plugar?

**1.3 `[DG]/[INFRA]` Domínio, qual é o correto?** A documentação diz `hubmaistodos` em **`maistodos.br`**, mas o briefing de segurança diz que o e-mail corporativo é **`@maistodos.com.br`**. São dois domínios diferentes. Confirmar: (a) domínio final da aplicação, (b) domínio de e-mail que trava o login. E o nome já foi aprovado como `hubmaistodos.maistodos.br` ou ainda está em aberto?

**1.4 `[MT]/[DG]` Repositório oficial.** O backlog marca "criar repositório privado no GitHub oficial" como **FEITO**, mas o repositório que estou usando hoje aponta para `github.com/n8n-png/Hub-diego-mais-todos-`, que não é a org MaisTODOS. Qual é o repositório canônico? E onde está o repositório que o **Compa** publicou, para eu consolidar? Preciso do link e de acesso.

**1.5 `[DG]` Lista de e-mails para convite** no GitHub (Diego, Compa, quem mais?).

**1.6 `[INFRA]` Banco.** Postgres próprio com **pgvector** — qual versão do Postgres, quem administra, política de backup/restore, e teremos duas instâncias (homologação e produção) ou uma com dois schemas? Preciso de um contato nomeado na Infra para abrir isso.

**1.7 `[INFRA]` Dokploy.** Quem me dá acesso, e o deploy será por push no GitHub (CI) ou build manual? Existe registry de imagens interno?

---

## 2. Convenia e modelo de permissão (é o coração do MVP)

**2.1 `[DG]` A API do Convenia existe e está acessível?** A documentação classifica como "VIÁVEL, já é fonte oficial em outros sistemas", mas nenhuma credencial foi obtida. Quem é o dono do Convenia dentro da MaisTODOS? Preciso de: endpoint, token, e um exemplo real de payload de colaborador.

**2.2 `[DG]` O Convenia devolve o quê, exatamente?** Preciso saber se o retorno traz **setor/área**, **nível hierárquico (N1/N2/N3)**, **cargo** e **status (ativo/desligado)**. O mapa "setor do Convenia → área do Hub" (Crédito PF, Conta Digital, Pagamentos, Logística, App, Cashback) só existe depois disso. Você consegue exportar a lista de setores do Convenia como estão escritos lá?

**2.3 `[DG]/[MT]` Política de sincronização.** No login, periódica (cron) ou por webhook? Se o Convenia não tiver webhook, sugiro: sincronizar no login + job diário para capturar desligamentos.

**2.4 `[DG]` Desligamento e mudança de área.** Quando alguém sai da empresa ou troca de setor no Convenia, o Hub deve **revogar o acesso automaticamente**? E o que acontece com as exceções manuais dessa pessoa — caem junto ou sobrevivem?

**2.5 `[DG]` Nível → papel.** Na reunião ficou "MVP é N1". Mas o gestor precisa ver a auditoria do time dele. O mapeamento é: N1 → `atendimento_n1`, N2/N3 → `gestor` (só leitura de trilha), e `admin` sempre manual? Confirmar.

**2.6 `[DG]` Conteúdo aberto x Convenia.** A regra "conteúdo é aberto a todo autenticado" vale mesmo depois do Convenia — ou seja, alguém de Logística continua podendo estudar o guia de Crédito PF? Pergunto porque o guia de operação hoje **inclui nome, cargo, telefone e e-mail corporativo de pessoas reais** (ver 5.3).

**2.7 `[DG]` Quem é admin no produto novo?** Hoje o protótipo tem **10 administradores em 18 contas**, que o próprio briefing aponta como problema de governança. Quantos admins o Hub em produção deve ter, e quem são?

---

## 3. Integrações operacionais (o que destrava a Fase 3)

**3.1 `[DG]` Liberação de cashback — qual é o sistema real por trás?** Hoje roda "em lote por um fluxo do Retool". Para o Hub executar isso diretamente eu preciso saber **qual API o Retool chama** (MaisCash? Motor?), não o Retool em si. Consegue o print/export do fluxo do Retool ou o contato do dono?

**3.2 `[DG]` Prioridade das integrações.** A documentação sugere Convenia → Notion → cashback. Concorda? Se sim, as outras (Jira, Zendesk, Metabase, Motor, Softnex, Univers, Adyen, Awin, Rakuten, Mixpanel) ficam para a Fase 4 e **não** entram no prazo do MVP.

**3.3 `[DG]` Ambiente de homologação das APIs.** Os sistemas (MaisCash, Motor, Softnex) têm ambiente de sandbox/homologação? Se não tiverem, vamos testar liberação de cashback **contra produção**, e aí precisamos de uma conta de filiado de teste combinada com quem opera.

**3.4 `[DG]/[MT]` Credenciais já expostas.** A documentação registra que as coleções de origem trazem credenciais em texto claro, incluindo a **senha do usuário de suporte que já vazou antes**. Isso foi rotacionado? Não vou usar essas credenciais no ambiente novo antes da rotação — preciso da confirmação de quem rotacionou e quando.

**3.5 `[DG]` Notion.** Quantos workspaces e quais espaços exatamente? A regra é sincronizar por **allowlist de espaços**, nunca o workspace inteiro (o Notion tem RH, financeiro e segredo de negócio). Preciso da lista de páginas/databases liberadas e do token de integração de cada workspace, gerado pelo admin de cada um.

**3.6 `[DG]` Chamado na auditoria.** O campo "link do chamado" que o atendente preenche — o afiliado abre chamado em qual sistema? (Zendesk? o "SUS" citado na reunião?) Se for um sistema só, dá para validar o formato do link e até puxar o número automaticamente no futuro.

---

## 4. IA e assistente Maísa

**4.1 `[MT]` Provedor de IA.** O gateway do Lovable sai. Qual provedor entra para **chat** e para **embeddings**? Se for Claude/OpenAI direto, precisamos de conta corporativa MaisTODOS ou vai pela Adabtech? (Isso tem custo recorrente e precisa estar claro no orçamento.)

**4.2 `[DG]/[MT]` Custo e limite de tokens.** O protótipo já tem tabela `ai_usage` e componente de consumo. Existe teto mensal de gasto? Quem monitora? Sugiro limite por usuário/dia + alerta no admin.

**4.3 `[DG]` Material da Maísa.** Preciso do kit de identidade visual oficial (logo, cores, tom de voz, avatar). Você mencionou que eu mesmo construí a Maísa — confirmo se replico a identidade de lá ou se existe material novo/atualizado do time de marca.

**4.4 `[MT]/[DG]` Escopo do assistente.** Confirmar que o assistente **só responde com base no conteúdo indexado**, cita fonte com versão e data, e diz "não encontrei" quando não achar. Ele pode responder sobre conteúdo de setores que o usuário não opera (já que conteúdo é aberto), ou deve filtrar pelo setor da pessoa?

**4.5 `[DG]/[JUR]` Texto livre no chat.** O briefing aponta que a pergunta digitada é gravada e **enviada ao provedor de IA** — é a maior fonte de vazamento em sistemas assim. Aceitamos isso com aviso ao usuário + mascaramento de CPF/e-mail antes do envio, ou o jurídico quer algo mais duro (ex.: bloquear o envio quando detectar padrão de CPF)?

---

## 5. Conteúdo e dados

**5.1 `[DG]` Os dados de operação hoje estão em arquivo, não em banco.** São cerca de 3.900 linhas em `src/data/` (`operacao.ts`, `atendimento.ts`, `logistica.ts`, `conta-digital.ts`). Esse conteúdo é **real** (guias, fluxos, processos) ou também é mock? Se for real, ele migra para o banco/Notion — e quem é a fonte de verdade dali para frente: o Notion ou o Hub?

**5.2 `[DG]` Regras de negócio do Compa.** A documentação diz que a base consolidada dele é "fonte de alimentação do Hub". Em que formato ele vai entregar (Notion? planilha? documento?) e qual a previsão? Isso é dependência da Fase 2 e está fora do meu controle.

**5.3 `[DG]/[JUR]` Dados de colaboradores no pacote do frontend.** Hoje o guia de operação leva **nome, cargo, telefone e e-mail corporativo de pessoas reais** dentro do bundle entregue ao navegador. No produto novo isso deve: (a) sair do bundle e virar consulta autenticada na API, (b) continuar aberto a todo colaborador, ou (c) ser restrito por área? Minha recomendação é (a) + (b), mas quero registro da decisão.

**5.4 `[DG]` Upload de material.** Admin sobe vídeo e documento. Qual o **tamanho máximo** e o volume estimado? Isso define se precisamos de storage de objetos (S3/MinIO) no Dokploy ou se disco basta.

---

## 6. Segurança, auditoria e compliance

**6.1 `[JUR]` Retenção da trilha de auditoria.** É o item 20 do backlog e depende de definição jurídica. Hoje a trilha está **deliberadamente fora do expurgo de 12 meses**. Qual o prazo de guarda? (Sugestão para provocar a decisão: 5 anos, alinhado ao prazo prescricional de relação de consumo.)

**6.2 `[JUR]/[DG]` LGPD.** O Hub trata CPF, e-mail e telefone de filiado. Existe DPO/encarregado na MaisTODOS que precisa validar o desenho? Existe RIPD (relatório de impacto) exigido para sistemas internos?

**6.3 `[INFRA]` Documento de segurança da TI.** A decisão é "desenvolver em cima do documento de segurança da TI MaisTODOS, mesmo padrão dos demais sistemas". **Eu ainda não recebi esse documento.** Os dois PDFs que tenho são o briefing do protótipo e o handoff técnico, não o padrão da TI. Preciso dele antes da Fase 0, senão vou desenvolver e depois refazer.

**6.4 `[DG]` Análise do time de segurança.** Ficou combinado que, indo pela Adabtech, a gente não precisa passar pela fila deles (que deu prazo para a segunda-feira seguinte). Confirmo: **eles ainda vão revisar a entrega final**, ou o processo com eles foi encerrado? Se vão revisar, prefiro alinhar os critérios agora, não no fim.

**6.5 `[DG]` Conta fora do domínio.** Existe uma conta de domínio externo criada em 26/08, mantida por decisão do responsável. Ela migra para o Hub novo ou morre junto com o protótipo?

**6.6 `[MT]` Protótipo no ar.** O `mais-todos-hub.lovable.app` continua acessível durante a reconstrução (para validação dos times), ou derrubamos assim que a homologação subir? Enquanto ele estiver no ar, o clickjacking apontado no P1 continua aberto — mas como opera em dados fictícios, o risco é baixo.

---

## 7. Escopo, prazo e processo

**7.1 `[DG]` Prazo.** Você falou "até o final do mês, projeto rodando para validação de todos os times". Com a documentação datada de 02/09, entendo que o alvo é **30/09/2026**. Confirmar.

**7.2 `[MT]/[DG]` Prazo x realidade.** Preciso ser direto: **sem as credenciais de API, a Fase 3 (operação real) não fecha em setembro.** O que é factível até 30/09 é Fase 0 (infra), Fase 1 (backend, login, Convenia, auditoria) e Fase 2 (conhecimento + Maísa), com a operação ainda em dados fictícios. A Fase 3 depende inteiramente de quando o cashback/MaisCash liberar acesso. Você concorda em apresentar o prazo assim, dividido, ou precisa que o "rodando para validação" cubra a operação real?

**7.3 `[DG]` Validação.** Quem valida cada fase e como? Sugiro: você (Diego) valida App, e cada líder de time valida o conteúdo do seu setor na Fase 4.

**7.4 `[MT]` Contrato/escopo.** Isso está fechado como projeto único ou por fases? Pergunto porque a Fase 4 (seis times + N2/N3 + CRM) é um projeto do tamanho do MVP inteiro, e é onde escopo costuma crescer sem contrato.

---

## 8. Menores, mas que quero registrado

**8.1** O `.env` está versionado e fora do `.gitignore`. Só carrega o ID do projeto e a chave publicável do Supabase (sem segredo forte), mas ele **sai do versionamento** na Fase 0 e as chaves do Supabase morrem junto com a migração. `[MT — já resolvido do meu lado]`

**8.2** Nomes corrigidos que vou usar daqui para frente: **MaisCash** (não MyCash), **Univers** (não Universe), **Adyen** (não Adem), e "Motor Softnex" são **dois sistemas**: Motor (transações do App) e Softnex (PL e carteirinhas). `[DG — confirmar]`

**8.3** A extensão de navegador (`maisia-copiloto`) aponta hoje para `mais-tudo-mais-sabio.lovable.app/maisia`, que é a aplicação de origem do remix, não o Hub. Ela entra no escopo do MVP ou fica de fora até o Hub estar no domínio próprio? `[DG]`

**8.4** Painel N2: existe o campo de definição na tela de acessos, mas o painel **não existe**. Fica em standby, confirmado? `[DG]`

---

## Resumo do que eu preciso receber para começar

| # | Item | De quem |
|---|------|---------|
| 1 | Documento de segurança da TI MaisTODOS | Diego / TI |
| 2 | Link e acesso ao repositório oficial + repositório do Compa | Diego |
| 3 | Lista de e-mails para convite no GitHub | Diego |
| 4 | Contato nomeado na Infra (banco com pgvector + Dokploy + subdomínio) | Diego |
| 5 | Domínio final confirmado (`maistodos.br` x `maistodos.com.br`) | Diego |
| 6 | Credencial e payload de exemplo do Convenia + lista de setores | Diego |
| 7 | Tokens do Notion por workspace + allowlist de espaços | Diego |
| 8 | Qual API está por trás da liberação de cashback no Retool | Diego |
| 9 | Confirmação de rotação das credenciais expostas | Diego / TI |
| 10 | Kit de identidade visual da Maísa | Diego / Marca |
| 11 | Prazo de guarda da trilha de auditoria | Jurídico |
| 12 | Definição do provedor de IA e do teto de custo | Matheus / Diego |

---

*Documento preparado pela Adabtech em 03/09/2026, a partir da transcrição da reunião, do handoff técnico v1.0, do briefing de segurança e da leitura do código exportado do Lovable.*
