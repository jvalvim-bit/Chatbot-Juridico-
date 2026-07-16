import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

const binaryExtensions = new Set([
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".lock",
  ".pdf",
  ".png",
  ".webp",
]);

const forbiddenFiles = [
  /^\.env(?:\..+)?$/,
  /(?:^|\/)(?:sessions?|uploads?|documents?|documentos?)(?:\/|$)/i,
  /(?:^|\/)\.wwebjs_(?:auth|cache)(?:\/|$)/i,
  /\.(?:pem|p12|pfx|key)$/i,
];

const patterns = [
  {
    name: "chave privada",
    expression: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  },
  { name: "token GitHub", expression: /gh[pousr]_[A-Za-z0-9]{20,}/ },
  {
    name: "chave OpenAI/IA",
    expression: /\b(?:sk|rk)-(?:proj-)?[A-Za-z0-9_-]{20,}\b/,
  },
  { name: "chave Google", expression: /AIza[0-9A-Za-z_-]{30,}/ },
  {
    name: "JWT literal",
    expression:
      /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/,
  },
  {
    name: "URL de projeto Supabase",
    expression: /https:\/\/[a-z0-9-]+\.supabase\.co/i,
  },
];

function trackedFiles() {
  try {
    return execFileSync("git", ["ls-files", "-co", "--exclude-standard"], {
      encoding: "utf8",
    })
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    return [];
  }
}

const findings = [];

for (const file of trackedFiles()) {
  const normalized = file.replaceAll("\\", "/");
  if (normalized === ".env.example") continue;
  if (forbiddenFiles.some((pattern) => pattern.test(normalized))) {
    findings.push(`${normalized}: arquivo proibido`);
    continue;
  }
  if (binaryExtensions.has(path.extname(normalized).toLowerCase())) continue;
  if (statSync(file).size > 2_000_000) continue;

  const content = readFileSync(file, "utf8");
  for (const pattern of patterns) {
    if (pattern.expression.test(content))
      findings.push(`${normalized}: ${pattern.name}`);
  }
}

if (findings.length > 0) {
  console.error("Possíveis segredos ou artefatos privados encontrados:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
} else {
  console.info("Verificação de segredos concluída sem achados.");
}
