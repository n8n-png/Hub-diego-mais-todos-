import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

import { type Area, rotuloArea } from "@/lib/areas";
import { moduloPorId, podeOperar, type ModuloOperacional } from "@/lib/permissoes";
import { contextoDe, exigirUsuario } from "@/lib/sessao";

/**
 * Guarda único de rota operacional. Cada rota declara apenas o módulo, e a área
 * quando o módulo exige.
 *
 * O QUE ESTE COMPONENTE É E O QUE NÃO É
 * Ele roda no servidor e decide se a página chega a ser renderizada — então
 * bloqueia acesso por URL direta, que é mais do que esconder item de menu.
 *
 * Ainda assim, NÃO é a trava final. Toda ação de escrita revalida a permissão
 * dentro da própria ação de servidor, antes de tocar no banco ou em API externa.
 * Guarda de rota protege a página; o que protege o dado é a checagem na execução.
 */
export async function GuardaOperacional({
  modulo,
  area,
  children,
}: {
  modulo: ModuloOperacional;
  area?: Area;
  children: ReactNode;
}) {
  const usuario = await exigirUsuario();

  if (podeOperar(contextoDe(usuario), modulo, area)) {
    return <>{children}</>;
  }

  const definicao = moduloPorId.get(modulo);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 rounded-xl border border-border bg-card p-8 text-center shadow-soft">
      <div className="rounded-full bg-accent p-3 text-accent-foreground">
        <ShieldAlert className="size-6" />
      </div>
      <h2 className="text-lg font-semibold">Acesso restrito</h2>
      <p className="text-sm text-muted-foreground">
        {definicao ? (
          <>
            Você não tem permissão para operar <strong>{definicao.nome}</strong>
            {area ? (
              <>
                {" na área de "}
                <strong>{rotuloArea[area]}</strong>
              </>
            ) : null}
            .
          </>
        ) : (
          "Você não tem permissão para esta operação."
        )}
      </p>
      <p className="text-sm text-muted-foreground">
        O conteúdo desta área continua aberto para consulta. Se você precisa executar
        esta operação, peça a liberação a um administrador.
      </p>
    </div>
  );
}
