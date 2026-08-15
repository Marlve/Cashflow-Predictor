import { cn } from "@/lib/utils";
import { CalendarCell } from "@/lib/calendarGrid";
import { Occurrence } from "@/lib/occurrences";
import { formatCurrency } from "@/lib/format";

interface MonthCalendarProps {
  cells: CalendarCell[];
  occurrencesByDate: Map<string, Occurrence[]>;
  today: string;
}

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MAX_VISIBLE = 3;

export function MonthCalendar({ cells, occurrencesByDate, today }: MonthCalendarProps) {
  return (
    <div className="grid grid-cols-7 overflow-hidden rounded-lg border">
      {WEEKDAY_LABELS.map((label) => (
        <div
          key={label}
          className="border-b bg-muted/40 px-2 py-1.5 text-[11px] font-medium text-muted-foreground"
        >
          {label}
        </div>
      ))}

      {cells.map((cell) => {
        const dayOccurrences = occurrencesByDate.get(cell.date) ?? [];
        const visible = dayOccurrences.slice(0, MAX_VISIBLE);
        const overflow = dayOccurrences.length - visible.length;
        const isToday = cell.date === today;

        return (
          <div
            key={cell.date}
            className={cn(
              "flex min-h-[92px] flex-col gap-1 border-r border-b p-1.5 last:border-r-0",
              !cell.inMonth && "bg-[repeating-linear-gradient(135deg,transparent,transparent_6px,var(--muted)_6px,var(--muted)_7px)]",
              isToday && "bg-accent"
            )}
          >
            <span
              className={cn(
                "text-xs",
                cell.inMonth ? "text-foreground" : "text-muted-foreground/60",
                isToday && "font-semibold"
              )}
            >
              {cell.day}
            </span>
            <div className="flex flex-col gap-0.5">
              {visible.map((occ, i) => (
                <div
                  key={`${occ.itemId}-${i}`}
                  className={cn(
                    "truncate rounded px-1 py-0.5 text-[10px] leading-tight",
                    occ.kind === "income"
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"
                  )}
                  title={`${occ.name} · ${formatCurrency(occ.amount)}`}
                >
                  {occ.name} · {formatCurrency(occ.amount)}
                </div>
              ))}
              {overflow > 0 && (
                <span className="px-1 text-[10px] text-muted-foreground">+{overflow} more</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
