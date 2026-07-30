"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Copy, Check, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createApiKey, revokeApiKey } from "@/app/actions/settings";

export type ApiKeyItem = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export function ApiKeys({ keys }: { keys: ApiKeyItem[] }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [revokingId, setRevokingId] = React.useState<string | null>(null);
  const [newKey, setNewKey] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setNewKey(null);
    const result = await createApiKey({ name });
    setPending(false);
    setNewKey(result.key);
    setName("");
    router.refresh();
  }

  async function handleRevoke(id: string) {
    setRevokingId(id);
    await revokeApiKey(id);
    setRevokingId(null);
    router.refresh();
  }

  async function copyKey() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="h-4 w-4 text-primary" />
          API keys
        </CardTitle>
        <CardDescription>
          Create keys to access the Pulse API programmatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleCreate} className="flex items-end gap-2">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="key-name">Key name</Label>
            <Input
              id="key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production server"
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create key
          </Button>
        </form>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {newKey ? (
          <div className="space-y-2 rounded-md border border-primary/40 bg-accent p-3">
            <p className="text-sm font-medium text-accent-foreground">
              Copy your new key now — you won&apos;t see it again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded bg-background px-2 py-1.5 text-xs">
                {newKey}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyKey}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ) : null}

        <div className="divide-y divide-border">
          {keys.length ? (
            keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{key.name}</p>
                  <p className="text-xs text-muted-foreground">
                    <code>{key.keyPrefix}…</code> · created{" "}
                    {new Date(key.createdAt).toLocaleDateString()}
                    {key.lastUsedAt
                      ? ` · last used ${new Date(
                          key.lastUsedAt
                        ).toLocaleDateString()}`
                      : " · never used"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevoke(key.id)}
                  disabled={revokingId === key.id}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Revoke key"
                >
                  {revokingId === key.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))
          ) : (
            <p className="py-3 text-sm text-muted-foreground">
              No API keys yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
