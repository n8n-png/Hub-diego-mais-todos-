import "server-only";

import type { Area } from "@/lib/areas";
import type { ContextoAcesso, Papel } from "@/lib/permissoes";

/**
 * Contrato da sessão do Hub.
 *
 * A implementação real (Google OAuth + cookie httpOnly) entra no módulo A7.
 * O contrato existe antes porque o guarda de rota e as ações de servidor são
 * construídos contra ele, não contra o mecanismo de login.
 *
 * REGRA QUE NÃO MUDA COM A IMPLEMENTAÇÃO
 * Isto é servidor. Nada aqui pode ser inferido de valor vindo do navegador:
 * papel e áreas saem do banco, espelhados do Convenia, nunca de cabeçalho,
 * corpo de requisição ou campo de formulário.
 */

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  areas: Area[];
  /** Origem da permissão, para a tela de acessos distinguir automático de exceção. */
  origemPermissao: "convenia" | "excecao";
  /** Enquanto falso, a pessoa é do domínio mas ainda não foi habilitada. */
  acessoAprovado: boolean;
};

export class NaoAutenticado extends Error {
  constructor() {
    super("Sessão ausente ou expirada.");
    this.name = "NaoAutenticado";
  }
}

export class AcessoNegado extends Error {
  constructor(motivo: string) {
    super(motivo);
    this.name = "AcessoNegado";
  }
}

/**
 * Usuário da requisição atual, ou `null` quando não há sessão válida.
 * Implementação em A7.
 */
export async function obterUsuario(): Promise<Usuario | null> {
  throw new Error(
    "obterUsuario ainda não foi implementado. Módulo A7, autenticação Google.",
  );
}

/** Usuário autenticado e habilitado, ou erro. Use em rota e ação de servidor. */
export async function exigirUsuario(): Promise<Usuario> {
  const usuario = await obterUsuario();
  if (!usuario) throw new NaoAutenticado();
  if (!usuario.acessoAprovado) {
    throw new AcessoNegado(
      "Sua conta existe, mas o acesso ainda precisa ser liberado por um administrador.",
    );
  }
  return usuario;
}

export function contextoDe(usuario: Usuario): ContextoAcesso {
  return { papel: usuario.papel, areas: usuario.areas };
}
