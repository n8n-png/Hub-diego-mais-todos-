/**
 * Testes da fronteira de acesso.
 *
 * A decisão de projeto é não exigir teste unitário no MVP, e ela vale para telas.
 * Estes dois módulos são exceção deliberada: decidem quem executa ação sobre dado
 * e dinheiro de filiado. São funções puras, sem I/O, e a suíte roda em um segundo.
 *
 * Os casos usam os valores REAIS medidos na Convenia em 04/09/2026 (307 pessoas),
 * não exemplos inventados. Ver docs/DECISOES-PRODUTO.md, seção 11.C.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  areasOperacionais,
  ehLideranca,
  ehNivelValido,
  normalizar,
  resolverAreas,
} from "@/lib/convenia/mapa";
import { modulosVisiveis, podeOperar } from "@/lib/permissoes";

describe("normalizacao de valores da Convenia", () => {
  it("remove acento e caixa", () => {
    assert.equal(normalizar("Crédito PF"), "credito pf");
    assert.equal(normalizar("Segurança Da Informação"), "seguranca da informacao");
  });

  it("colapsa espaco duplicado", () => {
    assert.equal(normalizar("  Conta   Digital "), "conta digital");
  });
});

describe("derivacao de area a partir do Convenia", () => {
  it("atendente de App opera App", () => {
    assert.deepEqual(
      areasOperacionais("CX, Ops e Atendimento ao Cliente", "App"),
      ["app"],
    );
  });

  it("Produto e multi-valor", () => {
    assert.deepEqual(
      areasOperacionais("CX, Ops e Atendimento ao Cliente", "Crédito PF, Crédito PJ"),
      ["credito-pf", "credito-pj"],
    );
  });

  it("CS - Cashback opera cashback", () => {
    assert.deepEqual(areasOperacionais("CS - Cashback", "Cashback"), ["cashback"]);
  });

  it("Logistica resolve pelo setor, nao pelo Produto", () => {
    // Supply Chain e a Logistica e as 4 pessoas tem Produto vazio.
    assert.deepEqual(areasOperacionais("Supply Chain", null), ["logistica"]);
  });

  it("time que nao atende filiado nao opera, mesmo com Produto", () => {
    // Tecnologia tem 25 pessoas com Produto "App" e nenhuma delas atende.
    assert.deepEqual(areasOperacionais("Tecnologia", "App"), []);
  });

  it("atendente sem Produto preenchido nao opera", () => {
    // Caso real: 10 das 32 pessoas do atendimento estao assim na Convenia.
    assert.deepEqual(areasOperacionais("CX, Ops e Atendimento ao Cliente", null), []);
  });

  it("produto interno nao vira area do Hub", () => {
    assert.deepEqual(
      areasOperacionais("CX, Ops e Atendimento ao Cliente", "Plataforma"),
      [],
    );
    assert.deepEqual(areasOperacionais("CX, Ops e Atendimento ao Cliente", "Sondas"), []);
  });

  it("valor desconhecido nao vira permissao silenciosa", () => {
    const r = resolverAreas("CX, Ops e Atendimento ao Cliente", "Consórcio");
    assert.deepEqual(r.areas, []);
    assert.deepEqual(r.naoMapeados, ["Consórcio"]);
  });
});

describe("nivel hierarquico", () => {
  it("N3 e a base da piramide, nao lideranca", () => {
    // 217 das 307 pessoas sao N3, incluindo todos os atendentes.
    assert.equal(ehLideranca("N3"), false);
  });

  it("N2-L e lideranca", () => {
    assert.equal(ehLideranca("N2-L"), true);
  });

  it("lixo de digitacao do RH nunca vira permissao", () => {
    assert.equal(ehNivelValido("Especialização - pos graduado"), false);
    assert.equal(ehLideranca("Especialização - pos graduado"), false);
  });
});

describe("podeOperar", () => {
  it("atendimento opera a area liberada", () => {
    assert.equal(
      podeOperar({ papel: "atendimento", areas: ["app"] }, "atendimento_cashback", "app"),
      true,
    );
  });

  it("atendimento nao opera area alheia", () => {
    assert.equal(
      podeOperar(
        { papel: "atendimento", areas: ["app"] },
        "atendimento_cashback",
        "cashback",
      ),
      false,
    );
  });

  it("modulo que exige area recusa chamada sem area", () => {
    assert.equal(
      podeOperar({ papel: "atendimento", areas: ["app"] }, "atendimento_cashback"),
      false,
    );
  });

  it("colaborador comum nao opera nada", () => {
    assert.equal(
      podeOperar({ papel: "colaborador", areas: ["app"] }, "atendimento_cashback", "app"),
      false,
    );
    assert.equal(modulosVisiveis({ papel: "colaborador", areas: [] }).length, 0);
  });

  it("gestor le a trilha mas nao executa atendimento", () => {
    assert.equal(podeOperar({ papel: "gestor", areas: [] }, "auditoria"), true);
    assert.equal(
      podeOperar({ papel: "gestor", areas: ["app"] }, "atendimento_cashback", "app"),
      false,
    );
  });

  it("admin e global por decisao de produto", () => {
    assert.equal(
      podeOperar({ papel: "admin", areas: [] }, "atendimento_cashback", "cashback"),
      true,
    );
  });

  it("so admin gerencia acessos", () => {
    assert.equal(podeOperar({ papel: "admin", areas: [] }, "acessos"), true);
    assert.equal(podeOperar({ papel: "gestor", areas: [] }, "acessos"), false);
    assert.equal(podeOperar({ papel: "atendimento", areas: [] }, "acessos"), false);
  });
});
