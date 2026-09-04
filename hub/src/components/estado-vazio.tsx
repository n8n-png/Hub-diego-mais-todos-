import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Estado vazio. Diferencia "nao encontrei" de "ainda nao existe" — a confusao
 * entre os dois foi o que fez o assistente do outro projeto afirmar que uma
 * politica nao existia quando ela apenas nao estava acessivel.
 */
export function EstadoVazio({
  titulo,
  descricao,
  icone: Icone = Inbox,
  acao,
  className,
}: {
  titulo: string;
  descricao?: string;
  icone?: LucideIcon;
  acao?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong bg-card/60 px-6 py-10 text-center",
        className,
      )}
    >
      <Icone className="size-6 text-muted-foreground" />
      <p className="font-medium">{titulo}</p>
      {descricao && <p className="max-w-sm text-sm text-muted-foreground">{descricao}</p>}
      {acao}
    </div>
  );
}
