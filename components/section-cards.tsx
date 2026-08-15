import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadTimeInsight } from "@/lib/forecast";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/format";

interface SectionCardsProps {
  currentBalance: number;
  currentBalanceDate: string | null;
  leadTimeInsight: LeadTimeInsight | null;
  occurrenceCount: number;
}

export function SectionCards({
  currentBalance,
  currentBalanceDate,
  leadTimeInsight,
  occurrenceCount,
}: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>Current balance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {formatCurrency(currentBalance)}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {currentBalanceDate
              ? `As of ${formatDate(currentBalanceDate)}`
              : "No balance checked yet"}
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>When it gets tight</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {leadTimeInsight ? formatCurrency(leadTimeInsight.dip.balance) : "—"}
          </CardTitle>
          <p
            className={cn(
              "text-sm",
              leadTimeInsight?.isUrgent ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {leadTimeInsight
              ? leadTimeInsight.daysUntil === 0
                ? `Today, ${formatDate(leadTimeInsight.dip.date)}`
                : `${leadTimeInsight.daysUntil} day${leadTimeInsight.daysUntil === 1 ? "" : "s"} from now, on ${formatDate(leadTimeInsight.dip.date)}`
              : "No dips — balance holds all month"}
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Activity remaining</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {occurrenceCount}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Income + bills left this month
          </p>
        </CardHeader>
      </Card>
    </div>
  );
}
