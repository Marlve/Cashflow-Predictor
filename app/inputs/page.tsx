import { getDashboardData } from "@/lib/dashboardData";
import { resetSampleDataAction, resetToZeroAction } from "../actions";

import { AddItemForm } from "@/components/add-item-form";
import { Button } from "@/components/ui/button";
import { SetBalanceForm } from "@/components/set-balance-form";

export default function InputsPage() {
  const { checkpoint } = getDashboardData();

  return (
    <>
      <div className="flex gap-2">
        <form action={resetSampleDataAction}>
          <Button type="submit" variant="outline">
            Reset to sample data
          </Button>
        </form>
        <form action={resetToZeroAction}>
          <Button type="submit" variant="outline">
            Reset to 0
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AddItemForm />
        <SetBalanceForm checkpoint={checkpoint} />
      </div>
    </>
  );
}
