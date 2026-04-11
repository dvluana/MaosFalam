import pino from "pino";

const VALID_LEVELS = ["fatal", "error", "warn", "info", "debug", "trace"] as const;
const envLevel = process.env.LOG_LEVEL as (typeof VALID_LEVELS)[number] | undefined;
const level = envLevel && VALID_LEVELS.includes(envLevel) ? envLevel : "info";

export const logger = pino({
  level,
  redact: {
    paths: ["name", "email", "cpf", "phone", "*.name", "*.email", "*.cpf", "*.phone"],
    censor: "[REDACTED]",
  },
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

// REGRA: nunca logar nome, email, CPF, ou qualquer dado pessoal. Só IDs e ações.
