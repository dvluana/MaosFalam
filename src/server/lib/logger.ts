import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
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
