# Hub MaisTODOS — Decisões de produto

**Versão:** 1.0
**Data:** 03/09/2026
**Fonte:** retorno do Diego Torini de 03/09/2026, respondendo às 37 perguntas da Adabtech.
**Uso:** este é o norte de implementação. Regra fechada aqui não se reabre sem falar com o Diego.

> Marcação do Diego: **DECIDIDO** = fechado. **PROPOSTA** = sugestão dele, ainda depende de validação de terceiro ou da minha confirmação técnica.

---

## 1. Identidade e acesso

| Tema | Decisão |
|------|---------|
| Login | Google Workspace restrito a `@maistodos.com.br`. Foi assim que 16 das 18 contas do protótipo entraram. Sem login isolado |
| IdP central | Não confirmado se existe Azure AD/Okta além do Google Workspace — quem responde é a Infra |
| Fonte da permissão | **Convenia**, definindo setor e nível automaticamente. Sem configuração manual como regra |
| Sincronização | ⚠️ **Corrigido em 03/09** — ver 1.1. Não é possível sincronizar no login: a Convenia não tem busca por e-mail. Cron varre e espelha; o login lê só o banco |
| Domínio | `hub.maistodos.com.br` — **DECIDIDO** |

### Desligamento e mudança de setor

**DECIDIDO:** cadastro inativado ou removido no Convenia → **o acesso some do Hub, sem exceção**, inclusive para quem tinha liberação manual. A pessoa não é mais da empresa.

**PROPOSTA do Diego** (mudança de setor): permissão automática recalculada na hora, liberação manual continua valendo mas **aparece sinalizada na tela de acessos** para o admin revisar. Motivo: ninguém perde acesso no meio de um atendimento por ter mudado de área, e a exceção não fica esquecida para sempre.

> ✅ **Aceito, com um reforço:** toda exceção manual nasce com **prazo de validade** (sugestão: 90 dias) e uma data de revisão. A sinalização resolve o "esquecida para sempre" só se alguém olhar a tela; o prazo resolve mesmo que ninguém olhe. Expirou, cai sozinha — e o admin reconcede em dois cliques se ainda fizer sentido.

### 1.1 ⚠️ Correção: a sincronização no login não existe

A regra aprovada era "sincronizar no login + varredura diária". **Metade dela é impossível**, e isso foi
descoberto no contrato real da API (documento `INTEGRACAO_CONVENIA_E_MAISA.md`, extraído do código em
produção do Hub P&C).

**Motivo:** a Convenia **não tem endpoint de busca por e-mail**. Só existe `GET /employees/{id}` (exige já
ter o id) ou `GET /employees` paginado — 17 páginas para 330 pessoas. Consultar a Convenia a cada login
significaria 17 chamadas por pessoa que entra, e o rate limit derruba na terceira.

**Desenho correto:**

```
Cron periódico (2× ao dia)  →  varre a Convenia inteira  →  espelha no banco do Hub
Login do usuário            →  lê SÓ o banco do Hub      →  zero chamadas à Convenia
```

O efeito prático para o usuário é o mesmo: a permissão continua automática e continua atualizada. Só não
é buscada no instante do login. **Não muda nada do que foi combinado com o Diego** — muda como se implementa.

### 1.2 ⚠️ O enum de níveis tem cinco valores, não três

O dado real da Convenia usa: **`N0`, `N1`, `N2-L`, `N2`, `N3`**. A regra que fechamos previa só N1/N2/N3,
então `N0` e `N2-L` (liderança de nível 2) cairiam no vazio.

**Proposta:** `N0` e `N2-L` seguem a mesma regra de N2/N3 — veem a trilha de auditoria, não operam.
Nível fora do enum é descartado, nunca vira permissão (o RH digita livre na Convenia, e erro de digitação
não pode virar acesso).

### 1.3 🔴 Logística não existe na Convenia

O Hub tem "Logística" como área de operação. **Nenhum dos 43 setores da Convenia é Logística** — o mais
próximo é `Supply Chain`. Isso é coerente com o handoff, que descreve Logística como *"setor externo"*.

✅ **RESOLVIDO em 03/09.** O Diego validou com o próprio time: **Logística = `Supply Chain`** na Convenia.
Permissão automática funciona normalmente, sem exceção manual.

### Papéis

| Nível no Convenia | Papel no Hub |
|---|---|
| N1 | Opera atendimento. **É a permissão automática do MVP** — na prática hoje todo mundo é N1, porque não existe painel N2/N3 |
| N2 / N3 | Veem a trilha de auditoria do time, **não operam**. Quando o painel N2 for construído, quem for N2 no Convenia recebe o acesso automaticamente |
| Admin | **Sempre manual, nunca automático** |

### Administradores — DECIDIDO

Três, e o resto entra como usuário comum:

- Ariane Lima — `ariane.lima@maistodos.com.br`
- Diego Daniel Torini — `diego.torini@maistodos.com.br`
- André Comparini — `andre.comparini@maistodos.com.br`

Os 10 admins do protótipo **não migram**. Ambiente novo nasce com a lista limpa.

### Conteúdo x operação — confirmado

Conteúdo é aberto a todo colaborador autenticado: alguém da Logística pode e **deve** conseguir estudar o guia de Crédito PF. Operação é restrita por papel. A permissão derivada do Convenia governa a operação, não o acesso ao conteúdo.

### Conta fora do domínio

A conta externa de 26/08 **não é recriada**. Ambiente novo nasce do zero.

---

## 2. Repositório

**Correção importante do Diego:** ele **não criou repositório nenhum**. A linha marcada como "FEITO" no backlog do handoff era premissa dele, não fato.

**DECIDIDO:** o repositório oficial é **o que a Adabtech criar** — o Diego não tem permissão de administrador na organização do GitHub da MaisTODOS. Acesso para:
- `diego.torini@maistodos.com.br`
- `andre.comparini@maistodos.com.br`

A Ariane acompanha a entrega, não precisa de acesso ao código.

O repositório publicado pelo Compa existe, respondia como público até 31/08 e desde então exige autenticação. Link e acesso ficam na lista de pendências, para pedir direto a ele.

---

## 3. Integrações

### Ordem de ataque — revisada pelo Diego

**Notion e Convenia primeiro, Retool em seguida.**

Mudou em relação ao handoff (que sugeria Convenia → Notion → cashback). Razão do Diego: *"cadastro e documentação são o ponto focal agora, operação de tarefas vem depois. Notion destrava o conteúdo e Convenia destrava as permissões, que são as duas coisas que fazem o Hub existir para o usuário. O Retool é o que transforma consulta em operação."*

Fora do MVP: Jira, Zendesk, Metabase, Motor, Softnex, Univers, Adyen, Awin, Rakuten, Mixpanel.

### Cashback — o que se sabe e o que não se sabe

**Sabe-se:**
- A liberação em lote roda hoje por um fluxo do **Retool**, acionada por CPF no gatilho.
- O resultado é refletido em outras ferramentas, entre elas **Softnex** e **Metabase**.
- A consulta de cashback usa a **API da Solatio**, endpoint `ProspectorAPI/Cashback`, com intervalo de datas e CPF, devolvendo os estados: `pendente`, `autorizado`, `expirado`, `morto`, `cancelado`.

**Não se sabe:** qual API o Retool chama por trás para executar a liberação. Está dentro do fluxo, e o Diego não tem acesso de edição no Retool para exportar.

> 🆕 **Solatio não constava na lista de integrações do handoff.** Entra no mapa de sistemas.
> 📌 Os contratos estão detalhados **na versão Markdown do handoff técnico**, que ainda não recebi — só tenho o PDF. Pedido registrado.

### Contratos de API — recebidos em 03/09

Chegaram na versão Markdown do handoff (v1.1). São os endpoints usados hoje pelo N1 do App.

**Busca de filiado**
```
GET https://api.cartaodetodos.com.br/api/filiado/{cpf}/ctn
Auth: token de portador
```

**Support API** — base `https://wallet.maistodos.com.br/api/`, **autenticação básica com usuário de suporte**

| Operação | Chamada |
|---|---|
| Atualizar contato | `PATCH /v1/admin/support/{cpf}/contact` — e-mail e telefone; valor nulo **remove** o contato |
| Ativar/desativar conta | `PATCH .../account/status/{cpf}` — ação `enable` ou `disable` |
| Alterar documento | `PATCH .../user/{cpf_antigo}/document` |
| Estorno | `POST .../transaction/{id}/refund` — sem corpo |
| Data de liquidação | `PATCH .../transaction/{id}` — com a nova data |
| Segunda via de private label | `POST .../private-label/user/{documento}` |
| Sincronização CDT | `PATCH .../support/{documento}` — retorna `405`, **não confirmado** |

**Consulta de cashback**
```
GET https://server.solatioenergialivre.com.br/ProspectorAPI/Cashback
Params: intervalo de datas (mês/dia/ano) + CPF
Estados: pendente · autorizado · expirado · morto · cancelado
```

**Liberação de cashback** — continua sendo o único ponto cego: roda em lote por um workflow do Retool,
identificado por um código de fluxo, com o CPF no gatilho. **Qual API ele chama por trás segue desconhecido.**

**Metabase** — consulta por `POST /api/dataset` com chave de API. Banco central de filiados, transações e campanhas.

> 🔴 **Risco de auditoria que esses contratos revelam.** A Support API autentica por **usuário de suporte
> compartilhado**, com senha básica. Se o Hub usar essa mesma credencial, **toda ação executada aparecerá
> no sistema de destino como "usuário de suporte"** — não como o atendente que a executou. A trilha do Hub
> sabe quem foi; o sistema que recebeu a ação, não. Isso enfraquece justamente a auditoria que é o coração
> do projeto.
>
> **Encaminhamento proposto:** pedir uma **credencial de serviço dedicada ao Hub** (não o usuário humano de
> suporte) e verificar se a API aceita um cabeçalho identificando o atendente. Se não aceitar, registrar a
> limitação de forma explícita — é decisão consciente, não descuido.

### Notion — espaços a sincronizar

Allowlist fechada, com todos os subquadros de cada espaço:

1. MAISTODOS
2. Processos Pagamentos
3. Suporte Técnico e Operações
4. Soluções de Pagamentos, clientes e documentações
5. Solução de Crédito (documentação em construção)
6. CX e Operações, App e Lealdade
7. Fluxo de validação facial com KYC
8. KYC, Liveness e Biometria
9. CX/CS Soluções de Cashback
10. Freemium
11. Mapeamento de erros, App

**Regra confirmada:** sincronizar só esta lista, **nunca o workspace inteiro** — o Notion da MaisTODOS tem RH, financeiro e informação sensível.

**Token:** solicitado à Nikelly, ainda não veio. O Diego não administra os workspaces.

### Credenciais expostas

**As senhas não foram trocadas.** Confirmado que as coleções trazem credencial em texto claro, incluindo a senha do usuário de suporte já exposta anteriormente.

**Regra fechada:** rotação é pré-requisito. Quando as credenciais forem liberadas, vêm **já trocadas e direto para o cofre do ambiente, nunca por mensagem**.

### Ambiente de teste

Nenhuma API foi coletada, então não há como confirmar se existe homologação em MaisCash, Motor ou Softnex. Se não houver sandbox, testar liberação de cashback contra produção exige **conta de filiado de teste combinada com o dono da operação** — não se testa sem isso.

---

## 4. Auditoria

**PROPOSTA do Diego, aceita:**
- **Link do chamado obrigatório.** Pode ser do **Zendesk** (atendimento ao filiado) ou do **Jira** (chamado técnico interno) — não são concorrentes, são contextos diferentes.
- **Número extraído automaticamente do link** quando o formato permitir.
- **Motivo continua obrigatório**, porque é o que dá contexto quando alguém revisar meses depois.

**Retenção:** **5 anos** — proposta do Diego, ainda não é decisão do jurídico. Desenvolver com 5 anos (cenário mais conservador); se vier menor, ajusta-se a rotina de expurgo.

**Regras que não mudam:** gravação no servidor na mesma transação da execução, trilha só aceita inserir e ler (nunca alterar nem apagar), dado pessoal mascarado, leitura restrita a gestor e admin, e ação que falhou também vira registro.

---

## 5. Conteúdo

### O conteúdo atual é real

As ~3.900 linhas em `src/data/` são **conteúdo real**, extraído do Notion manualmente, com alguns trechos ajustados para tirar informação desnecessária. **Não é mock** — é material de trabalho.

### Fonte da verdade — PROPOSTA aceita

| Tipo de conteúdo | Fonte | Fluxo |
|---|---|---|
| Processo e documentação | **Notion** | Edita no Notion → o Hub puxa e exibe |
| Material didático e vídeo de treinamento que não existe no Notion | **Hub** | Nasce e vive no Hub |

Assim ninguém precisa lembrar de atualizar em dois lugares.

### Regras de negócio do Compa

Ainda não consolidadas em fonte única. **PROPOSTA aceita:** quando ficar pronto, entregar **no Notion, dentro de um dos espaços da lista acima** — entra pelo mesmo caminho da sincronização, sem virar mais um formato para tratar.

### Dados de colaborador — opção (a), com duas condições

Continua **visível para todo colaborador**, organizado como lista do time por área. O valor é justamente alguém de outro setor saber com quem falar.

Condições do Diego:
1. **Apenas dado corporativo** — nome, cargo, e-mail e ramal/telefone corporativo. **Nunca telefone pessoal.**
2. **Sai do pacote entregue ao navegador**, virando consulta autenticada.

### Upload de material — PROPOSTA do Diego

Sem limite definido do lado deles. Volume: *"pode estar em 10 hoje e em 1000 no ano que vem."*

- Documento e apresentação: **até 50 MB por arquivo**
- **Vídeo hospedado fora do Hub** — Drive ou YouTube não listado da empresa — com o Hub guardando o link e exibindo embutido
- Armazenamento que escale sem migração

> ⚠️ **Ressalva técnica ao vídeo fora do Hub:** "YouTube não listado" não é controle de acesso — qualquer pessoa com o link assiste, inclusive fora da empresa. Para material didático genérico, tudo bem. Para vídeo que mostre tela de sistema, dado de filiado ou processo interno sensível, **Drive corporativo com permissão restrita ao domínio** é o único aceitável. Regra sugerida: vídeo de processo → Drive restrito; vídeo institucional → YouTube não listado, se quiserem.

---

## 6. Assistente Maísa

| Tema | Decisão |
|------|---------|
| Identidade visual | ✅ **Resolvido** — a Adabtech já tem a identidade da Maísa (foi ela que construiu). Não trava nada |
| Escopo de resposta | Responde **sobre qualquer time**, não só o setor da pessoa. É um agente da MaisTODOS, coerente com o conteúdo ser aberto |
| Fundamentação | Só com base no conteúdo indexado, cita fonte com versão e data, e diz "não encontrei" em vez de inventar |
| Conta do provedor | **No nome da MaisTODOS, sem repasse.** Não querem contratação intermediada |
| Extensão de navegador | `maisia-copiloto` **fica para depois**, fora do escopo. A Maísa como identidade do assistente **entra agora** |

### Orçamento de IA — PROPOSTA do Diego

Não existe teto definido hoje. Proposta para a fase de validação:
- Teto mensal baixo, **na casa de algumas centenas de reais**
- **Alerta em 70%**
- **Limite por usuário**
- Com o painel de consumo no ar por um mês, trocar o chute por dado real e levar o número medido para aprovação

> ⚠️ **Atenção:** isso **contradiz a decisão técnica 16**, que dispensou controle de custo no MVP. O cliente está pedindo explicitamente alerta e limite. Ver `DECISOES-TECNICAS-MATHEUS.md`, item R-03.

### Texto livre no chat

Aviso claro na tela + **mascaramento de CPF e e-mail antes do envio** ao provedor. Se o jurídico pedir bloqueio ativo ao detectar padrão de CPF, implementa-se — por isso o mascaramento fica **centralizado num ponto só**, para virar bloqueio ser mudança pequena.

---

## 7. Segurança e processo

### Documento de segurança da TI

O Diego corrigiu: os dois PDFs não são o documento da TI, e nisso ele concorda comigo.

**Posição dele:** o acordado na call é que a Adabtech desenvolve dentro do padrão de segurança que já usa nos demais sistemas da MaisTODOS, e que além do código em zip não seria necessária documentação adicional — foi esse acordo que os tirou da fila de validação.

✅ **Resolvido em 03/09:** a Adabtech já tem o padrão de segurança da MaisTODOS e é o que segue. Não há pedido a abrir com a TI, e isso não bloqueia o início.

### Revisão do time de segurança — encerrada

Não entra na fila de validação que travava o protótipo. **Não é etapa do projeto.**

Ressalva do Diego: como o Hub trata CPF, e-mail e telefone de filiado e vai executar liberação de cashback, se em algum momento o time de segurança pedir revisão da entrega final, ele avisa com antecedência para alinhar critérios antes — nunca no fim.

### LGPD

Diretriz: tudo dentro das normas, incluindo LGPD. Ainda em aberto com o jurídico: quem é o encarregado de dados e se há exigência de relatório de impacto para sistema interno.

---

## 8. Validação

O Diego valida o módulo de App, que é onde ele domina o processo. Na expansão, **cada líder de time valida o conteúdo do próprio setor**. Não há ninguém que precise aprovar antes da liberação para os times.

---

## 9. Painel N2

O painel em si fica em **standby**, não é construído agora.

**O que se mantém:** a opção de marcar N2 na tela de gestão de acessos, para conseguirem ajustar a definição a qualquer momento e para que, quando o painel existir, quem for N2 já esteja configurado.

> ✅ Sem custo: o campo já existe no protótipo e o modelo de `user_area_access` já suporta (`app_n2`). Mantém.

---

## 10. Correções de nomenclatura — confirmadas

**MaisCash** (não MyCash) · **Univers** (não Universe) · **Adyen** (não Adem) · **Motor** e **Softnex** são dois sistemas separados — Motor para transações do App, Softnex para private label e carteirinhas.

🆕 Acrescentar ao mapa: **Solatio** (`ProspectorAPI/Cashback`), fonte da consulta de cashback.

---

## 11. Lista de pendências — o que precisa ser obtido e com quem

Consolidada pelo Diego. Nenhum desses acessos é dele para conceder. **Proposta dele: levar a lista inteira ao Compa de uma vez**, porque ele transita entre as áreas e destrava mais rápido do que abrir chamado sistema a sistema.

### Com a Infra — Victor Betini
- [ ] Banco de dados: definição de RDS ou instância própria, **pgvector habilitado**, liberação de rede para o servidor do Hub (que está fora da AWS)
- [ ] Subdomínio `hub.maistodos.com.br`, **incluindo a configuração na camada da Akamai** — não só o DNS

### Com o Compa — André Comparini
- [ ] Link e acesso ao repositório que ele publicou, para consolidação
- [ ] Quem construiu o fluxo de liberação de cashback no Retool, e acesso para exportar o fluxo
- [ ] Quem é o dono de cada sistema da lista de integrações — não existe ponto focal único
- [ ] As regras de negócio consolidadas, quando o levantamento fechar

### Com o RH
- [x] ~~Quem administra o Convenia, endereço da API e token~~ — ✅ **a Adabtech já tem a integração do Convenia**
- [ ] **Exportação da lista de setores** como estão escritos no Convenia, mais confirmação dos campos por pessoa (setor/área, nível hierárquico, cargo, status ativo/desligado) — *só continua necessário se a integração da Adabtech não acessar a conta da MaisTODOS*

### Com a Nikelly e os administradores do Notion
- [ ] Token de integração de cada workspace, para os 11 espaços do item 3

### Com os donos dos sistemas de cashback
- [ ] Credenciais das APIs, **já rotacionadas**, entregues direto no cofre do ambiente
- [ ] Conta de filiado de teste, ou confirmação de que existe ambiente de homologação

### Com o jurídico
- [ ] Retenção da trilha de auditoria (proposta: 5 anos)
- [ ] Quem é o encarregado de dados e se há exigência de relatório de impacto

### Com a TI
- [x] ~~Documento de segurança~~ — ✅ **não é necessário.** A Adabtech já tem o padrão da MaisTODOS

### Interno MaisTODOS
- [ ] Quem contrata e paga a conta do provedor de IA

### Do lado da Adabtech
- [x] ~~Subdomínio pedido à Infra~~ — feito
- [ ] **Criar o repositório oficial** e dar acesso ao Diego e ao Compa

---

## 12. De-para de setores — rascunho para validar

Os **43 setores literais** da Convenia estão documentados. As áreas de operação do Hub são seis. A proposta
abaixo é rascunho técnico: **quem valida é o Diego.**

### Regra estruturante proposta

> **Só `CX` e `CS` recebem permissão de operação automática.** São os times que atendem o filiado
> diretamente. `Produto`, `Tech`, `Comercial` e os demais recebem **conteúdo**, que já é aberto a todos,
> mas não operam. Quem precisar operar sem ser CX/CS entra por exceção manual.

Isso resolve o de-para sem inventar regra: o prefixo do setor já carrega a função.

| Setor na Convenia | Área do Hub | Opera? |
|---|---|---|
| `CX - APP CDT` | app | ✅ |
| `CX - Conta Digital` | conta-digital | ✅ |
| `CX - Crédito PF` | credito-pf | ✅ |
| `CX - Pagamentos` | pagamentos | ✅ |
| `CS - Banking` | conta-digital | ✅ |
| `CS - Cashback` | cashback | ✅ |
| `CS - Crédito` | credito-pf | ✅ |
| `CS - Pagamentos` | pagamentos | ✅ |
| `Comercial - Cashback` | cashback | ❌ **só consulta por ora** — entra quando a operação do App estiver validada |
| `Supply Chain` | **logistica** | ✅ **confirmado pelo time de Logística** |
| `Crédito PJ` | **credito-pj** 🆕 | ❌ **nova área, só consulta** — definida quando houver conteúdo no Notion |
| `Prevenção à Fraude` | — | ❌ só conteúdo |
| `APP - Produto`, `Produto - *`, `Tech - *`, `Crédito - *`, `Crédito PF`, `Crédito PJ` | — | ❌ só conteúdo |
| `BI`, `Business Analytics`, `CRM`, `Diretoria`, `Financeiro`, `FP&A`, `Growth`, `Marketing`, `Melhoria Contínua`, `Pessoas e Cultura`, `QA`, `Segurança Da Informação`, `SRE`, `Tecnologia e Dados`, `UX/UI` | — | ❌ só conteúdo |
| `Marketing, CRM, Growth, CX e Operações App e Cashback` | ❓ | ❓ nome é uma frase inteira, resíduo de diretoria no campo errado |

**Status das perguntas — 03/09:**

1. ✅ **`Crédito PJ` vira área nova no Hub**, de consulta. Será definida assim que a sincronização com o
   Notion trouxer conteúdo do time. Não opera no MVP.
2. ✅ **`Comercial - Cashback` só consulta** por ora. A intenção é trazer todas as operações para a
   plataforma depois que a operação do App estiver validada.
3. ⏳ **`Marketing, CRM, Growth, CX e Operações App e Cashback`** — o Diego devolveu a pergunta: esse setor
   tem pessoas vinculadas? Tem ramificações? **É pergunta de dado, não de opinião** — a resposta sai de uma
   consulta à Convenia (`GET /departments` + contagem de colaboradores nesse `department`). Enquanto não
   medirmos: **leitor de conteúdo apenas**, conforme ele propôs.

> 🔑 **A regra confirmada pelo Diego, na palavra dele:** *"todos os times podem visualizar conteúdo de
> processos de todas as áreas, a única trava seria executar as tarefas do fluxo operacional — aí somente
> os correspondentes de cada time."* É exatamente a regra CX/CS proposta.

**Regra de implementação:** o de-para vive como **tabela de dados**, uma linha por string literal, nunca
como `if/else` no código. Setor novo aparece sem aviso na Convenia, e sem tabela ele cai num `default`
silencioso. Setor não mapeado = **sem operação, com conteúdo** — falha para o lado seguro.

---

## 11.B 🔴 Consulta real à Convenia — 03/09/2026

Rodei a API da Convenia com o token das três empresas para responder a pergunta do Diego sobre o setor
`Marketing, CRM, Growth, CX e Operações App e Cashback`. **A resposta é "não existe" — e o resto do que
apareceu muda o de-para inteiro.**

**Base medida:** 307 colaboradores · CredTodos 219 · GanhaTodos 47 · PagTodos 41 · 269 ativos, 38 de férias.

### 11.B.1 A lista de setores mudou. São 21, não 43

O documento do Hub P&C trazia 43 setores, com o produto embutido no nome (`CX - Pagamentos`,
`CX - Conta Digital`, `CX - APP CDT`…). **Esses setores não existem mais.** A MaisTODOS reestruturou:

| Nº | Setor | Pessoas |
|---|---|---|
| 1 | Tecnologia | 109 |
| 2 | **CX, Ops e Atendimento ao Cliente** | **32** |
| 3 | Comercial - Transações Financeiras PF | 19 |
| 4 | Pessoas e Cultura | 18 |
| 5 | Produto | 16 |
| 6 | Financeiro | 12 |
| 7 | Risco de Crédito e Cobrança | 11 |
| 8 | Diretoria | 10 |
| 9 | Design | 9 |
| 10 | Prevenção à Fraudes | 9 |
| 11 | Marketing | 8 |
| 12 | Dados | 8 |
| 13 | Segurança da Informação | 8 |
| 14 | Inteligência de Negócios | 7 |
| 15 | CS - Cashback | 7 |
| 16 | CRM | 5 |
| 17 | FP&A | 5 |
| 18 | Comercial - Cashback | 5 |
| 19 | Comercial - Transações Financeiras PJ | 4 |
| 20 | **Supply Chain** | **4** |
| 21 | Jurídico | 1 |

**Todo o atendimento vive num setor só:** `CX, Ops e Atendimento ao Cliente`, com 32 pessoas. O setor
**não diz mais qual produto a pessoa atende** — e o cargo também não: são "Analista de Atendimento Jr" (15),
"Analista de Suporte Técnico Jr", "Analista de Operações". Nenhum menciona App, Cashback, Conta Digital
ou Pagamentos. O campo `team` também não ajuda: só existem três valores — Tech (133), Negócios (130) e
vazio (44).

> ✅ **`Marketing, CRM, Growth, CX e Operações App e Cashback` tem ZERO pessoas.** Não é setor, é resíduo.
> Provavelmente virou a Diretoria `MKT, CRM, OPS & CX`. **Pode ser descartado do de-para.**

### 11.B.2 ✅ Existe um campo que resolve: `Produto`

O de-para não está morto — só não está onde a documentação dizia. Nos campos personalizados existe um
campo **`Produto`**, e ele carrega exatamente a área de operação do Hub:

```
Crédito PF · Crédito PJ · Conta Digital · Pagamentos
```

E ele é **multi-valor**: a mesma pessoa pode ter `"Crédito PF, Crédito PJ"` ou `"Crédito PJ, Conta Digital"`.
Isso encaixa perfeitamente no modelo de `user_area_access` do Hub, que já é uma permissão por área, não uma
área única por pessoa.

Junto vêm outros dois campos úteis:
- **`Tipo de área`**: `Alocada` ou `Cross` — quem é Cross atende mais de uma área;
- **`Diretoria`**: no time de atendimento, todos são `MKT, CRM, OPS & CX`.

> ⚠️ **O custo disso:** `Produto` é campo personalizado, e campo personalizado **só existe no endpoint de
> detalhe** — uma chamada por pessoa. Confirma o desenho de cron + espelho, e reforça que a permissão
> nunca pode ser buscada no login.

**Ainda falta medir:** os valores completos de `Produto` nas 307 pessoas. A amostra de 8 mostrou quatro
valores, mas App, Cashback e Logística ainda não apareceram — pode ser só a amostra, pode ser que esses
times usem outro rótulo. Isso se resolve com um levantamento completo, não com pergunta.

### 11.B.3 🔴 O "N1" do projeto NÃO é o N1 da Convenia

Este é o achado mais importante, e ele contradiz uma premissa que já estava fechada.

O projeto inteiro diz *"o MVP é o N1, que atende o filiado diretamente"*. Mas na Convenia, medido:

| Cargo real | Nível na Convenia |
|---|---|
| Analista de Atendimento Jr | **N3** |
| Analista de Operações Jr / Pl | **N3** |
| Coordenador de Atendimento | **N2-L** |
| Coordenador de Operações e Suporte Técnico | **N2-L** |
| Gerente de Operações e Customer Experience | **N2-L** |

São **duas escalas opostas com os mesmos nomes**:

- **No atendimento**, N1 é o primeiro nível de suporte — quem fala com o filiado. N2 e N3 são escalonamento.
- **Na Convenia**, o nível é hierárquico e desce: N0/N1 no topo, `N2-L` para liderança, **N3 para a base**.

> 🔴 **Se mapearmos "N1 da Convenia → opera atendimento", o Hub vai liberar operação para a diretoria e
> negar para os atendentes.** Exatamente o contrário do que o Diego pediu.

**Correção proposta:** a permissão de operação **não deve ser derivada do nível**. Ela sai do campo
`Produto` (a área) combinado com o setor `CX, Ops e Atendimento ao Cliente` (a função). O nível serve para
distinguir **quem lidera** — `N2-L` vê a trilha de auditoria do time — não para dizer quem opera.

Precisa de confirmação do Diego, mas o dado é claro.

### 11.B.4 Outros achados operacionais da mesma consulta

- **`GET /departments` responde 404.** O catálogo de setores documentado não existe nesta API. A lista sai
  da paginação de `/employees` mesmo.
- **A Convenia está atrás de Cloudflare** e bloqueia cliente sem `User-Agent` de navegador (erro 1010).
  Sem isso, toda chamada volta `403` e parece problema de credencial.
- **3 pessoas sem e-mail corporativo** — confirma a necessidade da fila de pendentes.
- **Todos têm gestor preenchido** (0 sem `supervisor`), o que facilita a resolução em duas passadas.
- ⚠️ **O detalhe traz `Numero SUS`** — número do cartão do SUS, dado pessoal sensível de saúde. **Não deve
  ser espelhado no Hub em hipótese alguma.** O sync tem que ter allowlist de campos, não copiar o objeto
  inteiro.

---

## 11.C ✅ De-para fechado — levantamento completo (307 pessoas, 04/09/2026)

Busquei o campo `Produto` de **todas as 307 pessoas** das três empresas. O de-para está resolvido.

### 11.C.1 Os valores reais de `Produto`

| Valor | Pessoas | Área do Hub |
|---|---|---|
| *(vazio)* | 120 | — |
| **Crédito PF** | 53 | `credito-pf` |
| **App** | 38 | `app` |
| **Cashback** | 38 | `cashback` |
| **Pagamentos** | 21 | `pagamentos` |
| **Conta Digital** | 20 | `conta-digital` |
| **Crédito PJ** | 14 | `credito-pj` 🆕 |
| Plataforma | 10 | — não é área do Hub |
| Sondas | 8 | — não é área do Hub |

**As seis áreas do Hub aparecem**, com a nomenclatura idêntica à do painel. O de-para é praticamente 1:1 —
não precisa de tradução, só de normalização de acento e caixa.

### 11.C.2 A regra final

> **Área de operação = campo `Produto`** (multi-valor, separado por vírgula), **quando preenchido.**
> **Exceção:** `Supply Chain` → `logistica`. As 4 pessoas do setor têm `Produto` vazio, então a Logística
> se resolve pelo setor, não pelo produto.
> **Quem opera** = setor `CX, Ops e Atendimento ao Cliente` ou `CS - Cashback`, **com `Produto` preenchido.**
> `Plataforma` e `Sondas` não são áreas do Hub e são ignorados.

### 11.C.3 O time de atendimento, pessoa a pessoa

`CX, Ops e Atendimento ao Cliente` — 32 pessoas:

| `Produto` | Pessoas |
|---|---|
| *(vazio)* | **10** ⚠️ |
| Pagamentos | 5 |
| App | 5 |
| Crédito PF | 4 |
| Crédito PF, Crédito PJ | 3 |
| Conta Digital | 2 |
| Cashback | 2 |
| Crédito PJ, Conta Digital | 1 |

`CS - Cashback` — 7 pessoas: 6 em `Cashback`, 1 em `App`.

**Tipo de área no atendimento:** Alocada 20 · Cross 7 · Fixa 5.

> ⚠️ **Ação concreta para o Diego:** **10 das 32 pessoas do atendimento estão com `Produto` vazio na
> Convenia.** Elas não receberão permissão de operação automática. Não é problema do Hub — é cadastro
> incompleto no RH, e é uma lista pequena e resolvível. **Pedir ao RH que preencha o `Produto` dessas 10
> pessoas** é mais barato que construir exceção manual para cada uma.

### 11.C.4 A escala de níveis, medida nas 307 pessoas

| Nível | Pessoas |
|---|---|
| **N3** | **217** |
| N2-L | 50 |
| N2 | 28 |
| N1 | 8 |
| N0 | 2 |
| *(vazio)* | 1 |
| `Especialização - pos graduado` | 1 ⚠️ lixo de digitação |

Confirma o que a amostra já indicava: **N3 é a base da pirâmide (217 de 307)** e N1 são 8 pessoas no topo.
O "N1" do jargão de atendimento não tem relação com o N1 da Convenia.

E confirma a regra de descartar valor fora do enum: existe uma pessoa com `Especialização - pos graduado`
no campo Nível. O RH digita livre, e erro de digitação **nunca pode virar permissão**.

### 11.C.5 Diretorias reais (307 pessoas)

Tecnologia & Dados 109 · MKT, CRM, OPS & CX 45 · Finanças 40 · Produto & Design 25 ·
Transações Financeiras 22 · Gov. de Seg. Inf. & Compliance 17 · Pessoas & Cultura 16 · Lealdade 12 ·
Diretoria 10 · Sondas 9 · vazio 2.

O atendimento inteiro vive sob `MKT, CRM, OPS & CX` — que é, quase certamente, o que virou aquele setor
de nome-frase da documentação antiga.

---

## 12. Resolvidos fora do documento

- **D-38 — Colisão de nome:** ✅ sem impacto. O portal do Hub é **outro projeto**, hospedado no domínio do
  astronauta. Não há conflito de endereço. **`hub.maistodos.com.br` confirmado para o Hub do Diego.**
- **D-39 — API de colaboradores do portal:** ❌ descartado. O Convenia resolve melhor e com contrato completo.
- **D-25 / Logo e identidade:** ✅ a Adabtech tem o material e envia. O handoff v1.1 confirma o oficial:
  roxo **`#7600D6`**, verde **`#54B900`** só para sucesso, fundo escuro **`#22023C`** e nunca preto,
  proporção 70/20/10, tipografia **Lexend**. Logos vivem em `src/assets/brand/` — **pasta que não veio no
  export do Lovable**, por isso o arquivo original é necessário.

---

*Documento interno Adabtech, 03/09/2026, consolidado a partir do retorno do Diego Torini.*
