import { AREAS, rotuloArea } from "@/lib/areas";
import { modulosOperacionais } from "@/lib/permissoes";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <span className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          Fase 0 · fundação
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Hub MaisTODOS</h1>
        <p className="text-muted-foreground">
          Conhecimento aberto a todo colaborador, operação restrita por área e papel.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Áreas de operação</h2>
        <ul className="flex flex-wrap gap-2">
          {AREAS.map((area) => (
            <li
              key={area}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm shadow-soft"
            >
              {rotuloArea[area]}
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Módulos operacionais</h2>
        <ul className="flex flex-col gap-2">
          {modulosOperacionais.map((modulo) => (
            <li
              key={modulo.id}
              className="rounded-lg border border-border bg-card p-4 shadow-soft"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium">{modulo.nome}</span>
                <span className="text-xs text-muted-foreground">{modulo.grupo}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{modulo.descricao}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
