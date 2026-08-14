import { getBalanceCheckpoint, getItems, sortItems } from "@/lib/storage";
import { currentMonthWindow, expandAll } from "@/lib/occurrences";
import { STARTING_BALANCE, findLocalMinima, walkBalance } from "@/lib/forecast";
import { resetSampleDataAction } from "./actions";

import { AddItemForm } from "@/components/add-item-form";
import { BalanceChart } from "@/components/balance-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BillsBreakdownChart } from "@/components/bills-breakdown-chart";
import { ItemsTable } from "@/components/items-table";
import { OccurrencesTable } from "@/components/occurrences-table";
import { SectionCards } from "@/components/section-cards";
import { SetBalanceForm } from "@/components/set-balance-form";
import { SiteHeader } from "@/components/site-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/format";

export default function Home() {
  const items = sortItems(getItems(), "date");
  const window = currentMonthWindow();
  const allOccurrences = expandAll(getItems(), window);

  const checkpoint = getBalanceCheckpoint();
  const startingBalance = checkpoint ? checkpoint.balance : STARTING_BALANCE;
  // Charges up to and including the checkpoint date are already reflected in
  // the checked balance, so the walk only needs what's still ahead.
  const occurrences = checkpoint
    ? allOccurrences.filter((occ) => occ.date > checkpoint.date)
    : allOccurrences;

  const trajectory = walkBalance(occurrences, startingBalance);
  const dips = findLocalMinima(trajectory, startingBalance);
  const balanceByDate = new Map(trajectory.map((point) => [point.date, point.balance]));
  const lowestDip = dips.reduce<typeof dips[number] | null>(
    (lowest, dip) => (!lowest || dip.balance < lowest.balance ? dip : lowest),
    null
  );

  return (
    <div className="flex flex-col flex-1 items-center bg-background font-sans">
      <main className="flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-12 lg:py-16">
        <SiteHeader />

        <form action={resetSampleDataAction}>
          <Button type="submit" variant="outline">
            Reset to sample data
          </Button>
        </form>

        <SectionCards
          currentBalance={startingBalance}
          currentBalanceDate={checkpoint?.date ?? null}
          lowestDip={lowestDip}
          occurrenceCount={occurrences.length}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>This month</CardTitle>
              <CardDescription>{formatMonthYear(window.start)}</CardDescription>
            </CardHeader>
            <CardContent>
              <BalanceChart
                windowStart={window.start}
                startingBalance={startingBalance}
                checkpointDate={checkpoint?.date ?? null}
                trajectory={trajectory}
                dips={dips}
              />
              {dips.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dip date</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dips.map((dip) => (
                      <TableRow key={dip.date}>
                        <TableCell>{formatDate(dip.date)}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(dip.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AddItemForm />
          <SetBalanceForm checkpoint={checkpoint} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Stored items (sorted by date)</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemsTable items={items} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming activity</CardTitle>
            <CardDescription>{formatMonthYear(window.start)}</CardDescription>
          </CardHeader>
          <CardContent>
            <OccurrencesTable occurrences={occurrences} balanceByDate={balanceByDate} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
