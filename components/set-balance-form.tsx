import { setBalanceAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BalanceCheckpoint } from "@/lib/types";
import { todayISO } from "@/lib/occurrences";
import { formatDate } from "@/lib/format";

interface SetBalanceFormProps {
  checkpoint: BalanceCheckpoint | null;
}

export function SetBalanceForm({ checkpoint }: SetBalanceFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Update balance</CardTitle>
        {checkpoint && (
          <p className="text-sm text-muted-foreground">
            Last checked {formatDate(checkpoint.date)}: {checkpoint.balance}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <form action={setBalanceAction} className="flex flex-1 flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="balance">Current balance</Label>
              <Input id="balance" name="balance" type="number" required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">As of</Label>
              <Input id="date" name="date" type="date" defaultValue={todayISO()} required />
            </div>
          </div>

          <Button type="submit" className="mt-auto">
            Save balance
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
