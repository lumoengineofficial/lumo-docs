import Link from "next/link";
import { VERIFIED_LINK_BADGE } from "@/lib/constants";

export function LinkedProfileBadge({ size = 34 }: { size?: number }) {
  return (
    <Link
      href={VERIFIED_LINK_BADGE.href}
      title={VERIFIED_LINK_BADGE.title}
      aria-label={VERIFIED_LINK_BADGE.title}
      className="inline-flex shrink-0 items-center transition hover:scale-110"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={VERIFIED_LINK_BADGE.src}
        alt={VERIFIED_LINK_BADGE.title}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="rounded-full object-cover ring-2 ring-accent/50"
      />
    </Link>
  );
}
