import { evaluateTransition } from "../flow/flow-guard.js";

const menu = [
  "Olá! Este é um fluxo demonstrativo.",
  "1. Iniciar triagem jurídica",
  "2. Simular agendamento",
  "3. Enviar documentos",
  "0. Encerrar demonstração",
].join("\n");

export function respond({
  state = "menu_principal",
  message = "",
  hasMedia = false,
}) {
  const guard = evaluateTransition({ state, message, hasMedia });
  const normalized = String(message).trim();

  if (!guard.allowed) {
    const reply =
      guard.reason === "mention-is-not-upload"
        ? "Entendi a menção aos documentos. Continue o relato; o envio só começa com um comando explícito."
        : "Esse número só funciona quando o menu correspondente está visível.";
    return { state: guard.nextState, reply, guard: guard.reason };
  }

  if (guard.nextState === "receber_documento") {
    return {
      state: "receber_documento",
      reply:
        "Modo demonstrativo: o anexo seria validado e enviado ao armazenamento privado.",
      guard: guard.reason,
    };
  }

  if (state === "menu_principal") {
    if (normalized === "1") {
      return {
        state: "coletar_descricao",
        reply: "Conte, sem dados pessoais, um resumo fictício do caso.",
        guard: guard.reason,
      };
    }
    if (normalized === "2") {
      return {
        state: "escolher_data",
        reply: "Qual data fictícia você gostaria de simular?",
        guard: guard.reason,
      };
    }
    if (normalized === "0") {
      return {
        state: "encerrado",
        reply: "Demonstração encerrada.",
        guard: guard.reason,
      };
    }
    return { state, reply: menu, guard: guard.reason };
  }

  if (state === "coletar_descricao") {
    return {
      state: "oferecer_agendamento",
      reply:
        "Relato fictício registrado. Em produção, um profissional faria a revisão antes do contato.",
      guard: guard.reason,
    };
  }

  if (state === "escolher_data") {
    return {
      state: "confirmar_agendamento",
      reply:
        "Horário demonstrativo sugerido: próximo dia útil às 14h. Deseja confirmar?",
      guard: guard.reason,
    };
  }

  return { state, reply: menu, guard: guard.reason };
}
