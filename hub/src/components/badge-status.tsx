import { cn } from "@/lib/utils";

/**
 * Vocabulário visual de status do atendimento.
 * Verde é sucesso e conquista, e só isso — regra da marca, nao decoracao.
 */
const TONS = {
  neutro: "bg-secondary text-secondary-foreground",
  sucesso: "bg-success-soft text-success",
  atencao: "bg-warning-soft text-warning-foreground",
  erro: "bg-destructive/10 text-destructive",
  info: "bg-accent text-accent-foreground",
} as const;

export type TomStatus = keyof typeof TONS;

export function BadgeStatus({
  tom = "neutro",
  children,
  className,
}: {
  tom?: TomStatus;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONS[tom],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Estados do cashback na Solatio, com o tom correspondente. */
export const TOM_POR_ESTADO_CASHBACK: Record<string, TomStatus> = {
  pendente: "atencao",
  autorizado: "sucesso",
  expirado: "neutro",
  morto: "neutro",
  cancelado: "erro",
};
