"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/constants";
import { getBrowserClient, supabaseConfigured } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { AdminBadge } from "@/components/ui/AdminBadge";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LumoMark } from "@/components/ui/LumoMark";

interface SessionUser {
  profile: Profile | null;
}

function initials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function AuthArea({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    const client = getBrowserClient();
    (async () => {
      const { data } = await client.auth.getSession();
      const user = data.session?.user;
      if (user && active) {
        const { data: profile } = await client
          .from("users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (active) setSession({ profile: (profile as unknown as Profile) ?? null });
      }
      if (active) setLoading(false);
    })();
    const { data: sub } = client.auth.onAuthStateChange(() => {
      if (!window.location.pathname.startsWith("/dashboard") && !window.location.pathname.startsWith("/admin")) {
        router.refresh();
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function signOut() {
    if (supabaseConfigured) await getBrowserClient().auth.signOut();
    setSession(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return <div className={cn("h-9 w-24 animate-pulse rounded-lg bg-panel2", mobile && "w-full")} />;
  }

  if (!session?.profile) {
    return (
      <div className={cn("flex items-center gap-2", mobile && "w-full flex-col")}>
        <ButtonLink href="/login" variant="ghost" size="sm" className={cn(mobile && "w-full")}>
          Log in
        </ButtonLink>
        <ButtonLink href="/signup" variant="primary" size="sm" className={cn(mobile && "w-full")}>
          Sign up
        </ButtonLink>
      </div>
    );
  }

  const profile = session.profile;
  const isAdmin = profile.role === "admin";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-line bg-panel2 py-1.5 pl-1.5 pr-3 text-sm transition hover:border-accent/50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="accent-gradient flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-title">
            {initials(profile.username || profile.handle || "U")}
          </span>
        )}
        <span className="flex max-w-[110px] items-center gap-1.5 truncate font-medium text-mist">
          {profile.username || profile.handle}
          {isAdmin ? <AdminBadge size={15} /> : null}
        </span>
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-panel shadow-card">
            <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
              <p className="truncate text-sm font-medium text-title">{profile.username}</p>
              {isAdmin ? <AdminBadge size={15} /> : null}
            </div>
            <p className="truncate px-4 pb-3 text-xs text-muted">@{profile.handle}</p>
            <div className="p-1.5">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-mist transition hover:bg-panel2 hover:text-title"
              >
                Publisher dashboard
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-mist transition hover:bg-panel2 hover:text-title"
                >
                  Admin panel
                </Link>
              ) : null}
              <Link
                href={`/author/${profile.handle}`}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-mist transition hover:bg-panel2 hover:text-title"
              >
                My public profile
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="block w-full rounded-md px-3 py-2 text-left text-sm text-red-300 transition hover:bg-red-500/10"
              >
                Log out
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <LumoMark className="h-8 w-8 transition group-hover:scale-105" />
          <span className="flex flex-col leading-tight">
            <span className="text-[15px] font-bold tracking-tight text-title">Lumo</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent-light">
              Asset Store
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  active ? "bg-panel2 text-title" : "text-muted hover:text-title",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/dashboard" variant="ghost" size="sm">
            Publish
          </ButtonLink>
          <ThemeToggle />
          <AuthArea />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-panel text-mist md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={cn(
                "absolute left-0 h-0.5 w-full bg-current transition",
                menuOpen ? "top-1.5 rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-1.5 h-0.5 w-full bg-current transition",
                menuOpen ? "opacity-0" : "opacity-100",
              )}
            />
            <span
              className={cn(
                "absolute left-0 h-0.5 w-full bg-current transition",
                menuOpen ? "top-1.5 -rotate-45" : "top-3",
              )}
            />
          </span>
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-line bg-panel px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-mist transition hover:bg-panel2 hover:text-title"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-mist transition hover:bg-panel2 hover:text-title"
            >
              Publisher dashboard
            </Link>
          </nav>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
            <AuthArea mobile />
            <ThemeToggle />
          </div>
        </div>
      ) : null}
    </header>
  );
}
