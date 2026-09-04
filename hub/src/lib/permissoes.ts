/**
 * FONTE ÚNICA DE VERDADE do modelo de acesso do Hub MaisTODOS.
 *
 * Conceito em uma frase: conteúdo é didático e aberto a todo colaborador autenticado
 * do domínio corporativo; operação é restrita por papel e área, com trava real no
 * servidor.
 *
 * CAMADA 1, CONTEÚDO — aberto a QUALQUER autenticado, e por isso NÃO entra nesta lista:
 * universidade, trilhas e progresso, base de conhecimento, processos, fluxogramas,
 * scripts, FAQ, downloads, o assistente, e TODA a operação em modo consulta, de todas
 * as áreas. Uma pessoa da Logística pode e deve conseguir estudar o guia de Crédito PF.
 *
 * CAMADA 2, OPERAÇÃO — declarada abaixo. Só entra aqui o que EXECUTA ação sobre
 * sistema, dado de filiado, papel de pessoa ou base de conhecimento. Toda escrita que
 * usa o componente de ação sensível é operação.
 *
 * A interface e os guardas de rota leem daqui. A trava que realmente protege é a do
 * servidor: cada função de escrita revalida o papel antes de tocar no banco.
 */

import type { Area } from "@/lib/areas";

export const PAPEIS = ["admin", "gestor", "atendimento", "colaborador"] as const;
export type Papel = (typeof PAPEIS)[number];

export const rotuloPapel: Record<Papel, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  atendimento: "Atendimento",
  colaborador: "Colaborador",
};

export type ModuloOperacional =
  | "atendimento_filiados"
  | "atendimento_cashback"
  | "atendimento_estornos"
  | "atendimento_carteirinhas"
  | "auditoria"
  | "acessos"
  | "gestor"
  | "conhecimento_escrita";

export type DefinicaoModulo = {
  id: ModuloOperacional;
  nome: string;
  grupo: "Atendimento" | "Gestão" | "Administração" | "Conhecimento";
  descricao: string;
  /** Papéis que podem operar o módulo. Admin entra sempre, de forma explícita. */
  papeis: Papel[];
  /**
   * Quando definido, além do papel a pessoa precisa ter liberação para a área.
   * A liberação vem do Convenia (campo Produto) ou de exceção manual.
   */
  exigeArea?: boolean;
};

const ATENDIMENTO: Papel[] = ["admin", "atendimento"];

export const modulosOperacionais: DefinicaoModulo[] = [
  {
    id: "atendimento_filiados",
    nome: "Gerenciamento de filiados",
    grupo: "Atendimento",
    descricao: "Buscar filiado por CPF, atualizar contato e alterar dados cadastrais.",
    papeis: ATENDIMENTO,
    exigeArea: true,
  },
  {
    id: "atendimento_cashback",
    nome: "Cashback",
    grupo: "Atendimento",
    descricao: "Consultar lançamentos e liberar cashback pendente.",
    papeis: ATENDIMENTO,
    exigeArea: true,
  },
  {
    id: "atendimento_estornos",
    nome: "Estornos",
    grupo: "Atendimento",
    descricao: "Abrir e acompanhar estornos com justificativa.",
    papeis: ATENDIMENTO,
    exigeArea: true,
  },
  {
    id: "atendimento_carteirinhas",
    nome: "Carteirinhas",
    grupo: "Atendimento",
    descricao: "Segunda via de private label e carteirinhas vinculadas.",
    papeis: ATENDIMENTO,
    exigeArea: true,
  },
  {
    id: "auditoria",
    nome: "Trilha de auditoria",
    grupo: "Gestão",
    descricao: "Ler o registro de ações sensíveis executadas na plataforma.",
    papeis: ["admin", "gestor"],
  },
  {
    id: "gestor",
    nome: "Painel do gestor",
    grupo: "Gestão",
    descricao: "Visão consolidada da operação do time.",
    papeis: ["admin", "gestor"],
  },
  {
    id: "acessos",
    nome: "Gestão de acessos",
    grupo: "Administração",
    descricao: "Conceder e remover papéis e áreas, com origem e trilha.",
    papeis: ["admin"],
  },
  {
    id: "conhecimento_escrita",
    nome: "Central de conhecimento",
    grupo: "Conhecimento",
    descricao: "Publicar, arquivar e reindexar conteúdo da base.",
    papeis: ["admin"],
  },
];

export const moduloPorId = new Map(modulosOperacionais.map((m) => [m.id, m]));

export type ContextoAcesso = {
  papel: Papel;
  /** Áreas liberadas, vindas do Convenia ou de exceção manual. */
  areas: readonly Area[];
};

/**
 * Única regra de decisão de operação. Interface, guarda de rota e servidor leem daqui.
 *
 * @param area obrigatória para módulos com `exigeArea`. Sem ela, a resposta é não.
 */
export function podeOperar(
  ctx: ContextoAcesso,
  modulo: ModuloOperacional,
  area?: Area,
): boolean {
  const def = moduloPorId.get(modulo);
  if (!def) return false;
  if (!def.papeis.includes(ctx.papel)) return false;
  if (!def.exigeArea) return true;
  if (ctx.papel === "admin") return true;
  if (!area) return false;
  return ctx.areas.includes(area);
}

/** Módulos visíveis para montar navegação. Não é controle de segurança. */
export function modulosVisiveis(ctx: ContextoAcesso): DefinicaoModulo[] {
  return modulosOperacionais.filter((m) =>
    m.exigeArea
      ? ctx.areas.some((a) => podeOperar(ctx, m.id, a))
      : podeOperar(ctx, m.id),
  );
}
