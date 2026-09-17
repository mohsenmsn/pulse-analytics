import { Resend } from "resend";

const fromAddress =
  process.env.RESEND_FROM_EMAIL ?? "Pulse <onboarding@resend.dev>";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  return new Resend(key);
}

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
  const safeOrg = escapeHtml(organisationName);
  const safeAlert = escapeHtml(alertName);
  const safeMetric = escapeHtml(metric);
  const safeCondition = escapeHtml(condition);
  const safeThreshold = escapeHtml(String(threshold));
  const safeValue = escapeHtml(String(currentValue));

  return getResend().emails.send({
    from: fromAddress,
    to,
    subject: `[Pulse Alert] ${alertName.replace(/[\r\n]/g, " ").slice(0, 80)} threshold breached`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #0f766e;">Pulse Alert</h2>
        <p><strong>${safeOrg}</strong> — alert <em>${safeAlert}</em> was triggered.</p>
        <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;">Metric</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>${safeMetric}</strong></td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;">Condition</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${safeCondition} ${safeThreshold}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;">Current value</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>${safeValue}</strong></td></tr>
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
  const safeOrg = escapeHtml(organisationName);
  const safeUrl = escapeHtml(inviteUrl);

  return getResend().emails.send({
    from: fromAddress,
    to,
    subject: `You're invited to ${organisationName.replace(/[\r\n]/g, " ").slice(0, 80)} on Pulse`,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #0f766e;">Join ${safeOrg} on Pulse</h2>
        <p>You've been invited to collaborate on analytics dashboards.</p>
        <p style="margin: 24px 0;">
          <a href="${safeUrl}" style="background:#0d9488;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
            Accept invite
          </a>
        </p>
        <p style="color:#6b7280;font-size:14px;">Or open: ${safeUrl}</p>
      </div>
    `,
  });
}
