import "dotenv/config";
import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1024).max(65_535).default(3000),
  ALLOWED_ORIGINS: z
    .string()
    .default("http://127.0.0.1:3000,http://localhost:3000"),
});

const environment = environmentSchema.parse(process.env);

export const config = Object.freeze({
  nodeEnv: environment.NODE_ENV,
  port: environment.PORT,
  allowedOrigins: environment.ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
});
