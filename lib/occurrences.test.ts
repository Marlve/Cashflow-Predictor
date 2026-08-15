import { describe, expect, it } from "vitest";
import { expandAll, expandItem, ForecastWindow } from "./occurrences";
import { CashFlowItem } from "./types";

function item(overrides: Partial<CashFlowItem>): CashFlowItem {
  return {
    id: "test-item",
    name: "Test item",
    amount: 100,
    cycle: "monthly",
    startDate: "2024-01-01",
    kind: "bill",
    ...overrides,
  };
}

describe("monthly items landing on a day that doesn't exist every month", () => {
  it("clamps the 31st to the last day of a 30-day month", () => {
    const window: ForecastWindow = { start: "2026-04-01", end: "2026-04-30" };
    const rent = item({ cycle: "monthly", startDate: "2024-01-31" });

    const occurrences = expandItem(rent, window);

    expect(occurrences).toHaveLength(1);
    expect(occurrences[0].date).toBe("2026-04-30");
  });

  it("clamps the 31st to Feb 28 in a non-leap year", () => {
    const window: ForecastWindow = { start: "2026-02-01", end: "2026-02-28" };
    const rent = item({ cycle: "monthly", startDate: "2024-01-31" });

    const occurrences = expandItem(rent, window);

    expect(occurrences).toHaveLength(1);
    expect(occurrences[0].date).toBe("2026-02-28");
  });

  it("clamps the 31st to Feb 29 in a leap year", () => {
    const window: ForecastWindow = { start: "2028-02-01", end: "2028-02-29" };
    const rent = item({ cycle: "monthly", startDate: "2024-01-31" });

    const occurrences = expandItem(rent, window);

    expect(occurrences).toHaveLength(1);
    expect(occurrences[0].date).toBe("2028-02-29");
  });

  it("does not leak a past month's occurrence when the item started long ago", () => {
    const window: ForecastWindow = { start: "2026-08-01", end: "2026-08-31" };
    const rent = item({ cycle: "monthly", startDate: "2020-01-31" });

    const occurrences = expandItem(rent, window);

    expect(occurrences).toHaveLength(1);
    expect(occurrences[0].date).toBe("2026-08-31");
  });
});

describe("weekly items anchored to a weekday", () => {
  it("keeps every occurrence on the same weekday as the start date", () => {
    // 2026-08-03 is a Monday.
    const window: ForecastWindow = { start: "2026-08-01", end: "2026-08-31" };
    const freelance = item({ cycle: "weekly", startDate: "2026-08-03", kind: "income" });

    const occurrences = expandItem(freelance, window);
    const weekdays = new Set(
      occurrences.map((occ) => new Date(occ.date + "T00:00:00Z").getUTCDay())
    );

    expect(occurrences.length).toBeGreaterThanOrEqual(4);
    expect(weekdays.size).toBe(1);
    expect([...weekdays][0]).toBe(1); // Monday
  });

  it("anchors to the original start date even when it started years earlier", () => {
    // 2024-01-01 is a Monday - occurrences should still land on Mondays.
    const window: ForecastWindow = { start: "2026-08-01", end: "2026-08-31" };
    const groceries = item({ cycle: "weekly", startDate: "2024-01-01" });

    const occurrences = expandItem(groceries, window);

    for (const occ of occurrences) {
      expect(new Date(occ.date + "T00:00:00Z").getUTCDay()).toBe(1);
    }
  });
});

describe("annual items falling in or out of the window", () => {
  it("includes the occurrence when its month/day falls inside the window", () => {
    const window: ForecastWindow = { start: "2026-08-01", end: "2026-08-31" };
    const renewal = item({ cycle: "annual", startDate: "2022-08-20" });

    const occurrences = expandItem(renewal, window);

    expect(occurrences).toHaveLength(1);
    expect(occurrences[0].date).toBe("2026-08-20");
  });

  it("produces no occurrence when its month/day falls outside the window", () => {
    const window: ForecastWindow = { start: "2026-08-01", end: "2026-08-31" };
    const renewal = item({ cycle: "annual", startDate: "2022-12-20" });

    const occurrences = expandItem(renewal, window);

    expect(occurrences).toHaveLength(0);
  });

  it("clamps a Feb 29 anniversary to Feb 28 in a non-leap year", () => {
    const window: ForecastWindow = { start: "2026-02-01", end: "2026-02-28" };
    const renewal = item({ cycle: "annual", startDate: "2020-02-29" });

    const occurrences = expandItem(renewal, window);

    expect(occurrences).toHaveLength(1);
    expect(occurrences[0].date).toBe("2026-02-28");
  });
});

describe("items starting partway through the window", () => {
  it("produces no occurrence before a monthly item's start date", () => {
    const window: ForecastWindow = { start: "2026-08-01", end: "2026-08-31" };
    const newSubscription = item({ cycle: "monthly", startDate: "2026-08-15" });

    const occurrences = expandItem(newSubscription, window);

    expect(occurrences).toHaveLength(1);
    expect(occurrences[0].date).toBe("2026-08-15");
  });

  it("produces no occurrence for a weekly item starting after the window ends", () => {
    const window: ForecastWindow = { start: "2026-08-01", end: "2026-08-31" };
    const future = item({ cycle: "weekly", startDate: "2026-09-07" });

    const occurrences = expandItem(future, window);

    expect(occurrences).toHaveLength(0);
  });
});

describe("window-boundary behavior", () => {
  it("includes an occurrence that lands exactly on window.start", () => {
    const window: ForecastWindow = { start: "2026-08-01", end: "2026-08-31" };
    const rent = item({ cycle: "monthly", startDate: "2024-01-01" });

    const occurrences = expandItem(rent, window);

    expect(occurrences).toContainEqual(expect.objectContaining({ date: "2026-08-01" }));
  });

  it("includes an occurrence that lands exactly on window.end", () => {
    const window: ForecastWindow = { start: "2026-08-01", end: "2026-08-31" };
    const rent = item({ cycle: "monthly", startDate: "2024-01-31" });

    const occurrences = expandItem(rent, window);

    expect(occurrences).toContainEqual(expect.objectContaining({ date: "2026-08-31" }));
  });

  it("excludes an occurrence one day after window.end", () => {
    // Weekly item that would next fire the day after the window closes.
    const window: ForecastWindow = { start: "2026-08-01", end: "2026-08-30" };
    const weeklyOnAug31 = item({ cycle: "weekly", startDate: "2026-08-31" });

    const occurrences = expandItem(weeklyOnAug31, window);

    expect(occurrences).toHaveLength(0);
  });
});

describe("expandAll", () => {
  it("merges and sorts occurrences from multiple items chronologically", () => {
    const window: ForecastWindow = { start: "2026-08-01", end: "2026-08-31" };
    const items: CashFlowItem[] = [
      item({ id: "rent", cycle: "monthly", startDate: "2024-01-01", amount: 1400 }),
      item({ id: "salary", cycle: "monthly", startDate: "2024-01-15", amount: 3200, kind: "income" }),
      item({ id: "groceries", cycle: "weekly", startDate: "2024-01-04", amount: 50 }),
    ];

    const occurrences = expandAll(items, window);
    const dates = occurrences.map((occ) => occ.date);

    expect(dates).toEqual([...dates].sort());
    expect(occurrences.length).toBeGreaterThan(items.length);
  });
});
