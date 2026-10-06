"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, readApiError } from "@/lib/client-auth";
import { BADGES, BADGE_KEYS, badgesFor, type BadgeKey } from "@/lib/constants";
import type { Profile } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export function UsersPanel({ users, currentUserId }: { users: Profile[]; currentUserId: string }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState("");
  const [messages, setMessages] = useState<Record<string, string>>({});

  async function update(userId: string, patch: Record<string, unknown>) {
    setBusyId(userId);
    setMessages((m) => ({ ...m, [userId]: "" }));
    const response = await apiFetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setBusyId("");
    if (!response.ok) {
      const errorText = await readApiError(response);
      setMessages((m) => ({ ...m, [userId]: errorText }));
      return;
    }
    router.refresh();
  }

  async function toggleBadge(user: Profile, key: BadgeKey) {
    const current = badgesFor(user);
    const next = current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key];
    await update(user.id, { badges: next });
  }

  async function toggleRole(user: Profile) {
    const current = badgesFor(user);
    const next =
      user.role === "admin"
        ? current.filter((item) => item !== "admin")
        : Array.from(new Set([...current, "verified", "admin"]));
    await update(user.id, {
      role: user.role === "admin" ? "user" : "admin",
      badges: next,
    });
  }

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[980px] text-sm">
        <thead>
          <tr className="border-b border-line bg-panel2/60 text-left text-xs uppercase tracking-wider text-muted">
            <th className="px-5 py-3 font-medium">User</th>
            <th className="px-3 py-3 font-medium">Email</th>
            <th className="px-3 py-3 font-medium">Role</th>
            <th className="px-3 py-3 font-medium">Badges</th>
            <th className="px-3 py-3 font-medium">Joined</th>
            <th className="px-5 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-line/70">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="accent-gradient flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-title">
                    {(user.username || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-title">
                      {user.username}
                      {user.id === currentUserId ? (
                        <span className="ml-2 text-xs text-muted">(you)</span>
                      ) : null}
                    </p>
                    <p className="truncate text-xs text-muted">@{user.handle}</p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3.5 text-muted">{user.email}</td>
              <td className="px-3 py-3.5">
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={user.role === "admin" ? "accent" : "default"}>
                    {user.role}
                  </Badge>
                  {user.banned ? <Badge tone="danger">banned</Badge> : null}
                  {user.banned ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src="/suspended-stamp.jpg"
                      alt="Suspended"
                      title="Suspended"
                      className="h-5 w-5 shrink-0 rounded-full object-cover"
                    />
                  ) : null}
                </div>
                {messages[user.id] ? (
                  <p className="mt-1 max-w-[180px] text-[11px] text-red-300">{messages[user.id]}</p>
                ) : null}
              </td>
              <td className="px-3 py-3.5">
                <div className="flex flex-wrap gap-1.5">
                  {BADGE_KEYS.map((key) => {
                    const badge = BADGES[key];
                    const active = badgesFor(user).includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={busyId === user.id}
                        title={active ? `Remove ${badge.label}` : `Assign ${badge.label}`}
                        onClick={() => toggleBadge(user, key)}
                        className={cn(
                          "flex items-center gap-1 rounded-md border px-1.5 py-1 text-[11px] transition disabled:opacity-40",
                          active
                            ? "border-accent/60 bg-accent-soft text-title"
                            : "border-line bg-panel2 text-muted hover:border-accent/40 hover:text-title"
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={badge.src}
                          alt=""
                          aria-hidden="true"
                          className={cn(
                            "h-3.5 w-3.5 shrink-0",
                            "chip" in badge && badge.chip
                              ? "rounded-full object-cover"
                              : "object-contain"
                          )}
                        />
                        {badge.label}
                      </button>
                    );
                  })}
                </div>
              </td>
              <td className="px-3 py-3.5 text-muted">{formatDate(user.created_at)}</td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={busyId === user.id || user.id === currentUserId}
                    onClick={() => toggleRole(user)}
                    className="rounded-md border border-line bg-panel2 px-2.5 py-1.5 text-xs text-mist transition hover:border-accent/50 hover:text-title disabled:opacity-40"
                  >
                    {busyId === user.id
                      ? "…"
                      : user.role === "admin"
                        ? "Remove admin"
                        : "Make admin"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === user.id || user.id === currentUserId}
                    onClick={() => update(user.id, { banned: !user.banned })}
                    className={`rounded-md border px-2.5 py-1.5 text-xs transition disabled:opacity-40 ${
                      user.banned
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                        : "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    }`}
                  >
                    {busyId === user.id ? "…" : user.banned ? "Unban" : "Ban"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">
                No users yet.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
