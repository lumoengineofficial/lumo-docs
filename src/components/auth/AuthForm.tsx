"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getBrowserClient, supabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { LumoMark } from "@/components/ui/LumoMark";

interface AuthFormProps {
  mode: "login" | "signup";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState(
    urlError === "banned" ? "This account has been suspended. Contact the Lumo team." : "",
  );
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!supabaseConfigured) {
      setError("Supabase is not configured on this deployment yet.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);
    const client = getBrowserClient();

    try {
      if (isSignup) {
        const cleanHandle = (handle || username)
          .toLowerCase()
          .replace(/[^a-z0-9_]+/g, "")
          .slice(0, 24);

        if (!username.trim()) {
          setError("Pick a display name.");
          setBusy(false);
          return;
        }
        if (!cleanHandle) {
          setError("Handle must contain letters or numbers.");
          setBusy(false);
          return;
        }

        const { data, error: signUpError } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { username: username.trim(), handle: cleanHandle },
            emailRedirectTo: `${window.location.origin}/login`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.session) {
          router.push(next);
          router.refresh();
          return;
        }

        setNotice("Account created. Check your inbox to confirm your email, then log in.");
        return;
      }

      const { error: signInError } = await client.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex flex-col items-center text-center">
        <LumoMark className="h-11 w-11" />
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-title">
          {isSignup ? "Create your publisher account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {isSignup
            ? "Publish assets, track downloads and manage your releases."
            : "Log in to download paid assets and manage your releases."}
        </p>
      </div>

      <form onSubmit={submit} className="panel space-y-4 p-6">
        {isSignup ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label-base" htmlFor="username">
                Display name
              </label>
              <input
                id="username"
                className="input-base"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ada Lovelace"
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label className="label-base" htmlFor="handle">
                Handle
              </label>
              <input
                id="handle"
                className="input-base"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase())}
                placeholder="ada"
                autoComplete="username"
                required
              />
            </div>
          </div>
        ) : null}

        <div>
          <label className="label-base" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.dev"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="label-base" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
            minLength={8}
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}

        {notice ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {notice}
          </p>
        ) : null}

        <Button type="submit" disabled={busy} className="w-full" size="lg">
          {busy ? "Please wait…" : isSignup ? "Create account" : "Log in"}
        </Button>

        <p className="text-center text-sm text-muted">
          {isSignup ? (
            <>
              Already registered?{" "}
              <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-accent-light hover:underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              New to Lumo?{" "}
              <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-accent-light hover:underline">
                Create an account
              </Link>
            </>
          )}
        </p>
      </form>

      <div className="mt-4 rounded-xl border border-line bg-panel/60 px-4 py-3 text-xs leading-relaxed text-muted">
        <span className="font-medium text-mist">Local demo:</span> after running{" "}
        <code className="text-accent-light">npm run seed</code>, use{" "}
        <span className="text-mist">admin@lumo.dev</span> (admin) or{" "}
        <span className="text-mist">publisher@lumo.dev</span> with the password set in{" "}
        <code className="text-accent-light">SEED_PASSWORD</code>.
      </div>
    </div>
  );
}
