import { STATUS_LABELS } from "@/lib/constants";
import type { AssetStatus } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export function StatusBadge({ status }: { status: AssetStatus | string }) {
  const tone =
    status === "approved"
      ? "success"
      : status === "pending"
        ? "warning"
        : status === "rejected"
          ? "danger"
          : "default";
  return <Badge tone={tone as "success"}>{STATUS_LABELS[status] ?? status}</Badge>;
}
