import { getDashboardData } from "@/lib/dashboardData";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OccurrencesTable } from "@/components/occurrences-table";
import { formatCurrency, formatMonthYear } from "@/lib/format";

export default function ListPage() {
  const { window, occurrences, balanceByDate } = getDashboardData();

  const totalIncome = occurrences
    .filter((occ) => occ.kind === "income")
    .reduce((sum, occ) => sum + occ.amount, 0);
  const totalBills = occurrences
    .filter((occ) => occ.kind === "bill")
    .reduce((sum, occ) => sum + occ.amount, 0);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Income remaining</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {formatCurrency(totalIncome)}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Income not yet received this month</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Bills remaining</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {formatCurrency(totalBills)}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Bills not yet paid this month</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Net remaining</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              {formatCurrency(totalIncome - totalBills)}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Remaining income minus remaining bills</p>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming activity</CardTitle>
          <CardDescription>{formatMonthYear(window.start)}</CardDescription>
        </CardHeader>
        <CardContent>
          <OccurrencesTable occurrences={occurrences} balanceByDate={balanceByDate} />
        </CardContent>
      </Card>
    </>
  );
}
