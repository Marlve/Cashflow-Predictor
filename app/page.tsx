import { addItemAction, seedAction, setBalanceAction } from "./actions";
import { getBalanceCheckpoint, getItems, sortItems } from "@/lib/storage";
import { currentMonthWindow, expandAll } from "@/lib/occurrences";
import { STARTING_BALANCE, findLocalMinima, walkBalance } from "@/lib/forecast";

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

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 py-16 px-6">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Add cash-flow item
        </h1>

        {items.length === 0 && (
          <form action={seedAction}>
            <button type="submit" className="rounded border px-4 py-2">
              Load sample data
            </button>
          </form>
        )}

        <form action={addItemAction} className="flex flex-col gap-3">
          <input name="name" placeholder="Name (e.g. Rent)" required className="border rounded px-3 py-2" />
          <input name="amount" type="number" step="0.01" placeholder="Amount" required className="border rounded px-3 py-2" />
          <select name="kind" required className="border rounded px-3 py-2">
            <option value="income">Income</option>
            <option value="bill">Bill</option>
          </select>
          <select name="cycle" required className="border rounded px-3 py-2">
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
          <input name="startDate" type="date" required className="border rounded px-3 py-2" />
          <button type="submit" className="rounded bg-foreground text-background px-4 py-2">
            Add item
          </button>
        </form>

        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
            Stored items (sorted by date)
          </h2>
          {items.length === 0 && (
            <p className="text-zinc-500">No items yet.</p>
          )}
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="border-b py-1">Date</th>
                <th className="border-b py-1">Name</th>
                <th className="border-b py-1">Kind</th>
                <th className="border-b py-1">Cycle</th>
                <th className="border-b py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="py-1">{item.startDate}</td>
                  <td className="py-1">{item.name}</td>
                  <td className="py-1">{item.kind}</td>
                  <td className="py-1">{item.cycle}</td>
                  <td className="py-1">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
            Update balance
          </h2>
          {checkpoint && (
            <p className="text-zinc-500">
              Last checked {checkpoint.date}: {checkpoint.balance}
            </p>
          )}
          <form action={setBalanceAction} className="flex flex-col gap-3">
            <input
              name="balance"
              type="number"
              step="0.01"
              placeholder="Current balance"
              required
              className="border rounded px-3 py-2"
            />
            <button type="submit" className="rounded bg-foreground text-background px-4 py-2">
              Save today&apos;s balance
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
            Occurrences ({window.start} to {window.end})
          </h2>
          {occurrences.length === 0 && (
            <p className="text-zinc-500">No occurrences in this window.</p>
          )}
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="border-b py-1">Date</th>
                <th className="border-b py-1">Name</th>
                <th className="border-b py-1">Kind</th>
                <th className="border-b py-1">Cycle</th>
                <th className="border-b py-1">Amount</th>
                <th className="border-b py-1">Balance</th>
              </tr>
            </thead>
            <tbody>
              {occurrences.map((occ, i) => (
                <tr key={`${occ.itemId}-${occ.date}-${i}`}>
                  <td className="py-1">{occ.date}</td>
                  <td className="py-1">{occ.name}</td>
                  <td className="py-1">{occ.kind}</td>
                  <td className="py-1">{occ.cycle}</td>
                  <td className="py-1">{occ.amount}</td>
                  <td className="py-1">{balanceByDate.get(occ.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
            Balance dips (starting balance {startingBalance})
          </h2>
          {dips.length === 0 && (
            <p className="text-zinc-500">No local minima in this window.</p>
          )}
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="border-b py-1">Date</th>
                <th className="border-b py-1">Balance</th>
              </tr>
            </thead>
            <tbody>
              {dips.map((dip) => (
                <tr key={dip.date}>
                  <td className="py-1">{dip.date}</td>
                  <td className="py-1">{dip.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
