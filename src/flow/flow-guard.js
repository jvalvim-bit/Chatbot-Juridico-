const uploadCommands = [
  /^enviar documentos?$/i,
  /^quero enviar documentos?$/i,
  /^mandar arquivos?$/i,
  /^anexar documentos?$/i,
];

const schedulingStates = new Set([
  "coletando_agendamento",
  "escolher_data",
  "escolher_horario",
  "confirmar_agendamento",
]);

const documentMentions =
  /\b(documentos?|cnis|laudos?|prints?|contratos?|comprovantes?|notas? fiscais?|holerites?)\b/i;

export function isExplicitUploadCommand(message) {
  const normalized = String(message ?? "").trim();
  return uploadCommands.some((pattern) => pattern.test(normalized));
}

export function evaluateTransition({ state, message, hasMedia = false }) {
  const text = String(message ?? "").trim();

  if (hasMedia || isExplicitUploadCommand(text)) {
    return {
      allowed: true,
      nextState: "receber_documento",
      reason: "explicit-upload",
    };
  }

  if (documentMentions.test(text)) {
    return {
      allowed: false,
      nextState: state,
      reason: "mention-is-not-upload",
    };
  }

  if (/^[0-4]$/.test(text) && state !== "menu_principal") {
    return { allowed: false, nextState: state, reason: "number-outside-menu" };
  }

  if (schedulingStates.has(state)) {
    return {
      allowed: true,
      nextState: state,
      reason: "keep-scheduling-context",
    };
  }

  return { allowed: true, nextState: state, reason: "neutral-message" };
}
