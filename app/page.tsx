import { addItemAction } from "./actions";
import { getItems, sortItems } from "@/lib/storage";
import { currentMonthWindow, expandAll } from "@/lib/occurrences";
import { STARTING_BALANCE, findLocalMinima, walkBalance } from "@/lib/forecast";

export default function Home() {
  const items = sortItems(getItems(), "date");
  const window = currentMonthWindow();
  const occurrences = expandAll(getItems(), window);
  const trajectory = walkBalance(occurrences, STARTING_BALANCE);
  const dips = findLocalMinima(trajectory, STARTING_BALANCE);

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-8 py-16 px-6">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Add cash-flow item
        </h1>

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
            Balance dips (starting balance {STARTING_BALANCE})
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
