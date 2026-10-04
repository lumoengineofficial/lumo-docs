import { pageMeta } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = pageMeta({
  title: "Forbidden",
  description: "You do not have access to this page.",
  path: "/403",
});

export default function ForbiddenPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-300">403</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-title">Admins only</h1>
      <p className="mt-4 text-muted">
        Your account does not have the administrator role required to open this page.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/dashboard">Go to dashboard</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Back home
        </ButtonLink>
      </div>
    </div>
  );
}
