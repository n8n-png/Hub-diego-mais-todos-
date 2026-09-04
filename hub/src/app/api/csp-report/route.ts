/**
 * Coletor de violações de CSP.
 *
 * Existe para viabilizar o ciclo Report-Only → coleta → enforce. A borda da
 * MaisTODOS é Akamai e injeta script na página, então o conteúdo real do CSP só
 * pode ser escrito depois de medir o que chega no navegador em produção.
 *
 * Recebe dois formatos: o legado (`application/csp-report`) e o da Reporting API
 * (`application/reports+json`). Não autentica, porque o navegador reporta antes
 * de qualquer sessão existir — por isso não confia em nada do corpo e nunca o
 * repassa adiante: apenas registra, com tamanho limitado.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITE_BYTES = 16 * 1024;

type ViolacaoCsp = {
  "document-uri"?: string;
  "violated-directive"?: string;
  "effective-directive"?: string;
  "blocked-uri"?: string;
  "script-sample"?: string;
};

function resumir(v: ViolacaoCsp) {
  return {
    diretiva: v["effective-directive"] ?? v["violated-directive"],
    bloqueado: v["blocked-uri"],
    pagina: v["document-uri"],
    // O trecho de script ajuda a identificar a injeção da borda, mas pode
    // carregar conteúdo da página: fica truncado.
    amostra: v["script-sample"]?.slice(0, 120),
  };
}

export async function POST(request: Request) {
  const bruto = await request.text();
  if (bruto.length > LIMITE_BYTES) {
    return new Response(null, { status: 413 });
  }

  try {
    const corpo = JSON.parse(bruto);

    if (Array.isArray(corpo)) {
      // Reporting API: lote de relatórios.
      for (const item of corpo) {
        if (item?.type === "csp-violation" && item?.body) {
          console.warn("[csp]", JSON.stringify(resumir(item.body)));
        }
      }
    } else if (corpo?.["csp-report"]) {
      console.warn("[csp]", JSON.stringify(resumir(corpo["csp-report"])));
    }
  } catch {
    // Corpo malformado não é erro nosso: o relatório vem do navegador.
    console.warn("[csp] relatorio ilegivel");
  }

  // 204 sempre: o navegador não deve reagir ao resultado do envio.
  return new Response(null, { status: 204 });
}
