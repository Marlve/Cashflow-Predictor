import { getDashboardData } from "@/lib/dashboardData";
import { buildMonthGrid } from "@/lib/calendarGrid";
import { todayISO } from "@/lib/occurrences";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthCalendar } from "@/components/month-calendar";
import { formatMonthYear } from "@/lib/format";

export default async function CalendarPage() {
  const { window, allOccurrences } = await getDashboardData();
  const cells = buildMonthGrid(window);

  const occurrencesByDate = new Map<string, typeof allOccurrences>();
  for (const occ of allOccurrences) {
    const existing = occurrencesByDate.get(occ.date);
    if (existing) {
      existing.push(occ);
    } else {
      occurrencesByDate.set(occ.date, [occ]);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment calendar</CardTitle>
        <CardDescription>
          {formatMonthYear(window.start)} — every income and bill occurrence, by date
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MonthCalendar cells={cells} occurrencesByDate={occurrencesByDate} today={todayISO()} />
      </CardContent>
    </Card>
  );
}
