import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = pageMeta({
  title: "Sign up",
  description:
    "Create a free Lumo Asset Store account to publish assets, track downloads and unlock paid downloads.",
  path: "/signup",
});

export default function SignupPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 surface-grid opacity-40" />
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-accent-light/20 blur-[110px]" />

      <div className="relative mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-xl bg-panel" />}>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
    </div>
  );
}
