/**
 * Portfolio / public-demo lockdown helpers.
 * When enabled on a shared deployment, only allowlisted emails (or existing
 * users) can access the live app — strangers cannot burn your API credits.
 */

export function isPortfolioLockdown(): boolean {
  return process.env.PORTFOLIO_LOCKDOWN === "true";
}

export function getPortfolioAllowlist(): string[] {
  return (process.env.PORTFOLIO_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Returns true if a brand-new account email is allowed under lockdown. */
export function isEmailAllowedUnderLockdown(email: string): boolean {
  if (!isPortfolioLockdown()) return true;
  const allowlist = getPortfolioAllowlist();
  // Empty allowlist + lockdown = block all new accounts (owner already in DB).
  if (allowlist.length === 0) return false;
  return allowlist.includes(email.trim().toLowerCase());
}
