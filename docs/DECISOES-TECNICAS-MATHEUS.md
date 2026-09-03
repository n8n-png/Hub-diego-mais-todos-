# Hub MaisTODOS — Decisões técnicas (Matheus / Adabtech)

**Versão:** 3.0
**Data:** 03/09/2026
**Mudança desta versão:** incorpora o retorno do Diego. Uma pendência fechou, uma ação nova virou sua, e cinco pontos precisam da sua resposta.
**Complementa:** `DECISOES-PRODUTO.md` (o que o cliente fechou) e `DUVIDAS-DIEGO.md` (o questionário original).

---

## Parte 0 — O que mudou com o retorno do Diego

### 0.1 ⚡ Ação que virou sua: criar o repositório

**O Diego não criou repositório nenhum.** A linha "FEITO" no backlog do handoff era premissa dele, não fato — ele mesmo corrigiu e pediu desculpa por isso.

**DECIDIDO por ele:** o repositório oficial é **o que você criar**. Ele não tem permissão de admin na organização do GitHub da MaisTODOS, nem para criar nem para convidar.

Convidar como colaboradores:
- `diego.torini@maistodos.com.br`
- `andre.comparini@maistodos.com.br`

Isso **destrava P-02 e o item 5 da Fase 0** — branch protection e CI passam a depender só de você.

### 0.2 ✅ P-03 fechado: autenticação

Não há confirmação de IdP central além do **Google Workspace**, que é o login corporativo do dia a dia — 16 das 18 contas do protótipo entraram por ele. O desenho que o Diego quer é exatamente o proposto: **Google OAuth restrito ao domínio + permissão vinda do Convenia**. Se existir camada central além do Workspace, quem confirma é a Infra — mas não trava.

**Fechado:** Google OAuth com `hd` travado em `maistodos.com.br` + sessão própria em cookie httpOnly / SameSite=Lax / Secure.

### 0.3 🔄 A ordem de ataque das integrações mudou

O handoff dizia Convenia → Notion → cashback. O Diego inverteu: **Notion e Convenia primeiro, Retool depois**.

> *"Cadastro e documentação são o ponto focal agora. Notion destrava o conteúdo e Convenia destrava as permissões, que são as duas coisas que fazem o Hub existir para o usuário. O Retool é o que transforma consulta em operação."*

Impacto no plano: a Fase 2 (conhecimento) deixa de vir depois da Fase 1 e passa a correr **em paralelo** com ela. Vale a pena — o Notion é o único destravamento que depende de um token só, não de mapear sistema inteiro.

### 0.4 🆕 Solatio: um sistema que não estava no mapa

A consulta de cashback usa a **API da Solatio**, endpoint `ProspectorAPI/Cashback`, por CPF e intervalo de datas, devolvendo `pendente`, `autorizado`, `expirado`, `morto`, `cancelado`. Não constava na lista de integrações do handoff.

E o mais relevante: **os contratos de API estão na versão Markdown do handoff técnico**, que a gente não recebeu — só temos o PDF, que remete a ela. **Pedir essa versão é barato e pode economizar dias** de descoberta na Fase 3.

### 0.5 O que continua sem dono

O Diego foi honesto sobre o limite dele: *"eu sou o dono do processo de atendimento e do desenho do produto, não das credenciais."* Ele não administra Convenia, Retool, Notion, GitHub da organização, Infra nem as APIs dos parceiros.

Consolidou tudo numa lista por destinatário (ver `DECISOES-PRODUTO.md`, item 11) e propôs **levar a lista inteira ao Compa de uma vez**, em vez de abrir chamado sistema a sistema. É o caminho certo — o Compa transita entre as áreas.

Dado duro: **as credenciais expostas não foram rotacionadas.** Continua valendo a regra de não usar nada antes da troca, e de receber já rotacionado direto no cofre, nunca por mensagem.

### 0.6 ✅ Três bloqueios caíram: estão do seu lado

Alinhado com o Diego no Slack em 03/09. O que ele não conseguia liberar, a Adabtech já tem:

| Item | Status |
|------|--------|
| **Identidade visual da Maísa** | Você tem. Foi você que construiu a Maísa |
| **Documento de segurança** | Você tem o padrão da MaisTODOS e é o que segue. Não precisa pedir à TI |
| **Integração Convenia** | Você já tem — e já integrou antes |

Isso **derruba D-25, D-29 e boa parte de D-08** da lista do Diego, e reduz a lista de pendências dele a: Infra (banco), Notion (token), Retool/cashback e jurídico.

> ⚠️ **Uma ressalva no Convenia:** ter a integração pronta ≠ ter o **de-para**. O mapa "setor como está escrito no Convenia → área do Hub" (Crédito PF, Conta Digital, Pagamentos, Logística, App, Cashback) depende da lista real de setores **daquela conta da MaisTODOS**. Se a sua integração já acessa a conta deles, você tira a lista sozinho. Se for integração genérica do Convenia, a lista continua sendo pedido ao RH. Ver dúvida Q-01.

---

## Parte R — Pontos que precisam da sua resposta

**R-01 — O cliente pediu o controle de custo de IA que você dispensou.**
Sua decisão 16 foi "não precisa". O Diego respondeu pedindo teto mensal na casa de algumas centenas de reais, **alerta em 70%** e **limite por usuário**, para depois trocar o chute por dado medido.
🎯 *Recomendo implementar o mínimo:* limite por usuário/dia + alerta em 70%. As tabelas `ai_queries` e `ai_usage` já suportam, é meio dia de trabalho, e é pedido explícito do cliente. **Mantém a decisão 16 ou volta atrás?**

**R-02 — Exceção manual de permissão: derrubar tudo ou sinalizar?**
O Diego perguntou diretamente. A proposta dele: em mudança de setor, permissão automática recalcula na hora e a liberação manual **continua valendo, sinalizada na tela** para o admin revisar.
🎯 *Recomendo aceitar, com um reforço:* toda exceção manual nasce com **prazo de validade de 90 dias**. A sinalização só resolve se alguém olhar a tela; o prazo resolve mesmo que ninguém olhe. **Concorda?**

~~**R-03 — Documento de segurança da TI**~~ ✅ **resolvido.** Você já tem o padrão de segurança da MaisTODOS e é o que segue. Não bloqueia, não precisa pedir à TI. Confirmado com o Diego no Slack.

**R-04 — Vídeo fora do Hub simplifica seu storage.**
O Diego propôs vídeo hospedado no Drive ou YouTube não listado, com o Hub guardando só o link. Se aceitar, o bucket passa a servir **só documentos (até 50 MB) + backup do banco** — bem menor do que o dimensionado.
⚠️ *Ressalva que vale levar a ele:* "YouTube não listado" **não é controle de acesso** — quem tem o link assiste, inclusive de fora da empresa. Para vídeo que mostre tela de sistema ou dado de filiado, só **Drive corporativo restrito ao domínio**. **Aceita a proposta com essa regra?**

**R-05 — P-01 continua em aberto:** homologação como dois environments no mesmo host do Dokploy, com limite de CPU/memória no staging?

---

## Parte Q — Dúvidas que restam sobre o projeto

Depois de ler transcrição, handoff, briefing, código, ambiente e o retorno do Diego, o projeto está entendido. O que resta é isto — e é pouco:

**Q-01 — A sua integração do Convenia acessa a conta da MaisTODOS?**
Se sim, você tira a lista de setores sozinho e o de-para deixa de ser pendência. Se for integração genérica (você conhece a API, mas com credencial de outro cliente), a lista de setores da MaisTODOS continua sendo pedido ao RH. É a única coisa que separa "Convenia resolvido" de "Convenia quase resolvido".

**Q-02 — Qual IA a Maísa usa, e qual embedding?**
Você disse ter todas as especificações. Preciso de: provedor e modelo do chat, e **modelo + dimensão do vetor** do embedding. A dimensão tem que estar fechada antes de eu criar a tabela de chunks — trocar depois obriga reindexar tudo.

**Q-03 — A Maísa que já existe é reaproveitável como serviço, ou só a identidade?**
Muda o desenho: se a Maísa já roda como serviço (com base própria, endpoint, prompt), o Hub pode consumir em vez de reconstruir o RAG do zero. Se for só identidade visual e tom de voz, o pipeline de embedding + busca vetorial é nosso.

**Q-04 — Bucket: R2, Wasabi ou S3?** (item 10, segue em aberto)

**Q-05 — Quem vai atrás do Retool?**
É o único bloqueio real da Fase 3. O Diego não tem acesso de edição para exportar o fluxo, e ninguém sabe qual API ele chama por trás. O caminho proposto por ele é o Compa. Você aciona, ou deixa na lista que ele vai levar?

**Q-06 — Pedir a versão Markdown do handoff.**
O PDF diz que os contratos de API estão nela (busca por CPF, atualização de contato, ativação/desativação, alteração de documento, estorno, data de liquidação, segunda via de PL, consulta de cashback). Custa uma mensagem e pode economizar dias.

**Q-07 — D-38 e D-39 seguem sem resposta.** O outro "Hub MaisTODOS" (`astronauta`) e a API de 15 campos de colaborador daquele portal. O D-39 pode inclusive ficar irrelevante se o Q-01 resolver o Convenia.

---

## Parte A — Fatos de infra confirmados

Levantado no painel do Dokploy e por requisição real ao ambiente de produção da MaisTODOS. **Isto não é suposição, é medição.**

### A.1 Acesso e propriedade

- Conta `matheus.torquato@kakautech.com` com **nível admin** no Dokploy (Settings completo: Web Server, Users, SSH Keys).
- **Dono da instância é a MaisTODOS** — e-mail do Let's Encrypt é `victor.betini@maistodos.com.br`.
- Você cria projeto sozinho. **Não** provisiona máquina, domínio ou RDS — isso é pedido à Infra.

### A.2 Estado do servidor

| Item | Estado |
|------|--------|
| Servidores | **1 host só** (VPS Hostinger, fora da AWS). Remote Servers vazio, sem SSH key |
| Projetos | 3 projects / 7 services — 6 apps, 1 compose, **0 databases** |
| Ambientes | **Não existe homologação.** Todos os deployments marcados `production` |
| Disco | 80 GB livres, sem redundância. Docker já consome 17,83 GB |
| Backup | **Nenhum.** Dokploy exige um S3 Destination cadastrado e não há nenhum |
| Deploy | Push em `main` → build → produção. **Sem PR, sem review, sem gate** |
| Build | Application com Dockerfile multi-stage (`node:18-alpine` → `nginx:alpine`), variáveis como Build Args |
| Secrets | Painel do Dokploy (Build Args / Environment). Sem Vault/Doppler |

### A.3 A borda: Akamai 🔴

```
astronauta.maistodos.com.br → maistodos.edgekey.net (Akamai) → 200 OK
X-Akamai-Transformed: 9 1774 0 pmb=mRUM,1
Strict-Transport-Security: max-age=86400
```

1. **Não existe proteção de clickjacking hoje no ambiente MaisTODOS.** A resposta de produção não traz `X-Frame-Options` nem `Content-Security-Policy` — e aqui a causa é diferente do Lovable: **nunca foi configurado na origem**. Confirmado no `SECURITY.md` do portal, que lista isso como pendência aberta com o responsável do Dokploy desde maio.
2. **O Akamai reescreve o corpo da resposta** (`pmb=mRUM` = injeção de script de Real User Monitoring). Um `script-src 'self'` estrito **quebra o site**.
3. **TLS termina no Akamai**, não no Traefik. Domínio novo exige property provisionada pelo time de infra.

### A.4 🆕 Já existe outro sistema chamado "Hub MaisTODOS"

O `SECURITY.md` que você passou **não é o documento de segurança da TI**. É a política de segurança de **outro sistema** — o portal interno de colaboradores que roda em `astronauta.maistodos.com.br`, mantido pelo Pedro Oliveira, no mesmo servidor Dokploy.

Como sei: 32 tabelas, `profiles`, `banners`, `reconhecimentos`, `birthdays_view`, `ColaboradoresPage.tsx`, backup em `C:\Users\pedro.oliveira\`. Nada disso existe no painel do Diego, que tem `atendimento_auditoria`, `kb_documents`, `user_area_access`.

**Duas consequências práticas:**

**(a) Colisão de nome.** Dois sistemas internos chamados "Hub MaisTODOS", no mesmo servidor. O portal do Pedro está em `astronauta`, o do Diego vai para `hub.maistodos.com.br` — que é justamente o nome mais genérico dos dois. Vale alinhar com o Diego antes de a confusão virar tíquete de suporte (D-38).

**(b) É o padrão de segurança mais próximo que temos** até o documento oficial da TI chegar, e tem coisa madura ali para reaproveitar:

| O que o portal já resolveu | Aproveitamento no Hub |
|---|---|
| View com mascaramento de PII + RPC de contato liberado só para self/admin | Mesmo padrão para dado de colaborador (T-18) |
| Sanitização server-side com CHECK constraint + DOMPurify no front | Portar direto — o Hub tem campo de texto livre e observação |
| `api_tokens` com hash SHA-256, escopo por campo, audit por trigger | Modelo pronto para quando o Hub expuser API |
| Expurgo por cron (TTL 90 dias em telemetria) | Mesmo mecanismo para `ai_queries` / `ai_usage` |
| Labels Traefik de headers já escritas e revisadas | Ponto de partida — **com uma ressalva séria, abaixo** |

> ⚠️ **A CSP daquele arquivo não serve como está.** O `default-src 'self'; script-src 'self' 'unsafe-inline'` proposto lá foi escrito **sem saber do Akamai**. Com a borda injetando script de RUM, essa policy quebra a página ou é silenciosamente ignorada. Reforça o T-10: Report-Only primeiro, sempre.

> 💡 **Achado que pode valer para o Convenia:** o portal tem uma Edge Function `colaboradores-export` que serve **15 campos de colaborador** ao time de Segurança/Acessos, por token com escopo. Ou seja: **já existe uma fonte de dados de colaborador exposta por API dentro da casa.** Pode ser um atalho — ou pelo menos uma segunda porta, caso o Convenia demore. Virou pergunta D-39 para o Diego.

### A.5 Correção de premissa dos documentos

O handoff diz `hubmaistodos` em `maistodos.br`. Errado nos dois pedaços. **Definido: `hub.maistodos.com.br`**, pedido já aberto com a Infra.

---

## Parte B — Decisões fechadas ✅

| # | Decisão | Resposta |
|---|---------|----------|
| 1 | **Stack do backend** | **Next.js** (ver B.1 — muda o plano) |
| 2 | Dockerfile | Próprio, container Node com SSR. Não usa o padrão nginx da casa |
| 3 | Migrations | Drizzle Kit versionado, aplicado no start com lock, schema 100% derivado de migration |
| 6 | CI | GitHub Actions: lint + typecheck + build. **Sem teste unitário** |
| 7 | CSP com Akamai | Ciclo Report-Only → coleta → enforce, depois do domínio de pé |
| 8 | Headers na origem | `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`. `curl` de fora é critério de aceite da Fase 0 |
| 9 | Segredos | Token só em runtime via `process.env` no servidor. Build arg só para o que é público. `.env` fora do versionamento desde o primeiro commit |
| 10 | Backup | S3 Destination cadastrado + **restore testado** antes de fechar a Fase 0 |
| 11 | Storage | Bucket externo, app guarda só a URL, **mesmo bucket do backup** |
| 12 | pgvector | Serviço com imagem custom `pgvector/pgvector:pg16` — passo manual, não o template |
| 14 | Conta de IA | **Tudo MaisTODOS.** Nada em nome da Adabtech |
| 15 | Embeddings | Modelo + dimensão fechados antes de criar a tabela; nome e versão gravados na linha do chunk |
| 16 | Controle de custo de IA | **Não entra no MVP** |
| 17 | Protótipo Lovable | Era esboço, nunca esteve em produção |
| 20 | Dado de colaborador | Sai do bundle JS, vira consulta autenticada |
| 21 | Migração de `src/data/` | Script de migração se o conteúdo for real (D-21) |
| 22 | Repositório | Branch protection assim que o repositório oficial chegar (D-04) |
| 24 | Prazo | Apresentar cortado por fase, nunca como número único |
| 25 | Fase 4 | Escopo separado, não embutido no contrato do MVP |

### B.1 🔄 A mudança de stack: Next.js

Você escolheu Next.js em vez de TanStack Start. Registro o que isso muda, para não virar surpresa no meio do caminho:

**O que fica mais fácil**
- Padrão de mercado, mais gente consegue dar manutenção depois.
- Server Actions e Route Handlers cobrem bem a camada de API sem framework extra.
- `output: 'standalone'` gera imagem Docker enxuta.
- Middleware nativo para o guarda de rota e para injetar headers.
- Se a Fase 4 (CRM) crescer, o ecossistema acompanha melhor.

**O que fica mais caro — e é honesto dizer**
- **O front não porta direto.** O protótipo é TanStack Router com layout `_authenticated` e 40+ rotas em `routeTree.gen.ts`. Em Next vira App Router com route group `(authenticated)`. As **telas e componentes** (`AcaoSensivel`, `GuardaOperacional`, shells, design system) portam bem — é o **roteamento e o data loading** que são reescrita, não copy-paste.
- Estimativa realista: **+3 a 5 dias** só no porte de rotas e loaders, comparado a manter TanStack.
- `src/server.ts` do protótipo (que já emite os quatro headers) **não porta**. Em Next isso vira `headers()` no `next.config.js` + middleware.

**Decisões que vêm junto e eu vou assumir se você não disser o contrário:**
- App Router (não Pages), React Server Components onde fizer sentido
- Server Actions para escrita, Route Handlers para o que precisar de contrato REST
- Guarda de rota no `middleware.ts` **e** revalidação no servidor a cada ação — nunca só no middleware
- Drizzle como ORM, mantendo a decisão 3

> A regra que sobrevive à troca de stack continua valendo: **o que protege é a checagem no servidor**. Em Next é ainda mais fácil errar isso, porque a fronteira entre client e server component é sutil. Toda função de escrita revalida papel antes de tocar no banco, sem exceção.

### B.2 Notas das decisões fechadas

**Decisão 9 — APIs.** Combinado: você levanta a documentação e me manda depois. Vou desenhar a camada de integração com adaptador por sistema (`src/integrations/{sistema}/`), assim plugar cada API é implementar uma interface, não refatorar.

**Decisão 13 — Provedor de IA.** Em standby: você tem as especificações da Maísa, qual IA ela usa e as credenciais. Isso **destrava a decisão 15** (modelo e dimensão do embedding), que não dá para fechar antes — e a dimensão precisa estar decidida antes de criar a tabela de chunks, senão reindexa tudo depois.

**Decisão 16 — Sem controle de custo.** Anotado. As tabelas `ai_queries` e `ai_usage` continuam existindo (registro de consumo é barato e serve para auditoria), só não construo limite nem alerta. Se o custo surpreender depois, o dado para diagnosticar já vai estar lá.

**Decisão 17 — Lovable era esboço.** Isso **rebaixa o achado P1** do briefing: o clickjacking descrito nunca esteve em produção. O que continua valendo é o item da Parte A.3 — o ambiente MaisTODOS de verdade não tem esses headers hoje, e essa é a pendência real.

**Decisão 10 — Falta escolher o provedor do bucket.** Você confirmou o desenho, mas não o fornecedor. 🎯 *Recomendo Cloudflare R2*: sem custo de egress, compatível com S3, e vídeo de base de conhecimento é exatamente carga de leitura repetida. Alternativas: Wasabi (mais barato no armazenado, egress limitado) ou AWS S3 (se a MaisTODOS já tem conta AWS, some no contrato existente). **Se você não escolher, sigo com R2.**

---

## Parte C — Pendências

### C.1 Sem resposta suas (2)

**P-01 — Homologação (era decisão 4).** Dois environments (`staging` e `production`) no mesmo project do Dokploy, mesma máquina, com limite de CPU/memória no container de staging? É o único caminho sem provisionar servidor novo. Se a resposta for "não quero staging dividindo host com produção", a alternativa é pedir uma segunda VPS à Infra — e aí vira dependência externa.

**P-02 — Gate de deploy (era decisão 5).** `develop` → staging automático, `main` → produção só via PR com branch protection? Hoje o padrão da casa é push direto em produção. Recomendo quebrar esse padrão **só para o Hub**, porque ele executa liberação de cashback em sistema produtivo. **Agora depende só de você** — o repositório nasce no seu padrão.

~~**P-03 — Autenticação**~~ ✅ **fechado** — ver Parte 0.2.

**P-04 — Onde roda o Postgres (era decisão 19).** Continua travado na Infra (D-06). Sua posição preferida: (b) RDS da MaisTODOS **se** entregarem com pgvector e liberarem a rede (a VPS está fora da AWS — exige IP no security group ou VPN); senão (a) Postgres no Dokploy, com backup obrigatório antes de qualquer dado real.

### C.2 Travadas em terceiros — status atualizado

| Item | Depende de | Status |
|------|-----------|--------|
| Banco de dados | Victor Betini (Infra) | ⏳ pedido a abrir |
| Subdomínio + Akamai | Victor Betini (Infra) | ✅ pedido aberto |
| Repositório oficial | ~~Diego~~ → **você** | 🔧 ação sua |
| Integração Convenia | ~~RH~~ → **você já tem** | ✅ resolvido, ver Parte 0.6 |
| **Lista de setores do Convenia como estão escritos** | RH / seu ambiente | ⚠️ ainda necessária para o de-para |
| Identidade visual da Maísa | ~~time de marca~~ → **você já tem** | ✅ resolvido |
| Documento de segurança | ~~TI~~ → **você já tem o padrão MaisTODOS** | ✅ resolvido |
| Token do Notion (11 espaços) | Nikelly + admins de workspace | ⏳ solicitado, não veio |
| Qual API o Retool chama | Compa → autor do fluxo | ⏳ via Compa |
| Credenciais rotacionadas | donos dos sistemas de cashback | ⏳ **não rotacionadas ainda** |
| Versão Markdown do handoff (contratos de API) | Diego | ⏳ pedir — barato e destrava a Fase 3 |
| Provedor de IA e embeddings | você mandar as specs da Maísa | ⏳ você |
| Documento de segurança da TI | TI, só se você confirmar que precisa | 🔧 R-03 |
| Retenção da trilha + DPO | jurídico | ⏳ desenvolver com 5 anos |
| ~~Autenticação~~ | — | ✅ fechado |
| ~~Migração de `src/data/`~~ | — | ✅ conteúdo é **real**, migra |
| ~~Dado de colaborador~~ | — | ✅ aberto a todos, só dado corporativo |

---

## Parte D — Fase 0 revisada

| # | Item | Status |
|---|------|--------|
| 1 | Property/subdomínio `hub.maistodos.com.br` na Akamai | ✅ **pedido aberto** |
| 2 | Definir e provisionar o banco com pgvector | ⏳ Victor Betini / P-04 |
| 3 | Provisionar bucket (backup + documentos) — recomendo R2 | 🔧 falta escolher fornecedor |
| 4 | Criar project no Dokploy com 2 environments | ⏳ P-01 |
| 5 | **Criar o repositório oficial + convidar Diego e Compa** | 🔧 **ação sua, destravada** |
| 6 | Branch protection + CI | ⏳ P-02 |
| 7 | Dockerfile Next standalone | ✅ decidido |
| 8 | Headers em `next.config` + middleware, CSP Report-Only, medição de fora | ✅ decidido |
| 9 | Documento de segurança da TI | 🔧 R-03 — não bloqueia se você concordar |

**Critério de saída da Fase 0:** a aplicação responde em `hub.maistodos.com.br` e o `curl` de fora mostra os quatro headers chegando ao navegador.

```bash
curl -sI https://hub.maistodos.com.br | grep -iE "x-frame-options|content-security-policy|strict-transport|x-content-type"
```

Se sair da origem e não chegar, é a borda comendo — correção é ticket no Akamai, não no Next.

---

## Parte E — Impacto acumulado no plano

Três coisas que o handoff técnico não previa, e uma que surgiu agora:

1. **Provisionar o subdomínio era dependência externa crítica** — ✅ resolvido, pedido aberto para `hub.maistodos.com.br`.
2. **O CSP ficou mais caro do que parecia.** A borda injeta script, então tem ciclo Report-Only → coleta → enforce, que só roda com o domínio real de pé. **+2 a 3 dias** de Fase 0.
3. **Backup não existe no ambiente e o Hub é o primeiro a precisar.** Trilha de auditoria com prazo de guarda jurídico (D-31) num servidor sem backup é contradição. Provisionar o bucket é pré-requisito da Fase 1.
4. 🆕 **A troca para Next.js adiciona +3 a 5 dias** no porte de rotas e data loading. As telas e o design system continuam sendo o maior ativo aproveitado — isso não muda.

---

*Documento interno Adabtech, v2.0 de 03/09/2026.*
