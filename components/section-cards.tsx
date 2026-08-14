import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BalancePoint } from "@/lib/forecast";
import { formatCurrency, formatDate } from "@/lib/format";

interface SectionCardsProps {
  currentBalance: number;
  currentBalanceDate: string | null;
  lowestDip: BalancePoint | null;
  occurrenceCount: number;
}

export function SectionCards({
  currentBalance,
  currentBalanceDate,
  lowestDip,
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
              : "No balance checked yet — using default"}
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Lowest projected balance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            {lowestDip ? formatCurrency(lowestDip.balance) : "—"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {lowestDip
              ? `On ${formatDate(lowestDip.date)}`
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
