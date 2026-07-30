import { createHash, randomBytes } from "crypto";

/**
 * Generates a new API key. Only the hash + prefix are persisted; the raw key is
 * returned once so it can be shown to the user immediately after creation.
 */
export function generateApiKey(): {
  key: string;
  hash: string;
  prefix: string;
} {
  const raw = `pulse_${randomBytes(24).toString("hex")}`;
  return {
    key: raw,
    hash: hashApiKey(raw),
    prefix: raw.slice(0, 12),
  };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
