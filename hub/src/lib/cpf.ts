/**
 * CPF: normalização, validação e formatação.
 *
 * A busca do atendimento aceita CPF com e sem máscara, porque o atendente cola
 * o valor de onde estiver — planilha, chamado, conversa. Quem normaliza é o
 * sistema, não a pessoa.
 */

export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** Valida pelos dígitos verificadores. Rejeita sequências repetidas. */
export function cpfValido(valor: string): boolean {
  const cpf = apenasDigitos(valor);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcular = (ate: number) => {
    let soma = 0;
    for (let i = 0; i < ate; i++) {
      soma += Number(cpf[i]) * (ate + 1 - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcular(9) === Number(cpf[9]) && calcular(10) === Number(cpf[10]);
}

/** 12345678901 → 123.456.789-01 */
export function formatarCpf(valor: string): string {
  const cpf = apenasDigitos(valor).slice(0, 11);
  return cpf
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}
