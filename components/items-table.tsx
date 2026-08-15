import { Trash2 } from "lucide-react";

import { removeItemAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KindBadge } from "@/components/kind-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CashFlowItem } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";

interface ItemsTableProps {
  items: CashFlowItem[];
}

export function ItemsTable({ items }: ItemsTableProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No items yet.</p>;
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
          <TableHead className="w-0">
            <span className="sr-only">Remove</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{formatDate(item.startDate)}</TableCell>
            <TableCell>{item.name}</TableCell>
            <TableCell>
              <KindBadge kind={item.kind} />
            </TableCell>
            <TableCell>
              <Badge variant="outline">{item.cycle}</Badge>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatCurrency(item.amount)}
            </TableCell>
            <TableCell>
              <form action={removeItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 />
                  <span className="sr-only">Remove {item.name}</span>
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
