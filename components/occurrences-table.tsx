import { Badge } from "@/components/ui/badge";
import { KindBadge } from "@/components/kind-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Occurrence } from "@/lib/occurrences";
import { formatCurrency, formatDate } from "@/lib/format";

interface OccurrencesTableProps {
  occurrences: Occurrence[];
  balanceByDate: Map<string, number>;
}

export function OccurrencesTable({ occurrences, balanceByDate }: OccurrencesTableProps) {
  if (occurrences.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity in this window.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Kind</TableHead>
          <TableHead>Cycle</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {occurrences.map((occ, i) => (
          <TableRow key={`${occ.itemId}-${occ.date}-${i}`}>
            <TableCell>{formatDate(occ.date)}</TableCell>
            <TableCell>{occ.name}</TableCell>
            <TableCell>
              <KindBadge kind={occ.kind} />
            </TableCell>
            <TableCell>
              <Badge variant="outline">{occ.cycle}</Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatCurrency(occ.amount)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatCurrency(balanceByDate.get(occ.date) ?? 0)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
