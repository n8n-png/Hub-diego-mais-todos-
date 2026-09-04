/**
 * De-para Convenia → Hub.
 *
 * Levantado do dado real em 04/09/2026: 307 colaboradores nas três empresas
 * (CredTodos, GanhaTodos, PagTodos). Ver docs/DECISOES-PRODUTO.md, seção 11.C.
 *
 * REGRA CENTRAL
 * A área de operação vem do campo personalizado `Produto`, que é multi-valor.
 * O setor (`department.name`) NÃO carrega mais o produto: todo o atendimento vive
 * num setor só, "CX, Ops e Atendimento ao Cliente".
 *
 * Duas exceções tratadas aqui:
 *  - Supply Chain é a Logística e tem `Produto` vazio, então resolve pelo setor;
 *  - `Plataforma` e `Sondas` são produtos internos que não existem como área do Hub.
 *
 * Este arquivo é TABELA DE DADOS, não regra de negócio espalhada em if/else.
 * Valor novo que aparecer na Convenia cai em "não mapeado", que falha para o lado
 * seguro: sem operação, com conteúdo.
 */

import type { Area } from "@/lib/areas";

/** Normaliza para comparação: sem acento, sem caixa, sem espaço duplicado. */
export function normalizar(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** `Produto` da Convenia → área do Hub. Chave já normalizada. */
const PRODUTO_PARA_AREA: Record<string, Area> = {
  "credito pf": "credito-pf",
  "credito pj": "credito-pj",
  "conta digital": "conta-digital",
  pagamentos: "pagamentos",
  app: "app",
  cashback: "cashback",
};

/** Produtos que existem na Convenia mas não são área do Hub. */
const PRODUTOS_IGNORADOS = new Set(["plataforma", "sondas"]);

/** Setor → área, para quem não tem `Produto` preenchido. */
const SETOR_PARA_AREA: Record<string, Area> = {
  "supply chain": "logistica",
};

/**
 * Setores cujo pessoal EXECUTA operação, quando tem área definida.
 * Todo o resto recebe conteúdo, que é aberto, e não opera.
 * Confirmado pelo Diego em 03/09/2026.
 */
const SETORES_QUE_OPERAM = new Set([
  "cx, ops e atendimento ao cliente",
  "cs - cashback",
  // Logistica opera pela propria area. O time tem 4 pessoas e o setor foi
  // confirmado com eles em 03/09/2026. Que o modulo de operacao da Logistica
  // so exista na Fase 4 nao muda a derivacao da permissao: sao coisas distintas.
  "supply chain",
]);

/** Níveis hierárquicos válidos na Convenia. Valor fora daqui é descartado. */
export const NIVEIS = ["N0", "N1", "N2", "N2-L", "N3"] as const;
export type Nivel = (typeof NIVEIS)[number];

/**
 * ATENÇÃO, ARMADILHA CONHECIDA
 * O "N1" do jargão de atendimento (quem fala com o filiado) NÃO é o N1 da Convenia.
 * Na Convenia o nível é hierárquico e desce: N0/N1 no topo, N2-L é liderança e
 * N3 é a base — 217 das 307 pessoas são N3, incluindo todos os atendentes.
 *
 * Por isso a permissão de OPERAÇÃO nunca é derivada do nível. O nível serve só
 * para distinguir quem lidera, e liderança lê a trilha de auditoria do time.
 */
const NIVEIS_DE_LIDERANCA = new Set<Nivel>(["N0", "N1", "N2", "N2-L"]);

export function ehNivelValido(valor: string | null | undefined): valor is Nivel {
  return !!valor && (NIVEIS as readonly string[]).includes(valor);
}

export function ehLideranca(nivel: string | null | undefined): boolean {
  return ehNivelValido(nivel) && NIVEIS_DE_LIDERANCA.has(nivel);
}

export type ResultadoMapa = {
  /** Áreas que a pessoa pode operar. Vazio significa: só conteúdo. */
  areas: Area[];
  /** Valores de `Produto` que a Convenia trouxe e que não conhecemos. */
  naoMapeados: string[];
  /** Setor da pessoa executa operação? */
  setorOpera: boolean;
};

/**
 * Resolve as áreas de operação de um colaborador.
 *
 * @param setor  `department.name` da Convenia
 * @param produto `custom_fields["Produto"]`, multi-valor separado por vírgula
 */
export function resolverAreas(
  setor: string | null | undefined,
  produto: string | null | undefined,
): ResultadoMapa {
  const setorNorm = setor ? normalizar(setor) : "";
  const setorOpera = SETORES_QUE_OPERAM.has(setorNorm);

  const areas = new Set<Area>();
  const naoMapeados: string[] = [];

  for (const parte of (produto ?? "").split(",")) {
    const valor = parte.trim();
    if (!valor) continue;
    const chave = normalizar(valor);
    if (PRODUTOS_IGNORADOS.has(chave)) continue;
    const area = PRODUTO_PARA_AREA[chave];
    if (area) areas.add(area);
    else naoMapeados.push(valor);
  }

  // Logística não usa o campo Produto: resolve pelo setor.
  const porSetor = SETOR_PARA_AREA[setorNorm];
  if (porSetor) areas.add(porSetor);

  return { areas: [...areas], naoMapeados, setorOpera };
}

/**
 * Áreas que a pessoa realmente pode OPERAR.
 * Precisa das duas coisas: setor que executa operação e área definida.
 * Quem tem área mas não é de time operacional recebe conteúdo, não operação.
 */
export function areasOperacionais(
  setor: string | null | undefined,
  produto: string | null | undefined,
): Area[] {
  const r = resolverAreas(setor, produto);
  return r.setorOpera ? r.areas : [];
}
