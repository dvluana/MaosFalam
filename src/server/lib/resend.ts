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

function emailShell(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#08050E;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08050E;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#110C1A;">
  <!-- Gold accent line -->
  <tr><td style="height:2px;background:linear-gradient(90deg,transparent,#C9A24A,transparent);font-size:0;line-height:0;">&nbsp;</td></tr>
  <!-- Content -->
  <tr><td style="padding:48px 36px 40px 36px;">
    ${content}
  </td></tr>
  <!-- Footer separator -->
  <tr><td style="padding:0 36px;"><div style="height:1px;background:linear-gradient(90deg,transparent,rgba(201,162,74,0.12),transparent);"></div></td></tr>
  <!-- Footer -->
  <tr><td style="padding:24px 36px 32px 36px;text-align:center;">
    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:0.08em;color:#7A6832;">M\u00e3osFalam</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function emailButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:36px 0 0 0;">
<tr><td style="background:linear-gradient(160deg,#1E1838,#2A2150,#1E1838);padding:14px 36px;border-radius:0 6px 0 6px;box-shadow:0 0 0 1px rgba(201,162,74,0.1),0 0 24px rgba(123,107,165,0.08);">
  <a href="${href}" style="font-family:'Trebuchet MS',Helvetica,sans-serif;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#E8DFD0;text-decoration:none;display:inline-block;">${label}</a>
</td></tr>
</table>`;
}

export async function sendPaymentConfirmed(to: string, name: string, readingUrl: string) {
  await sendEmail(
    to,
    `Sua leitura completa est\u00e1 pronta, ${name}`,
    emailShell(`
      <p style="margin:0 0 24px 0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:18px;line-height:1.6;color:#E8DFD0;letter-spacing:0.01em;">
        Pronto, ${name}. Eu terminei de ler.
      </p>
      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.85;color:#9B9284;">
        Sua leitura completa est\u00e1 esperando. Todas as linhas. Todos os montes. Os sinais que quase ningu\u00e9m tem.
      </p>
      ${emailButton(readingUrl, "Ver minha leitura completa")}
    `),
  );
}

export async function sendLeadReading(to: string, name: string, readingUrl: string) {
  await sendEmail(
    to,
    `Suas m\u00e3os j\u00e1 falaram, ${name}`,
    emailShell(`
      <p style="margin:0 0 24px 0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:18px;line-height:1.6;color:#E8DFD0;letter-spacing:0.01em;">
        ${name}.
      </p>
      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.85;color:#9B9284;">
        Sua leitura est\u00e1 pronta. O que eu vi no seu Cora\u00e7\u00e3o j\u00e1 est\u00e1 te esperando.
      </p>
      ${emailButton(readingUrl, "Ver minha leitura")}
    `),
  );
}

export async function sendWelcome(to: string, name: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://maosfalam.com";
  await sendEmail(
    to,
    `Bem-vinda, ${name}. Suas m\u00e3os estavam esperando.`,
    emailShell(`
      <p style="margin:0 0 24px 0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:18px;line-height:1.6;color:#E8DFD0;letter-spacing:0.01em;">
        ${name}.
      </p>
      <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.85;color:#9B9284;">
        Agora voc\u00ea tem onde guardar o que suas m\u00e3os dizem. Sua conta est\u00e1 pronta. Volte quando quiser. Eu vou estar aqui.
      </p>
      ${emailButton(`${baseUrl}/conta/leituras`, "Ver minhas leituras")}
    `),
  );
}
