# QA Gate — A2 · Fundação Next.js e núcleo de domínio

**Revisor:** Quinn (Test Architect)
**Data:** 04/09/2026
**Escopo:** `hub/next.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/lib/areas.ts`, `src/lib/permissoes.ts`, `src/lib/convenia/mapa.ts`, `.env.example`, `.gitignore`

## Decisão: ✅ PASS *(reavaliado em 04/09 após correções)*

> Primeira decisão foi **CONCERNS**. Os cinco achados acionáveis foram corrigidos e reverificados
> por medição. O registro original fica abaixo, íntegro, porque gate reescrito não ensina nada.

Fundação sólida e aderente à decisão de produto. Nada bloqueia o avanço, mas **um defeito de correção** e **duas lacunas de segurança/observabilidade** devem ser resolvidos antes de A5 (schema) e antes do deploy em homologação.

---

## Evidência coletada

**Verificação automatizada:** `npm run lint`, `npm run typecheck` e `npm run build` passam limpos (Next 16.3.4, Turbopack).

**Suíte de comportamento executada** contra a regra de acesso, com os dados reais medidos na Convenia — 21 asserções, **20 PASS / 1 FALHA**.

**Headers medidos no servidor real** (`next start` + `curl`), em rota existente **e em 404**:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Content-Security-Policy: frame-ancestors 'none'
Content-Security-Policy-Report-Only: default-src 'self'; ...
```

Os quatro cabeçalhos exigidos saem da origem, inclusive em resposta de erro. Isso satisfaz metade do critério de aceite da Fase 0 — a outra metade só pode ser medida atrás do Akamai.

---

## Achados

### 🔴 QA-A2-01 · Logística nunca recebe permissão de operação — CORREÇÃO · ✅ **RESOLVIDO**

**Severidade:** alta · **Arquivo:** `src/lib/convenia/mapa.ts`

`SETOR_PARA_AREA` mapeia `supply chain → logistica`, mas `SETORES_QUE_OPERAM` contém apenas `cx, ops e atendimento ao cliente` e `cs - cashback`. Como `areasOperacionais()` retorna `[]` quando `setorOpera` é falso, **as 4 pessoas da Logística nunca operam nada.**

```
FALHA  Supply Chain (Logistica)  -> []  (esperado ["logistica"])
```

O código afirma duas coisas contraditórias: um mapa diz que Supply Chain vira Logística, outro diz que Supply Chain não opera. Quem ler vai concluir que a Logística está liberada — e não está.

**Recomendação:** decidir explicitamente e deixar o código dizer uma coisa só.
- Se Logística é área de operação (é uma das seis do Hub, e o Diego confirmou `Supply Chain`), incluir `supply chain` em `SETORES_QUE_OPERAM`;
- Se Logística ainda é só conteúdo no MVP, remover o mapa de setor e documentar que entra na Fase 4.

Não é aceitável manter as duas afirmações no mesmo arquivo.

### 🟠 QA-A2-02 · O CSP Report-Only não reporta nada — OBSERVABILIDADE · ✅ **RESOLVIDO**

**Severidade:** média · **Arquivo:** `next.config.ts`

O plano registrado é "Report-Only → coletar o que o Akamai injeta → promover a enforce". Mas o header emitido **não tem `report-to` nem `report-uri`**, confirmado na medição. Sem destino, o navegador não envia violação para lugar nenhum, e a fase de coleta **não coleta**.

**Recomendação:** antes de subir em homologação, adicionar `report-to` com um endpoint próprio (`/api/csp-report`) que apenas registra a violação. Caso contrário a promoção do CSP vira adivinhação — exatamente o risco que a decisão T-10 queria evitar.

### 🟠 QA-A2-03 · HSTS ausente na origem — SEGURANÇA · ✅ **RESOLVIDO**

**Severidade:** média · **Arquivo:** `next.config.ts`

`Strict-Transport-Security` não é emitido. Hoje quem manda é o Akamai, com `max-age=86400` — **um dia**, muito abaixo do padrão que o próprio `SECURITY.md` da MaisTODOS recomenda (`63072000`, com `includeSubDomains` e `preload`).

**Recomendação:** emitir na origem e levar o ajuste do valor no mesmo chamado do Akamai. Depender da borda para um controle de segurança é a lição que o achado P1 já ensinou neste projeto.

### 🟡 QA-A2-04 · `AREAS_COM_OPERACAO` é código morto — MANUTENÇÃO · ✅ **RESOLVIDO**

**Severidade:** baixa · **Arquivo:** `src/lib/areas.ts`

A constante está declarada e documentada como se fosse uma trava, mas **não é lida em lugar nenhum**. Constante de segurança que não é aplicada é pior que ausência: cria confiança falsa em quem lê.

**Recomendação:** ou aplicar em `podeOperar`, ou remover até existir o uso real.

### 🟡 QA-A2-05 · `CONVENIA_USER_AGENT` vazio falha de forma enganosa — ROBUSTEZ

**Severidade:** baixa · **Arquivo:** `.env.example`

A Convenia está atrás de Cloudflare e recusa cliente sem `User-Agent` de navegador, devolvendo **403 com erro 1010** — que se parece com credencial inválida. Com a variável vazia por padrão, a primeira execução falha e manda o desenvolvedor investigar o token, não o cabeçalho.

**Recomendação:** ter um valor padrão no código e usar a variável só como sobrescrita.

### 🟡 QA-A2-06 · A fronteira de acesso não tem teste versionado — COBERTURA · ✅ **RESOLVIDO**

**Severidade:** baixa (advisory) · **Escopo:** `permissoes.ts`, `convenia/mapa.ts`

A decisão de projeto foi "sem teste unitário obrigatório no MVP", e ela é razoável para telas. Mas estes dois arquivos **são a fronteira que decide quem executa ação sobre dinheiro de filiado** — e a suíte que rodei nesta revisão já encontrou um defeito real na primeira execução.

**Recomendação:** abrir exceção para estes dois módulos. São funções puras, sem I/O; a suíte que usei tem 21 asserções e roda em segundo. Custa pouco e protege o que mais importa. Sugiro incorporá-la ao repositório e ao `npm run check`.

---

## O que está correto e deve ser preservado

- **A regra "conteúdo aberto, operação restrita" está implementada como o Diego especificou.** Verificado: `Tecnologia` com `Produto: App` não opera; atendente sem `Produto` não opera; colaborador não vê módulo operacional nenhum.
- **A armadilha do nível está neutralizada.** O código documenta que o N1 do atendimento não é o N1 da Convenia e **não deriva operação do nível** — evita o erro que liberaria a diretoria e barraria os atendentes.
- **Multi-valor de `Produto` funciona** (`"Crédito PF, Crédito PJ"` → duas áreas), e valor desconhecido cai em `naoMapeados` em vez de virar permissão silenciosa. Falha para o lado seguro, como deve.
- **Lixo de digitação no nível é descartado** (`Especialização - pos graduado` → não é liderança).
- **Headers chegam também no 404**, que é onde a maioria das implementações esquece.
- **`.env.example` versionado com `!.env.example`** e todo o resto ignorado, incluindo padrões de backup.

---

## Rastreabilidade

| Decisão de produto | Implementada em | Verificada |
|---|---|---|
| Conteúdo aberto a todo autenticado | ausência na lista de módulos operacionais | ✅ |
| Operação restrita por papel e área | `podeOperar()` | ✅ |
| Área vem do campo `Produto` da Convenia | `resolverAreas()` | ✅ |
| Logística = `Supply Chain` | `SETOR_PARA_AREA` | ❌ QA-A2-01 |
| Nível não define operação | `NIVEIS_DE_LIDERANCA` | ✅ |
| Segredo nunca no bundle | `.env.example` + `.gitignore` | ✅ |
| Headers de segurança na origem | `next.config.ts` | ✅ parcial, ver QA-A2-03 |

---

## Reverificação — 04/09/2026

| Achado | Correção aplicada | Evidência |
|---|---|---|
| QA-A2-01 | `supply chain` entrou em `SETORES_QUE_OPERAM`. Módulo da Logística existir ou não é escopo, não permissão | teste `Logistica resolve pelo setor` passa |
| QA-A2-02 | `report-uri` + `report-to` + endpoint `/api/csp-report` | POST de violação real devolveu `204` e registrou `{"diretiva":"script-src","bloqueado":"...akamaihd.net/aksb.min.js"}` |
| QA-A2-03 | HSTS na origem: `max-age=63072000; includeSubDomains; preload` | medido com `curl` |
| QA-A2-04 | `AREAS_COM_OPERACAO` removida, intenção virou comentário | `grep` retorna 0 ocorrências |
| QA-A2-06 | 20 testes versionados em `src/lib/acesso.test.ts`, dentro de `npm run check` | `pass 20 · fail 0` |

**QA-A2-05** (User-Agent) segue aberto por dependência: o cliente da Convenia só existe no A6, e o valor
padrão deve morar nele, não no `.env.example`. Fica registrado para a revisão daquele módulo.

> ⚠️ **Achado extra durante a correção.** Uma tentativa de trocar a classe de caracteres da normalização
> por `sed` corrompeu a expressão para `[0300-036f]` — que remove dígitos em vez de acentos. Foi detectada
> na hora, pelo próprio `npm test`, e revertida. Fica como evidência a favor do QA-A2-06: sem a suíte, esse
> erro passaria e faria "Crédito PF" deixar de casar com o de-para silenciosamente.

**Gate: PASS.** Liberado para A3.

— Quinn, guardião da qualidade 🛡️
