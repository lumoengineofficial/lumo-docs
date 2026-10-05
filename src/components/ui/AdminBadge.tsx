import { cn } from "@/lib/utils";

export function AdminBadge({
  size = 16,
  className,
  label = "Admin",
}: {
  size?: number;
  className?: string;
  label?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/admin-badge.png"
      alt={label}
      title={label}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={cn("inline-block shrink-0 object-contain align-middle", className)}
    />
  );
}
