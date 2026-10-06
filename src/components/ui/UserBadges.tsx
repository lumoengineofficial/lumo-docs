import { BADGES, badgesFor } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function UserBadges({
  badges,
  role,
  size = 16,
  className,
}: {
  badges?: string[] | null;
  role?: string | null;
  size?: number;
  className?: string;
}) {
  const keys = badgesFor({ badges, role });
  if (keys.length === 0) return null;

  return (
    <>
      {keys.map((key) => {
        const badge = BADGES[key];
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={key}
            src={badge.src}
            alt={badge.label}
            title={badge.label}
            width={size}
            height={size}
            style={{ width: size, height: size }}
            className={cn(
              "inline-block shrink-0 align-middle",
              "chip" in badge && badge.chip
                ? "rounded-full bg-white object-cover ring-1 ring-accent/40"
                : "object-contain",
              className
            )}
          />
        );
      })}
    </>
  );
}
