import { addItemAction } from "./actions";
import { getItems, sortItems } from "@/lib/storage";

export default function Home() {
  const items = sortItems(getItems(), "date");

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
            <option value="once">Once</option>
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
      </main>
    </div>
  );
}
