import { logger } from "./logger";

const RESEND_URL = "https://api.resend.com/emails";
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1000;

function hashEmail(email: string): string {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 3)}***@${domain}`;
}

async function sendEmail(to: string, subject: string, html: string) {
  // API key guard: skip silently if not configured
  if (!process.env.RESEND_API_KEY) {
    logger.info({ subject }, "RESEND_API_KEY not set, skipping email");
    return;
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(RESEND_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "MaosFalam <noreply@maosfalam.com.br>",
          to,
          subject,
          html,
        }),
      });

      if (res.ok) {
        logger.info({ to_hash: hashEmail(to), subject }, "Email sent");
        return;
      }

      // 4xx: client error, no point retrying
      if (res.status >= 400 && res.status < 500) {
        logger.error({ status: res.status }, "Resend client error, not retrying");
        return;
      }

      // 5xx: transient, retry
      if (attempt < MAX_ATTEMPTS - 1) {
        logger.warn({ status: res.status, attempt }, "Resend 5xx, retrying");
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }

      logger.error({ status: res.status }, "Resend error after retry");
    } catch (err) {
      if (attempt < MAX_ATTEMPTS - 1) {
        logger.warn(
          { err: err instanceof Error ? err.message : String(err), attempt },
          "Resend fetch failed, retrying",
        );
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }

      logger.error(
        { err: err instanceof Error ? err.message : String(err) },
        "Resend fetch failed after retry",
      );
    }
  }
  // Email falhando NUNCA derruba o fluxo principal.
}

export async function sendPaymentConfirmed(to: string, name: string, readingUrl: string) {
  await sendEmail(
    to,
    `Sua leitura completa ta pronta, ${name}`,
    `
    <div style="font-family: Georgia, serif; color: #E8DFD0; background: #110C1A; padding: 40px; max-width: 480px;">
      <p>Pronto, ${name}. Eu terminei de ler.</p>
      <p>Sua leitura completa ta esperando. Todas as linhas. Todos os montes. Os sinais que quase ninguem tem.</p>
      <p style="margin-top: 32px;">
        <a href="${readingUrl}" style="color: #C9A24A; text-decoration: underline;">Ver minha leitura completa</a>
      </p>
      <p style="color: #7A6832; font-size: 12px; margin-top: 40px;">MaosFalam</p>
    </div>
  `,
  );
}

export async function sendLeadReading(to: string, name: string, readingUrl: string) {
  await sendEmail(
    to,
    `Suas maos ja falaram, ${name}`,
    `
    <div style="font-family: Georgia, serif; color: #E8DFD0; background: #110C1A; padding: 40px; max-width: 480px;">
      <p>${name}.</p>
      <p>Sua leitura ta pronta. O que eu vi no seu Coracao ja ta te esperando.</p>
      <p style="margin-top: 32px;">
        <a href="${readingUrl}" style="color: #C9A24A; text-decoration: underline;">Ver minha leitura</a>
      </p>
      <p style="color: #7A6832; font-size: 12px; margin-top: 40px;">MaosFalam</p>
    </div>
  `,
  );
}

export async function sendWelcome(to: string, name: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://maosfalam.com";
  await sendEmail(
    to,
    `Bem-vinda, ${name}. Suas maos estavam esperando.`,
    `
    <div style="font-family: Georgia, serif; color: #E8DFD0; background: #110C1A; padding: 40px; max-width: 480px;">
      <p>${name}.</p>
      <p>Agora voce tem onde guardar o que suas maos dizem. Sua conta ta pronta. Volte quando quiser. Eu vou estar aqui.</p>
      <p style="margin-top: 32px;">
        <a href="${baseUrl}/conta/leituras" style="color: #C9A24A; text-decoration: underline;">Ver minhas leituras</a>
      </p>
      <p style="color: #7A6832; font-size: 12px; margin-top: 40px;">MaosFalam</p>
    </div>
  `,
  );
}
