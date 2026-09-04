/**
 * Testes de mascaramento, CPF e link de chamado.
 *
 * Mesma exceção da suíte de acesso: é lógica pura que decide o que sai da
 * empresa e o que fica gravado na trilha. Um erro aqui vaza dado pessoal em
 * silêncio, sem erro em log nenhum.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { interpretarChamado } from "@/lib/chamado";
import { cpfValido, formatarCpf } from "@/lib/cpf";
import {
  contemCpf,
  mascararCpf,
  mascararEmail,
  mascararTelefone,
  mascararTexto,
  sanitizarPayload,
} from "@/lib/mascara";

describe("CPF", () => {
  it("valida pelos digitos verificadores", () => {
    assert.equal(cpfValido("529.982.247-25"), true);
    assert.equal(cpfValido("52998224725"), true);
    assert.equal(cpfValido("529.982.247-26"), false);
  });

  it("rejeita sequencia repetida", () => {
    assert.equal(cpfValido("111.111.111-11"), false);
    assert.equal(cpfValido("00000000000"), false);
  });

  it("formata progressivamente", () => {
    assert.equal(formatarCpf("529982247"), "529.982.247");
    assert.equal(formatarCpf("52998224725"), "529.982.247-25");
  });
});

describe("mascaramento", () => {
  it("CPF mantem o miolo para auditoria e esconde o resto", () => {
    assert.equal(mascararCpf("529.982.247-25"), "***.982.247-**");
  });

  it("email preserva o dominio", () => {
    assert.equal(
      mascararEmail("maria.souza@maistodos.com.br"),
      "m***@maistodos.com.br",
    );
  });

  it("telefone preserva DDD e final", () => {
    assert.equal(mascararTelefone("+55 16 90000-1234"), "(16) *****-1234");
  });

  it("texto livre e varrido, nao so campo nomeado", () => {
    const entrada = "Filiado 529.982.247-25 pediu troca para maria@gmail.com";
    const saida = mascararTexto(entrada);
    assert.ok(!saida.includes("529.982.247-25"));
    assert.ok(!saida.includes("maria@gmail.com"));
    assert.ok(saida.includes("@gmail.com"));
  });

  it("detecta CPF sem mascarar, para eventual bloqueio ativo", () => {
    assert.equal(contemCpf("meu cpf e 529.982.247-25"), true);
    assert.equal(contemCpf("nao tem documento aqui"), false);
  });
});

describe("sanitizacao do payload da trilha", () => {
  it("mascara por nome de campo, em qualquer profundidade", () => {
    const payload = {
      cpf: "529.982.247-25",
      contato: { email: "maria.souza@maistodos.com.br", telefone: "16999991234" },
      valor: 150.5,
    };
    const saida = sanitizarPayload(payload) as Record<string, unknown>;
    assert.equal(saida.cpf, "***.982.247-**");
    const contato = saida.contato as Record<string, unknown>;
    assert.equal(contato.email, "m***@maistodos.com.br");
    assert.equal(contato.telefone, "(16) *****-1234");
    // Valor da operacao nao e dado pessoal e precisa continuar legivel.
    assert.equal(saida.valor, 150.5);
  });

  it("pega dado pessoal escondido em campo de nome inocente", () => {
    const saida = sanitizarPayload({
      observacao: "confirmar com 529.982.247-25 antes de liberar",
    }) as Record<string, string>;
    assert.ok(!saida.observacao.includes("529.982.247-25"));
  });

  it("nunca deixa Numero SUS passar", () => {
    const saida = sanitizarPayload({ numero_sus: "702404068021829" }) as Record<
      string,
      unknown
    >;
    assert.equal(saida.numero_sus, "***");
  });

  it("preserva a estrutura de listas", () => {
    const saida = sanitizarPayload({ cpfs: ["529.982.247-25"] }) as Record<
      string,
      string[]
    >;
    assert.equal(Array.isArray(saida.cpfs), true);
    assert.equal(saida.cpfs.length, 1);
  });
});

describe("link do chamado", () => {
  it("extrai numero do Zendesk", () => {
    const c = interpretarChamado("https://maistodos.zendesk.com/agent/tickets/482913");
    assert.equal(c?.origem, "zendesk");
    assert.equal(c?.numero, "482913");
  });

  it("extrai chave do Jira", () => {
    const c = interpretarChamado("https://maistodos.atlassian.net/browse/SUP-1234");
    assert.equal(c?.origem, "jira");
    assert.equal(c?.numero, "SUP-1234");
  });

  it("aceita outro sistema, mas sem deduzir numero", () => {
    const c = interpretarChamado("https://interno.maistodos.com.br/chamado/9");
    assert.equal(c?.origem, "outro");
    assert.equal(c?.numero, null);
  });

  it("recusa o que nao e URL", () => {
    assert.equal(interpretarChamado("482913"), null);
    assert.equal(interpretarChamado(""), null);
    assert.equal(interpretarChamado("javascript:alert(1)"), null);
  });
});
