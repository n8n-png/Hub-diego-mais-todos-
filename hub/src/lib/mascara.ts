/**
 * Mascaramento de dado pessoal.
 *
 * Ponto ÚNICO de sanitização. Tudo que vai para a trilha de auditoria, para log
 * ou para o provedor de IA passa por aqui — centralizado de propósito: se o
 * jurídico exigir bloqueio ativo em vez de mascaramento, a mudança acontece em
 * um arquivo só.
 *
 * A trilha precisa ser auditável sem expor o documento completo: o alvo aparece
 * identificável, não legível.
 */

const RE_CPF = /\b(\d{3})\.?(\d{3})\.?(\d{3})-?(\d{2})\b/g;
const RE_EMAIL = /\b([\w.+-])[\w.+-]*@([\w-]+\.[\w.-]+)\b/g;
const RE_TELEFONE = /\b(?:\+55\s?)?\(?(\d{2})\)?\s?9?\d{4}[-\s]?(\d{4})\b/g;

/** 123.456.789-01 → ***.456.789-** */
export function mascararCpf(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length !== 11) return "***";
  return `***.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-**`;
}

/** maria.souza@maistodos.com.br → m***@maistodos.com.br */
export function mascararEmail(valor: string): string {
  const [usuario, dominio] = valor.split("@");
  if (!dominio) return "***";
  return `${usuario.slice(0, 1)}***@${dominio}`;
}

/** +55 16 90000-0000 → (16) *****-0000 */
export function mascararTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length < 10) return "***";
  const semPais = digitos.length > 11 ? digitos.slice(-11) : digitos;
  return `(${semPais.slice(0, 2)}) *****-${semPais.slice(-4)}`;
}

/**
 * Varre texto livre e mascara o que parecer dado pessoal.
 *
 * Usado em campo de observação e na pergunta enviada ao assistente. Texto
 * digitado por gente é a maior fonte de vazamento em sistema assim, porque o
 * conteúdo não passa por validação de formulário.
 */
export function mascararTexto(texto: string): string {
  return texto
    .replace(RE_CPF, (_m, a, b, c) => `***.${b}.${c}-**`)
    .replace(RE_EMAIL, (_m, ini, dominio) => `${ini}***@${dominio}`)
    .replace(RE_TELEFONE, (_m, ddd, fim) => `(${ddd}) *****-${fim}`);
}

/** Detecta padrão de CPF sem mascarar. Base para bloqueio ativo, se exigido. */
export function contemCpf(texto: string): boolean {
  RE_CPF.lastIndex = 0;
  return RE_CPF.test(texto);
}

const CHAVES_SENSIVEIS = /(cpf|documento|document|email|e_mail|mail|telefone|phone|cellphone|celular|rg|endereco|address|zip|cep|numero_sus|sus)/i;

/**
 * Sanitiza o payload antes de gravar na trilha.
 *
 * Percorre a estrutura inteira: chave com nome sensível é mascarada pelo tipo,
 * e string solta ainda passa pela varredura de texto livre — porque dado pessoal
 * também aparece dentro de campo que não se chama "cpf".
 */
export function sanitizarPayload(valor: unknown, chavePai = ""): unknown {
  if (valor === null || valor === undefined) return valor;

  if (typeof valor === "string") {
    if (CHAVES_SENSIVEIS.test(chavePai)) {
      if (/cpf|documento|document/i.test(chavePai)) return mascararCpf(valor);
      if (/mail/i.test(chavePai)) return mascararEmail(valor);
      if (/telefone|phone|celular|cellphone/i.test(chavePai)) return mascararTelefone(valor);
      return "***";
    }
    return mascararTexto(valor);
  }

  if (typeof valor === "number" || typeof valor === "boolean") {
    return CHAVES_SENSIVEIS.test(chavePai) ? "***" : valor;
  }

  if (Array.isArray(valor)) {
    return valor.map((item) => sanitizarPayload(item, chavePai));
  }

  if (typeof valor === "object") {
    const saida: Record<string, unknown> = {};
    for (const [chave, item] of Object.entries(valor as Record<string, unknown>)) {
      saida[chave] = sanitizarPayload(item, chave);
    }
    return saida;
  }

  return valor;
}
