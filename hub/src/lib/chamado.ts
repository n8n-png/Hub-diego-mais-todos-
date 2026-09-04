/**
 * Link e número do chamado, exigidos em toda ação sensível.
 *
 * O atendente informa o link; o número é extraído automaticamente quando o
 * formato permite — decisão do Diego em 03/09/2026, para não pedir duas vezes o
 * mesmo dado a quem está no meio de um atendimento.
 *
 * Dois sistemas convivem e não são concorrentes:
 *  - Zendesk é o atendimento ao filiado;
 *  - Jira é o chamado técnico interno.
 */

export type OrigemChamado = "zendesk" | "jira" | "outro";

export type Chamado = {
  origem: OrigemChamado;
  /** Número extraído do link. Nulo quando o formato não permite deduzir. */
  numero: string | null;
  url: string;
};

const PADROES: { origem: OrigemChamado; teste: RegExp; numero: RegExp }[] = [
  // https://empresa.zendesk.com/agent/tickets/123456
  {
    origem: "zendesk",
    teste: /(^|\.)zendesk\.com$/i,
    numero: /\/tickets?\/(\d+)/i,
  },
  // https://empresa.atlassian.net/browse/SUP-1234
  {
    origem: "jira",
    teste: /(^|\.)atlassian\.net$/i,
    numero: /\/browse\/([A-Z][A-Z0-9]+-\d+)/i,
  },
];

/**
 * Interpreta o link do chamado.
 * Devolve `null` quando não é uma URL http(s) válida — a interface trata como
 * campo inválido, e não como chamado sem número.
 */
export function interpretarChamado(entrada: string): Chamado | null {
  const texto = entrada.trim();
  if (!texto) return null;

  let url: URL;
  try {
    url = new URL(texto);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  for (const padrao of PADROES) {
    if (padrao.teste.test(url.hostname)) {
      const achado = url.pathname.match(padrao.numero);
      return {
        origem: padrao.origem,
        numero: achado ? achado[1] : null,
        url: url.toString(),
      };
    }
  }

  return { origem: "outro", numero: null, url: url.toString() };
}

export const rotuloOrigem: Record<OrigemChamado, string> = {
  zendesk: "Zendesk",
  jira: "Jira",
  outro: "Outro sistema",
};
