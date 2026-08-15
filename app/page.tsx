import { getDashboardData } from "@/lib/dashboardData";

import { BalanceChart } from "@/components/balance-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BillsBreakdownChart } from "@/components/bills-breakdown-chart";
import { SectionCards } from "@/components/section-cards";
import { formatMonthYear } from "@/lib/format";

export default function ReportsPage() {
  const {
    window,
    occurrences,
    checkpoint,
    currentBalance,
    monthStartBalance,
    trajectory,
    dips,
    leadTimeInsight,
  } = getDashboardData();

  return (
    <>
      <SectionCards
        currentBalance={currentBalance}
        currentBalanceDate={checkpoint?.date ?? null}
        leadTimeInsight={leadTimeInsight}
        occurrenceCount={occurrences.length}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue forecast</CardTitle>
            <CardDescription>{formatMonthYear(window.start)}</CardDescription>
          </CardHeader>
          <CardContent>
            <BalanceChart
              windowStart={window.start}
              monthStartBalance={monthStartBalance}
              currentBalance={currentBalance}
              checkpointDate={checkpoint?.date ?? null}
              trajectory={trajectory}
              dips={dips}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bills breakdown</CardTitle>
            <CardDescription>Biggest bills this month, by amount</CardDescription>
          </CardHeader>
          <CardContent>
            <BillsBreakdownChart occurrences={occurrences} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
