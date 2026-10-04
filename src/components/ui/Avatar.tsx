import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-7 w-7 rounded-md text-[11px]",
  md: "h-10 w-10 rounded-lg text-sm",
  lg: "h-24 w-24 rounded-2xl text-3xl",
} as const;

export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const initial = (name ?? "").trim().slice(0, 1).toUpperCase() || "?";

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ?? "avatar"}
        loading="lazy"
        className={cn("shrink-0 object-cover", SIZES[size], className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "accent-gradient flex shrink-0 items-center justify-center font-bold text-title",
        SIZES[size],
        className,
      )}
    >
      {initial}
    </span>
  );
}
