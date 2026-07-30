"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
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
import { updateProfile, updateWorkspace } from "@/app/actions/settings";

export function ProfileForm({
  name,
  email,
  workspaceName,
  canEditWorkspace,
}: {
  name: string;
  email: string;
  workspaceName: string;
  canEditWorkspace: boolean;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = React.useState(name);
  const [workspace, setWorkspace] = React.useState(workspaceName);
  const [pending, setPending] = React.useState<"profile" | "workspace" | null>(
    null
  );
  const [saved, setSaved] = React.useState<"profile" | "workspace" | null>(
    null
  );
  const [error, setError] = React.useState<string | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setPending("profile");
    setError(null);
    const result = await updateProfile({ name: displayName });
    setPending(null);
    if (!result.ok) return setError(result.error);
    setSaved("profile");
    router.refresh();
    setTimeout(() => setSaved(null), 2000);
  }

  async function saveWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setPending("workspace");
    setError(null);
    const result = await updateWorkspace({ name: workspace });
    setPending(null);
    if (!result.ok) return setError(result.error);
    setSaved("workspace");
    router.refresh();
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Your personal account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={email} disabled />
              <p className="text-xs text-muted-foreground">
                Managed through your authentication provider.
              </p>
            </div>
            <Button type="submit" disabled={pending === "profile"}>
              {pending === "profile" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved === "profile" ? (
                <Check className="h-4 w-4" />
              ) : null}
              Save profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace</CardTitle>
          <CardDescription>
            The organization name shown across Pulse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveWorkspace} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="workspace-name">Workspace name</Label>
              <Input
                id="workspace-name"
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                disabled={!canEditWorkspace}
              />
              {!canEditWorkspace ? (
                <p className="text-xs text-muted-foreground">
                  Only workspace admins can change this.
                </p>
              ) : null}
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button
              type="submit"
              disabled={!canEditWorkspace || pending === "workspace"}
            >
              {pending === "workspace" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved === "workspace" ? (
                <Check className="h-4 w-4" />
              ) : null}
              Save workspace
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
