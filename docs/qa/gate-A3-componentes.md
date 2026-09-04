# QA Gate — A3 · Design system e componentes de regra

**Revisor:** Quinn (Test Architect)
**Data:** 04/09/2026
**Escopo:** `acao-sensivel.tsx`, `guarda-operacional.tsx`, `busca-filiado-cpf.tsx`, `cabecalho-filiado.tsx`, `badge-status.tsx`, `estado-vazio.tsx`, `aviso-dado-ficticio.tsx`, `components/ui/*`, `lib/mascara.ts`, `lib/chamado.ts`, `lib/cpf.ts`, `lib/sessao.ts`

## Decisão: ⚠️ CONCERNS

O desenho está certo e corrige o defeito estrutural do protótipo. Mas **dois achados de severidade alta** precisam ser resolvidos antes do A8 (trilha), porque ambos afetam exatamente a auditoria que justifica o projeto.

**Verificação:** `npm run check` limpo · 36 testes passando · build sem erro.

---

## Achados

### 🔴 QA-A3-01 · O mascaramento corrompe a trilha de auditoria

**Severidade:** alta · **Arquivo:** `src/lib/mascara.ts`

A regex de CPF mascara **qualquer sequência de 11 dígitos**, sem verificar se é um CPF de verdade. Medido:

```
sanitizarPayload({ transacaoId: "12345678901" })
  → {"transacaoId":"***.456.789-**"}

mascararTexto("estorno da transacao 12345678901 confirmado")
  → "estorno da transacao ***.456.789-** confirmado"

mascararTexto("protocolo 4829130000 aberto")
  → "protocolo (48) *****-0000 aberto"
```

Por que isso importa mais do que parece: o estorno é `POST /transaction/{id}/refund`. **O ID da transação é o dado que identifica o que foi estornado** — e é justamente ele que o mascaramento apaga. A trilha guarda que houve um estorno, com motivo e chamado, mas não consegue mais dizer *qual transação*.

Trocar dado pessoal por asterisco é o objetivo. Trocar o identificador da operação por asterisco é destruir a prova.

**Recomendação:**
1. Validar o dígito verificador antes de mascarar — `cpfValido()` já existe e `12345678901` é reprovado por ela;
2. Restringir a heurística de telefone a formatos com separador ou parênteses, deixando sequência crua para o mascaramento por nome de campo.

Isso reduz o falso positivo sem afrouxar a proteção: CPF verdadeiro continua mascarado, porque CPF verdadeiro passa na validação.

### 🔴 QA-A3-02 · A obrigatoriedade do motivo existe só no navegador

**Severidade:** alta · **Arquivos:** `acao-sensivel.tsx`, ação de servidor (ainda não escrita)

O componente exige motivo com 10 caracteres, link válido e número do chamado antes de habilitar o botão. Toda essa validação roda **no cliente**, e o `ContextoAuditoria` chega à ação de servidor como argumento vindo do navegador.

Hoje não existe nenhuma validação no servidor — confirmei: não há schema, não há `zod`, não há checagem no recebimento.

Quem chamar a ação diretamente, sem passar pela interface, executa a operação com motivo vazio e chamado inventado. É a mesma classe de problema que o briefing do protótipo aponta como MÉDIO ("auditoria gravada pelo navegador: quem abrir o console pode agir sem rastro") — resolvida para a *gravação*, mas não para o *conteúdo* do registro.

**Recomendação:** contrato validado na ação de servidor, com schema, antes de executar qualquer coisa: motivo com tamanho mínimo, URL válida em domínio conhecido, número presente. O que a interface faz é conveniência; o que vale é o que o servidor aceita.

### 🟠 QA-A3-03 · `alvo` depende da disciplina de quem chama

**Severidade:** média · **Arquivo:** `acao-sensivel.tsx`

O contrato diz *"alvo da ação, já mascarado pelo chamador quando for dado pessoal"*. Isso transfere uma regra de privacidade para a memória de quem escrever a próxima tela. Basta um módulo esquecer e o CPF completo entra na trilha.

**Recomendação:** o servidor mascara o alvo ao gravar, sempre, independente do que recebeu. Mascarar duas vezes é inofensivo; esquecer uma vez não é.

### 🟡 QA-A3-04 · Texto sem acentuação viola a regra de marca

**Severidade:** baixa · **Arquivo:** `aviso-dado-ficticio.tsx` (e comentários em outros quatro)

O handoff técnico, seção 4.9, define a regra de escrita da MaisTODOS: *"nada de travessão nem meia-risca, acentuação correta, sem emoji"*.

O aviso que **aparece na tela do atendente** está escrito assim:

> "Dados ficticios, para validar a tela sem tocar em sistema real (… ainda nao integrado). Nenhuma acao aqui produz efeito em producao."

Travessão: verifiquei, não há nenhum em texto visível — essa parte está correta. O problema é só a acentuação, e ela está errada no único componente cujo texto o usuário lê.

**Recomendação:** corrigir o texto visível, e de quebra os comentários dos outros quatro arquivos, para o padrão não se perder.

### 🟡 QA-A3-05 · Número do chamado sobrevive à troca de link

**Severidade:** baixa · **Arquivo:** `acao-sensivel.tsx`

`numeroManual` não é limpo quando `linkChamado` muda. Sequência que produz registro errado: o atendente cola um link de sistema interno, digita o número à mão, percebe que era o chamado errado, cola um link do Zendesk e depois volta para um link interno — o número antigo reaparece preenchido e vai para a trilha associado ao chamado novo.

**Recomendação:** limpar `numeroManual` sempre que o link mudar.

### 🟡 QA-A3-06 · A regra de habilitação não é testável

**Severidade:** baixa (advisory) · **Arquivo:** `acao-sensivel.tsx`

A condição que libera o botão — motivo válido, chamado com número, palavra de confirmação — é regra de negócio e vive dentro do componente, fora do alcance da suíte. As duas suítes existentes já pegaram dois defeitos reais; esta regra ficou de fora.

**Recomendação:** extrair para uma função pura (`podeConfirmar(estado)`) e testá-la. O componente passa a só renderizar.

---

## O que está correto e deve ser preservado

- **A trilha saiu do navegador.** Este era o defeito estrutural do protótipo, classificado como MÉDIO no briefing de segurança. O componente entrega o contexto e quem grava é o servidor, na mesma transação da execução. Correção real, não cosmética.
- **Falha também é rastro.** O erro não fecha o diálogo e o servidor registra a tentativa — coerente com o requisito de que ação que falhou também vira registro.
- **O guarda de rota se declara não sendo a trava final**, em comentário explícito, e a revalidação na execução está prevista. Guarda de rota tratado como se fosse segurança é erro comum, e aqui ele não foi cometido.
- **`sessao.ts` falha ruidosamente.** O stub lança em vez de devolver um usuário vazio. Stub que devolve valor plausível é como bug de permissão nasce.
- **`javascript:` é rejeitado** no link do chamado, junto com todo protocolo que não seja http(s).
- **Número extraído do link, com campo manual só quando necessário** — atende ao pedido do Diego sem pedir o mesmo dado duas vezes.
- **CPF validado por dígito verificador antes da busca**, poupando requisição contra API sem sandbox.

---

## Rastreabilidade

| Requisito | Implementado em | Verificado |
|---|---|---|
| Preview do payload antes de executar | `acao-sensivel.tsx` | ✅ |
| Motivo obrigatório | `acao-sensivel.tsx` | ⚠️ só no cliente, QA-A3-02 |
| Link do chamado obrigatório | `acao-sensivel.tsx` | ⚠️ idem |
| Número extraído do link | `lib/chamado.ts` | ✅ 4 testes |
| Confirmação explícita | `acao-sensivel.tsx` | ✅ |
| Trilha gravada no servidor | contrato de `onConfirmar` | ✅ desenho correto |
| Dado pessoal mascarado | `lib/mascara.ts` | ⚠️ mascara demais, QA-A3-01 |
| Guarda não é a trava final | `guarda-operacional.tsx` | ✅ |

---

**Gate: CONCERNS.** Liberado para A4, que é porte de rotas e não depende destes achados. **QA-A3-01 e QA-A3-02 precisam estar resolvidos antes do A8**, quando a trilha passa a ser gravada de verdade.

— Quinn, guardião da qualidade 🛡️
