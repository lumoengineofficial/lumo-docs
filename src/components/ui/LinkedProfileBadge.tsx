import Link from "next/link";
import { ADMIN_LINK_BADGE } from "@/lib/constants";

export function LinkedProfileBadge({ size = 16 }: { size?: number }) {
  return (
    <Link
      href={ADMIN_LINK_BADGE.href}
      title={ADMIN_LINK_BADGE.title}
      aria-label={ADMIN_LINK_BADGE.title}
      className="inline-flex shrink-0 items-center transition hover:scale-110"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ADMIN_LINK_BADGE.src}
        alt={ADMIN_LINK_BADGE.title}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="rounded-full bg-white object-cover ring-1 ring-line"
      />
    </Link>
  );
}
