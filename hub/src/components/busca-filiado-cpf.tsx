"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apenasDigitos, cpfValido, formatarCpf } from "@/lib/cpf";

/**
 * Busca de filiado por CPF — a porta de entrada de todo atendimento.
 *
 * Aceita com e sem máscara: o atendente cola o valor de onde estiver e o sistema
 * normaliza. A validação de dígito verificador acontece antes da chamada, para
 * não gastar requisição em CPF digitado errado.
 */
export function BuscaFiliadoCpf({
  onBuscar,
  carregando = false,
  autoFocus = false,
}: {
  onBuscar: (cpf: string) => void;
  carregando?: boolean;
  autoFocus?: boolean;
}) {
  const [valor, setValor] = useState("");
  const [tocado, setTocado] = useState(false);

  const digitos = apenasDigitos(valor);
  const completo = digitos.length === 11;
  const valido = completo && cpfValido(digitos);
  const mostrarErro = tocado && completo && !valido;

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!valido || carregando) return;
    onBuscar(digitos);
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-1.5">
      <Label htmlFor="busca-cpf">CPF do filiado</Label>
      <div className="flex gap-2">
        <Input
          id="busca-cpf"
          value={valor}
          onChange={(e) => setValor(formatarCpf(e.target.value))}
          onBlur={() => setTocado(true)}
          placeholder="000.000.000-00"
          inputMode="numeric"
          autoComplete="off"
          autoFocus={autoFocus}
          maxLength={14}
          aria-invalid={mostrarErro}
          className="max-w-56"
        />
        <Button type="submit" disabled={!valido || carregando}>
          <Search className="size-4" />
          Buscar
        </Button>
      </div>
      {mostrarErro && (
        <p className="text-xs text-destructive">
          Este CPF não é válido. Confira os números antes de buscar.
        </p>
      )}
    </form>
  );
}
