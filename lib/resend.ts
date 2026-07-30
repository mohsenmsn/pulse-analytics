import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const fromAddress =
  process.env.RESEND_FROM_EMAIL ?? "Pulse <onboarding@resend.dev>";

export async function sendAlertEmail({
  to,
  alertName,
  metric,
  threshold,
  currentValue,
  condition,
  organisationName,
}: {
  to: string;
  alertName: string;
  metric: string;
  threshold: number;
  currentValue: number;
  condition: string;
  organisationName: string;
}) {
  return resend.emails.send({
    from: fromAddress,
    to,
    subject: `[Pulse Alert] ${alertName} threshold breached`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #0f766e;">Pulse Alert</h2>
        <p><strong>${organisationName}</strong> — alert <em>${alertName}</em> was triggered.</p>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;">Metric</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>${metric}</strong></td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;">Condition</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${condition} ${threshold}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;">Current value</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>${currentValue}</strong></td></tr>
        </table>
        <p style="color:#6b7280;font-size:14px;">You received this because you configured an alert in Pulse.</p>
      </div>
    `,
  });
}

export async function sendInviteEmail({
  to,
  organisationName,
  inviteUrl,
}: {
  to: string;
  organisationName: string;
  inviteUrl: string;
}) {
  return resend.emails.send({
    from: fromAddress,
    to,
    subject: `You're invited to ${organisationName} on Pulse`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #0f766e;">Join ${organisationName} on Pulse</h2>
        <p>You've been invited to collaborate on analytics dashboards.</p>
        <p style="margin: 24px 0;">
          <a href="${inviteUrl}" style="background:#0d9488;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
            Accept invite
          </a>
        </p>
        <p style="color:#6b7280;font-size:14px;">Or open: ${inviteUrl}</p>
      </div>
    `,
  });
}
