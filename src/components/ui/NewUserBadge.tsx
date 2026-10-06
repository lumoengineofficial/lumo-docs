import { cn } from "@/lib/utils";

export function NewUserBadge({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/user-badge.jpg"
      alt="New user"
      title="New user"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn(
        "inline-block shrink-0 rounded-full bg-white object-cover align-middle ring-1 ring-accent/40",
        className
      )}
    />
  );
}
