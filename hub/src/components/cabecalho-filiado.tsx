import { BadgeStatus } from "@/components/badge-status";
import { formatarCpf } from "@/lib/cpf";
import { mascararEmail, mascararTelefone } from "@/lib/mascara";

export type Filiado = {
  nome: string;
  cpf: string;
  email?: string | null;
  telefone?: string | null;
  contaAtiva: boolean;
};

/**
 * Cabecalho do filiado em atendimento.
 *
 * O CPF aparece completo porque o atendente precisa conferir contra o chamado.
 * Contato aparece mascarado: serve para confirmar identidade, nao para copiar.
 * O que vai para a trilha e mascarado sempre, sem excecao.
 */
export function CabecalhoFiliado({ filiado }: { filiado: Filiado }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-soft">
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">{filiado.nome}</span>
        <span className="text-sm text-muted-foreground">{formatarCpf(filiado.cpf)}</span>
      </div>
      <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
        {filiado.email && <span>{mascararEmail(filiado.email)}</span>}
        {filiado.telefone && <span>{mascararTelefone(filiado.telefone)}</span>}
      </div>
      <BadgeStatus tom={filiado.contaAtiva ? "sucesso" : "erro"}>
        {filiado.contaAtiva ? "Conta ativa" : "Conta inativa"}
      </BadgeStatus>
    </div>
  );
}
