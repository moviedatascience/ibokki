/**
 * Outbound mail — same setup as the ibokkiSite Django app: plain SMTP through
 * ProtonMail from an @ibokki.com address, credentials via the SAME env var
 * names (EMAIL_HOST_USER / EMAIL_HOST_PASSWORD etc.) so the site's values can
 * be copied straight over. With no password configured (local dev / tests),
 * mails are logged to the console instead — the Django console-backend trick.
 */
import { createTransport, type Transporter } from "nodemailer";

export interface Mailer {
  send(to: string, subject: string, text: string): Promise<void>;
}

export function createMailer(): Mailer {
  const host = process.env.EMAIL_HOST ?? "smtp.protonmail.ch";
  const port = Number(process.env.EMAIL_PORT ?? 587);
  const user = process.env.EMAIL_HOST_USER ?? "";
  const pass = process.env.EMAIL_HOST_PASSWORD ?? "";
  const from = process.env.DEFAULT_FROM_EMAIL ?? user ?? "noreply@ibokki.com";

  if (!pass) {
    return {
      async send(to, subject, text) {
        console.log(`[mail:console] to=${to} subject="${subject}"\n${text}`);
      },
    };
  }

  const transport: Transporter = createTransport({
    host,
    port,
    secure: false, // 587 = STARTTLS
    auth: { user, pass },
  });
  return {
    async send(to, subject, text) {
      await transport.sendMail({ from, to, subject, text });
    },
  };
}
