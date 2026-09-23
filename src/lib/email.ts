// Envio simples via API REST da Resend (sem SDK) — configurar no ambiente:
// RESEND_API_KEY, ACCESS_REQUEST_TO_EMAIL e, opcionalmente,
// ACCESS_REQUEST_FROM_EMAIL (padrão: onboarding@resend.dev, domínio de
// testes da Resend que não precisa de verificação).
// Sem RESEND_API_KEY configurada, o envio é pulado silenciosamente — o
// pedido continua salvo no banco e visível na aba "Solicitações" do Admin.
export async function sendAccessRequestEmail(data: {
  name: string;
  reason: string;
  referredBy: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ACCESS_REQUEST_TO_EMAIL;
  if (!apiKey || !to) {
    console.warn(
      "[access-request] RESEND_API_KEY/ACCESS_REQUEST_TO_EMAIL não configurados — email não enviado, pedido só ficou salvo no banco."
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
