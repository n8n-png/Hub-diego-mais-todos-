/**
 * Áreas de operação do Hub MaisTODOS.
 *
 * Uma área é um recorte por time que define o que a pessoa pode OPERAR.
 * Ver conteúdo didático de qualquer área é aberto a todo colaborador autenticado
 * e por isso não passa por aqui.
 */

export const AREAS = [
  "credito-pf",
  "credito-pj",
  "conta-digital",
  "pagamentos",
  "logistica",
  "app",
  "cashback",
] as const;

export type Area = (typeof AREAS)[number];

export const rotuloArea: Record<Area, string> = {
  "credito-pf": "Crédito PF",
  "credito-pj": "Crédito PJ",
  "conta-digital": "Conta Digital",
  pagamentos: "Pagamentos",
  logistica: "Logística",
  app: "App",
  cashback: "Cashback",
};

/*
 * Nota de escopo, não de segurança: no MVP só o time de App tem módulo
 * operacional construído. As demais áreas existem como conteúdo e ganham
 * operação conforme a integração correspondente for liberada.
 *
 * Isso NÃO vira uma constante de trava aqui. Quem decide o que a pessoa pode
 * executar é `podeOperar`, em permissoes.ts, e o que limita o alcance no MVP é
 * a existência do módulo — não uma lista paralela que ninguém lê.
 *
 * Crédito PJ nasce como área de consulta, por decisão do Diego em 03/09/2026.
 */

export function ehArea(valor: string): valor is Area {
  return (AREAS as readonly string[]).includes(valor);
}
