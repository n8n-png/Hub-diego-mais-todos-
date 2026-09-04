import path from "node:path";
import type { NextConfig } from "next";

/**
 * Cabeçalhos de segurança emitidos na origem.
 *
 * A borda da MaisTODOS é Akamai, e hoje a produção não emite nenhum destes.
 * Depois de publicar em hub.maistodos.com.br, medir de fora:
 *
 *   curl -sI https://hub.maistodos.com.br | grep -iE "x-frame-options|content-security-policy|strict-transport|x-content-type"
 *
 * Se sair daqui e não chegar ao navegador, a remoção é da borda e a correção é
 * ticket no Akamai, não no código.
 */

/**
 * O CSP fica em Report-Only até medirmos o que o Akamai injeta na página — ele
 * insere script de Real User Monitoring, e um script-src estrito derruba a
 * aplicação em produção.
 *
 * O `report-to` não é detalhe: sem destino, o navegador não envia violação para
 * lugar nenhum e a fase de coleta não coleta nada. O endpoint vive em
 * src/app/api/csp-report.
 */
const CSP_DIRETIVAS = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "report-uri /api/csp-report",
  "report-to csp-endpoint",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Emitido na origem de propósito. Hoje quem manda HSTS é o Akamai, com
  // max-age de um dia — abaixo do padrão da própria casa. Controle de segurança
  // não pode depender só da borda: foi essa a lição do achado P1 do protótipo.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Content-Security-Policy-Report-Only", value: CSP_DIRETIVAS },
  {
    key: "Reporting-Endpoints",
    value: 'csp-endpoint="/api/csp-report"',
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
