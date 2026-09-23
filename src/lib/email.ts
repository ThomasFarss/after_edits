// Envio simples via API REST da Resend (sem SDK) — só falta configurar
// RESEND_API_KEY no ambiente (crie uma conta grátis em resend.com). O
// destinatário já vem com um padrão; ACCESS_REQUEST_TO_EMAIL só é preciso se
// quiser mandar pra outro email. ACCESS_REQUEST_FROM_EMAIL é opcional (padrão:
// onboarding@resend.dev, domínio de testes que não precisa de verificação).
// Sem RESEND_API_KEY configurada, o envio é pulado silenciosamente — o
// pedido continua salvo no banco e visível na aba "Solicitações" do Admin.
const DEFAULT_TO_EMAIL = "thomasgfariass@gmail.com";

export async function sendAccessRequestEmail(data: {
  name: string;
  reason: string;
  referredBy: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ACCESS_REQUEST_TO_EMAIL ?? DEFAULT_TO_EMAIL;
  if (!apiKey) {
    console.warn(
      "[access-request] RESEND_API_KEY não configurada — email não enviado, pedido só ficou salvo no banco."
    );
    return { sent: false as const };
  }

  const from = process.env.ACCESS_REQUEST_FROM_EMAIL ?? "onboarding@resend.dev";

  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Novo pedido de acesso: ${data.name}`,
      html: `
        <p><strong>Nome:</strong> ${escape(data.name)}</p>
        <p><strong>Motivo:</strong> ${escape(data.reason)}</p>
        <p><strong>Quem passou o link:</strong> ${escape(data.referredBy)}</p>
      `,
    }),
  });

  if (!res.ok) {
    console.error("[access-request] Falha ao enviar email:", res.status, await res.text());
    return { sent: false as const };
  }
  return { sent: true as const };
}
