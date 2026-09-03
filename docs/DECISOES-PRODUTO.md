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
| Sincronização | No login + varredura diária de madrugada para pegar desligamento. Webhook, se existir, é melhoria — não trava o desenvolvimento |
| Domínio | `hub.maistodos.com.br` — **DECIDIDO** |

### Desligamento e mudança de setor

**DECIDIDO:** cadastro inativado ou removido no Convenia → **o acesso some do Hub, sem exceção**, inclusive para quem tinha liberação manual. A pessoa não é mais da empresa.

**PROPOSTA do Diego** (mudança de setor): permissão automática recalculada na hora, liberação manual continua valendo mas **aparece sinalizada na tela de acessos** para o admin revisar. Motivo: ninguém perde acesso no meio de um atendimento por ter mudado de área, e a exceção não fica esquecida para sempre.

> ✅ **Aceito, com um reforço:** toda exceção manual nasce com **prazo de validade** (sugestão: 90 dias) e uma data de revisão. A sinalização resolve o "esquecida para sempre" só se alguém olhar a tela; o prazo resolve mesmo que ninguém olhe. Expirou, cai sozinha — e o admin reconcede em dois cliques se ainda fizer sentido.

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

## 12. Seguem sem resposta

Duas perguntas foram acrescentadas depois que o Diego já tinha escrito o retorno, então ainda não foram respondidas:

- **D-38** — Já existe outro sistema chamado "Hub MaisTODOS" (o portal de colaboradores em `astronauta.maistodos.com.br`). Vale diferenciar o nome?
- **D-39** — Aquele portal expõe 15 campos de colaborador por API ao time de Segurança/Acessos. Serve como fonte alternativa ao Convenia, ou como atalho enquanto o acesso ao Convenia não sai?

---

*Documento interno Adabtech, 03/09/2026, consolidado a partir do retorno do Diego Torini.*
