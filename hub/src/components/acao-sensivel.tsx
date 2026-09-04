"use client";

import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { interpretarChamado, rotuloOrigem, type OrigemChamado } from "@/lib/chamado";
import { cn } from "@/lib/utils";

const PALAVRA_CHAVE = "CONFIRMAR";
const MOTIVO_MINIMO = 10;

export type ContextoAuditoria = {
  motivo: string;
  chamadoUrl: string;
  chamadoNumero: string | null;
  chamadoOrigem: OrigemChamado;
};

export type ResultadoAcao = { ok: true } | { ok: false; erro: string };

/**
 * Padrão único de escrita do Hub. Todo módulo que executa ação sobre sistema,
 * dado de filiado ou papel de pessoa passa por aqui.
 *
 * Quatro etapas, nesta ordem:
 *  1. pré-visualização do payload exatamente como será enviado;
 *  2. motivo do atendimento, obrigatório;
 *  3. link do chamado, obrigatório, com o número extraído automaticamente;
 *  4. confirmação explícita, digitando CONFIRMAR.
 *
 * DIFERENÇA IMPORTANTE EM RELAÇÃO AO PROTÓTIPO
 * A trilha NÃO é gravada aqui. O componente entrega o contexto de auditoria para
 * a ação do servidor, que executa e grava na mesma transação. Registro escrito
 * pelo navegador não é confiável: quem abre o console bloqueia o envio e age sem
 * rastro — e o rastro passa a importar justamente quando a ação vira efeito em
 * sistema produtivo.
 */
export function AcaoSensivel({
  titulo,
  descricao,
  modulo,
  acao,
  alvo,
  payload,
  rotuloConfirmar = "Executar ação",
  destrutiva = false,
  disabled = false,
  onConfirmar,
  children,
}: {
  titulo: string;
  descricao: string;
  /** Identificação da operação, exibida no preview e gravada pelo servidor. */
  modulo: string;
  acao: string;
  /** Alvo da ação, já mascarado pelo chamador quando for dado pessoal. */
  alvo?: string | null;
  payload: unknown;
  rotuloConfirmar?: string;
  destrutiva?: boolean;
  disabled?: boolean;
  /** Ação de servidor: executa e grava a trilha na mesma transação. */
  onConfirmar: (contexto: ContextoAuditoria) => Promise<ResultadoAcao>;
  children: ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [motivo, setMotivo] = useState("");
  const [linkChamado, setLinkChamado] = useState("");
  const [numeroManual, setNumeroManual] = useState("");
  const [executando, setExecutando] = useState(false);

  const chamado = interpretarChamado(linkChamado);
  const linkTocado = linkChamado.trim().length > 0;
  const linkInvalido = linkTocado && chamado === null;
  const numero = chamado?.numero ?? (numeroManual.trim() || null);

  const motivoOk = motivo.trim().length >= MOTIVO_MINIMO;
  const chamadoOk = chamado !== null && numero !== null;
  const confirmacaoOk = confirmacao.trim().toUpperCase() === PALAVRA_CHAVE;
  const habilitado = motivoOk && chamadoOk && confirmacaoOk && !executando;

  function alternar(valor: boolean) {
    setAberto(valor);
    if (!valor) {
      setConfirmacao("");
      setMotivo("");
      setLinkChamado("");
      setNumeroManual("");
    }
  }

  async function executar() {
    if (!habilitado || !chamado || !numero) return;
    setExecutando(true);
    try {
      const resultado = await onConfirmar({
        motivo: motivo.trim(),
        chamadoUrl: chamado.url,
        chamadoNumero: numero,
        chamadoOrigem: chamado.origem,
      });

      if (resultado.ok) {
        toast.success("Ação executada e registrada na trilha.");
        alternar(false);
      } else {
        // Ação que falhou também é rastro: o servidor já registrou a falha.
        toast.error(`Não foi possível concluir: ${resultado.erro}`);
      }
    } catch {
      toast.error("Falha de comunicação com o servidor. A ação não foi executada.");
    } finally {
      setExecutando(false);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={alternar}>
      <DialogTrigger asChild disabled={disabled}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            {titulo}
          </DialogTitle>
          <DialogDescription>{descricao}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-border bg-accent px-3 py-2 text-xs text-accent-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              Ação sensível. Fica registrada na trilha com seu nome, o horário, o motivo e o
              chamado informados. O registro não pode ser alterado nem apagado depois.
            </p>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Pré-visualização do envio
            </div>
            <pre className="max-h-48 overflow-auto rounded-lg border border-border bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground">
              {JSON.stringify({ modulo, acao, alvo: alvo ?? null, payload }, null, 2)}
            </pre>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acao-motivo">Motivo do atendimento</Label>
            <Textarea
              id="acao-motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="O que o filiado solicitou e por que esta ação resolve"
              maxLength={500}
              rows={2}
              aria-invalid={motivo.length > 0 && !motivoOk}
            />
            {motivo.length > 0 && !motivoOk && (
              <p className="text-xs text-destructive">
                Descreva o motivo com pelo menos {MOTIVO_MINIMO} caracteres. É o que dá
                contexto a quem revisar a trilha meses depois.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acao-chamado">Link do chamado</Label>
            <Input
              id="acao-chamado"
              value={linkChamado}
              onChange={(e) => setLinkChamado(e.target.value)}
              placeholder="https://…"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={linkInvalido}
            />
            {linkInvalido && (
              <p className="text-xs text-destructive">
                Informe o endereço completo do chamado, começando com https://
              </p>
            )}
            {chamado && (
              <p className="text-xs text-muted-foreground">
                {rotuloOrigem[chamado.origem]}
                {chamado.numero ? (
                  <>
                    {" · chamado "}
                    <span className="font-medium text-foreground">{chamado.numero}</span>
                    {", identificado pelo link"}
                  </>
                ) : (
                  ", número não identificado pelo link"
                )}
              </p>
            )}
          </div>

          {chamado && !chamado.numero && (
            <div className="space-y-1.5">
              <Label htmlFor="acao-numero">Número do chamado</Label>
              <Input
                id="acao-numero"
                value={numeroManual}
                onChange={(e) => setNumeroManual(e.target.value)}
                placeholder="Número que o filiado recebeu ao abrir o chamado"
                autoComplete="off"
                maxLength={40}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="acao-confirmar">
              Para liberar o botão, digite <span className="font-bold">{PALAVRA_CHAVE}</span>
            </Label>
            <Input
              id="acao-confirmar"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder={PALAVRA_CHAVE}
              autoComplete="off"
              spellCheck={false}
              maxLength={20}
              className={cn(confirmacaoOk && "border-success ring-1 ring-success/40")}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => alternar(false)} disabled={executando}>
            Cancelar
          </Button>
          <Button
            onClick={() => void executar()}
            disabled={!habilitado}
            variant={destrutiva ? "destructive" : "default"}
          >
            {executando && <Loader2 className="size-4 animate-spin" />}
            {rotuloConfirmar}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
