import test from "node:test";
import assert from "node:assert/strict";

import { respond } from "../src/bot/conversation-engine.js";
import {
  evaluateTransition,
  isExplicitUploadCommand,
} from "../src/flow/flow-guard.js";

test("menção a documentos durante relato não inicia upload", () => {
  const result = evaluateTransition({
    state: "coletar_descricao",
    message: "Tenho laudos, CNIS e carta do INSS.",
  });

  assert.equal(result.allowed, false);
  assert.equal(result.nextState, "coletar_descricao");
  assert.equal(result.reason, "mention-is-not-upload");
});

test("comando explícito inicia o fluxo demonstrativo de documentos", () => {
  assert.equal(isExplicitUploadCommand("Quero enviar documentos"), true);

  const result = evaluateTransition({
    state: "menu_principal",
    message: "Quero enviar documentos",
  });

  assert.equal(result.allowed, true);
  assert.equal(result.nextState, "receber_documento");
});

test("número isolado fora do menu não muda de estado", () => {
  const result = evaluateTransition({
    state: "coletar_descricao",
    message: "2",
  });

  assert.equal(result.allowed, false);
  assert.equal(result.reason, "number-outside-menu");
});

test("frase de agendamento permanece no contexto de agenda", () => {
  const result = evaluateTransition({
    state: "escolher_data",
    message: "Qualquer dia na próxima semana pela manhã",
  });

  assert.equal(result.allowed, true);
  assert.equal(result.nextState, "escolher_data");
  assert.equal(result.reason, "keep-scheduling-context");
});

test("engine entrega somente respostas fictícias e determinísticas", () => {
  const result = respond({ state: "menu_principal", message: "1" });

  assert.equal(result.state, "coletar_descricao");
  assert.match(result.reply, /sem dados pessoais/i);
});
