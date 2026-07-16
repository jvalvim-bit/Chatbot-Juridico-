import path from "node:path";
import { fileURLToPath } from "node:url";

import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";

import { respond } from "./bot/conversation-engine.js";
import { dashboardFixture } from "./mock-data.js";
import { config } from "./security/config.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.resolve(currentDirectory, "../public");

const messageSchema = z
  .object({
    state: z.string().trim().min(1).max(64).default("menu_principal"),
    message: z.string().trim().max(1_000).default(""),
    hasMedia: z.boolean().default(false),
  })
  .strict();

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || config.allowedOrigins.includes(origin))
          return callback(null, true);
        return callback(new Error("Origem não autorizada."));
      },
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: "16kb", strict: true }));
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );

  app.get("/api/health", (_request, response) => {
    response.json({
      ok: true,
      mode: "showcase",
      uptime: Math.floor(process.uptime()),
    });
  });

  app.get("/api/dashboard", (_request, response) => {
    response.set("Cache-Control", "no-store").json(dashboardFixture);
  });

  app.post(
    "/api/demo/message",
    rateLimit({ windowMs: 60_000, limit: 20, legacyHeaders: false }),
    (request, response) => {
      const parsed = messageSchema.safeParse(request.body);
      if (!parsed.success) {
        return response.status(400).json({ error: "Payload inválido." });
      }
      return response.json(respond(parsed.data));
    },
  );

  app.use(
    express.static(publicDirectory, { extensions: ["html"], maxAge: "1h" }),
  );

  app.use("/api", (_request, response) => {
    response.status(404).json({ error: "Rota não encontrada." });
  });

  app.use((error, _request, response, _next) => {
    if (error instanceof SyntaxError) {
      return response.status(400).json({ error: "JSON inválido." });
    }
    console.error("[showcase] erro de requisição", error.message);
    return response.status(403).json({ error: "Requisição recusada." });
  });

  return app;
}
