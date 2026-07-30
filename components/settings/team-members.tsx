"use client";

import * as React from "react";
import { Users } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MembershipRole } from "@/types";

export type TeamMember = {
  id: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  role: MembershipRole;
};

const ROLE_VARIANT: Record<
  MembershipRole,
  "default" | "secondary" | "muted"
> = {
  OWNER: "default",
  ADMIN: "secondary",
  MEMBER: "muted",
};

export function TeamMembers({
  members,
  pendingInvites = [],
  maxSeats,
}: {
  members: TeamMember[];
  pendingInvites?: string[];
  maxSeats: number;
}) {
  const seatLabel = Number.isFinite(maxSeats) ? String(maxSeats) : "Unlimited";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Team members
        </CardTitle>
        <CardDescription>
          {members.length} of {seatLabel} seats used
          {pendingInvites.length
            ? ` · ${pendingInvites.length} pending invite${
                pendingInvites.length === 1 ? "" : "s"
              }`
            : ""}
          . Use the organization switcher to manage Clerk memberships.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="divide-y divide-border">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    member.imageUrl ??
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                      member.name ?? member.email
                    )}`
                  }
                  alt=""
                  className="h-9 w-9 rounded-full bg-muted object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {member.name ?? "Unnamed user"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
              </div>
              <Badge variant={ROLE_VARIANT[member.role]} className="capitalize">
                {member.role.toLowerCase()}
              </Badge>
            </div>
          ))}
        </div>

        {pendingInvites.length > 0 ? (
          <div className="rounded-md border border-dashed border-border p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pending invites
            </p>
            <ul className="space-y-1.5">
              {pendingInvites.map((email) => (
                <li
                  key={email}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{email}</span>
                  <Badge variant="muted">Pending</Badge>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
