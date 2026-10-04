import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = pageMeta({
  title: "Page not found",
  description: "The page you were looking for does not exist.",
  path: "/404",
});

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-light">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-title sm:text-4xl">
        This asset slipped out of the scene graph
      </h1>
      <p className="mt-4 text-muted">
        The page you are looking for was moved, deleted, or never existed.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/store">Browse the store</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Back home
        </ButtonLink>
      </div>
      <p className="mt-8 text-sm text-muted">
        Looking for engine docs?{" "}
        <Link href="/docs" className="text-accent-light hover:underline">
          Read the getting started guide
        </Link>
        .
      </p>
    </div>
  );
}
