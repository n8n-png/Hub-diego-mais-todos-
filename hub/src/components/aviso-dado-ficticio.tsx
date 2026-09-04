import { FlaskConical } from "lucide-react";

/**
 * Aviso de dado ficticio.
 *
 * Enquanto as integracoes reais nao estao ligadas, o atendimento opera sobre
 * mock. Isso precisa estar visivel na tela: atendente que confunde mock com
 * producao toma decisao errada sobre caso real.
 *
 * O componente sai quando a integracao correspondente entrar, nao antes.
 */
export function AvisoDadoFicticio({ sistema }: { sistema?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning-soft px-3 py-2 text-xs text-warning-foreground">
      <FlaskConical className="mt-0.5 size-4 shrink-0" />
      <p>
        Dados ficticios, para validar a tela sem tocar em sistema real
        {sistema ? ` (${sistema} ainda nao integrado)` : ""}. Nenhuma acao aqui
        produz efeito em producao.
      </p>
    </div>
  );
}
