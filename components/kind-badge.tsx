import { Badge } from "@/components/ui/badge";
import { ItemKind } from "@/lib/types";

interface KindBadgeProps {
  kind: ItemKind;
}

export function KindBadge({ kind }: KindBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={
        kind === "income"
          ? "border-transparent bg-primary/10 text-primary"
          : "border-transparent bg-destructive/10 text-destructive"
      }
    >
      {kind}
    </Badge>
  );
}
