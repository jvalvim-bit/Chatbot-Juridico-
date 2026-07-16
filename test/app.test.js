import test from "node:test";
import assert from "node:assert/strict";

import request from "supertest";

import { createApp } from "../src/app.js";

test("health check não revela configuração interna", async () => {
  const response = await request(createApp()).get("/api/health").expect(200);

  assert.deepEqual(Object.keys(response.body).sort(), ["mode", "ok", "uptime"]);
  assert.equal(response.body.ok, true);
  assert.equal(response.headers["x-powered-by"], undefined);
  assert.equal(response.headers["x-content-type-options"], "nosniff");
});

test("dashboard entrega somente fixtures identificadas como fictícias", async () => {
  const response = await request(createApp()).get("/api/dashboard").expect(200);

  assert.match(response.body.notice, /fictícios/i);
  assert.equal(response.headers["cache-control"], "no-store");
  assert.ok(response.body.queue.every((item) => item.id.includes("DEMO")));
});

test("API rejeita campos inesperados e payload excessivo", async () => {
  await request(createApp())
    .post("/api/demo/message")
    .send({ state: "menu_principal", message: "Olá", privileged: true })
    .expect(400, { error: "Payload inválido." });

  await request(createApp())
    .post("/api/demo/message")
    .send({ state: "menu_principal", message: "x".repeat(1_001) })
    .expect(400, { error: "Payload inválido." });
});

test("CORS recusa origem não autorizada", async () => {
  const response = await request(createApp())
    .get("/api/dashboard")
    .set("Origin", "https://origem-nao-autorizada.invalid")
    .expect(403);

  assert.equal(response.body.error, "Requisição recusada.");
});
