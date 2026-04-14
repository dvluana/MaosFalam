import { logger } from "./logger";

const RESEND_URL = "https://api.resend.com/emails";

function hashEmail(email: string): string {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 3)}***@${domain}`;
}

async function sendEmail(to: string, subject: string, html: string) {
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

    if (!res.ok) {
      logger.error({ status: res.status }, "Resend error");
    }

    logger.info({ to_hash: hashEmail(to), subject }, "Email sent");
  } catch (err) {
    logger.error({ err: err instanceof Error ? err.message : String(err) }, "Resend fetch failed");
    // Email falhando NUNCA derruba o fluxo principal.
  }
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
