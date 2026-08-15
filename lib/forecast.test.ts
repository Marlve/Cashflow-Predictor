import { describe, expect, it } from "vitest";
import {
  LEAD_TIME_DAYS,
  anchorStartingBalance,
  findLocalMinima,
  getLeadTimeInsight,
  walkBalance,
} from "./forecast";
import { Occurrence } from "./occurrences";

function occ(overrides: Partial<Occurrence>): Occurrence {
  return {
    date: "2026-08-01",
    amount: 100,
    name: "Test",
    cycle: "monthly",
    kind: "bill",
    itemId: "test-item",
    ...overrides,
  };
}

describe("walkBalance", () => {
  it("nets multiple occurrences on the same date into one point", () => {
    const occurrences: Occurrence[] = [
      occ({ date: "2026-08-01", amount: 1000, kind: "income" }),
      occ({ date: "2026-08-01", amount: 400, kind: "bill" }),
    ];

    const trajectory = walkBalance(occurrences, 0);

    expect(trajectory).toEqual([{ date: "2026-08-01", balance: 600 }]);
  });

  it("carries the running balance forward across dates", () => {
    const occurrences: Occurrence[] = [
      occ({ date: "2026-08-01", amount: 500, kind: "income" }),
      occ({ date: "2026-08-05", amount: 200, kind: "bill" }),
    ];

    const trajectory = walkBalance(occurrences, 1000);

    expect(trajectory).toEqual([
      { date: "2026-08-01", balance: 1500 },
      { date: "2026-08-05", balance: 1300 },
    ]);
  });
});

describe("findLocalMinima", () => {
  it("finds a single dip that recovers", () => {
    const trajectory = [
      { date: "2026-08-05", balance: 800 },
      { date: "2026-08-10", balance: 200 },
      { date: "2026-08-15", balance: 900 },
    ];

    const minima = findLocalMinima(trajectory, 1000);

    expect(minima).toEqual([{ date: "2026-08-10", balance: 200 }]);
  });

  it("finds every dip, not just the lowest, across multiple dips in a month", () => {
    const trajectory = [
      { date: "2026-08-05", balance: 700 }, // dip 1
      { date: "2026-08-10", balance: 1200 },
      { date: "2026-08-15", balance: 300 }, // dip 2, lower than dip 1
      { date: "2026-08-20", balance: 1500 },
    ];

    const minima = findLocalMinima(trajectory, 1000);

    expect(minima.map((m) => m.date)).toEqual(["2026-08-05", "2026-08-15"]);
  });

  it("treats a still-falling trajectory's last point as a dip", () => {
    const trajectory = [
      { date: "2026-08-05", balance: 800 },
      { date: "2026-08-31", balance: 100 },
    ];

    const minima = findLocalMinima(trajectory, 1000);

    expect(minima).toEqual([{ date: "2026-08-31", balance: 100 }]);
  });

  it("reports no dips when the balance only ever rises", () => {
    const trajectory = [
      { date: "2026-08-05", balance: 1100 },
      { date: "2026-08-15", balance: 1400 },
    ];

    const minima = findLocalMinima(trajectory, 1000);

    expect(minima).toEqual([]);
  });
});

describe("anchorStartingBalance", () => {
  it("solves for a month-start balance that replays exactly to the checkpoint", () => {
    const occurrences: Occurrence[] = [
      occ({ date: "2026-08-01", amount: 1400, kind: "bill" }),
      occ({ date: "2026-08-10", amount: 3200, kind: "income" }),
      occ({ date: "2026-08-20", amount: 500, kind: "bill" }), // after checkpoint, ignored
    ];
    const checkpoint = { date: "2026-08-15", balance: 5000 };

    const anchor = anchorStartingBalance(occurrences, checkpoint);
    const replay = walkBalance(
      occurrences.filter((o) => o.date <= checkpoint.date),
      anchor
    );

    expect(replay.at(-1)?.balance).toBe(checkpoint.balance);
  });

  it("ignores occurrences after the checkpoint date", () => {
    const before = occ({ date: "2026-08-05", amount: 200, kind: "income" });
    const after = occ({ date: "2026-08-25", amount: 9999, kind: "bill" });
    const checkpoint = { date: "2026-08-15", balance: 1000 };

    const anchorWithAfter = anchorStartingBalance([before, after], checkpoint);
    const anchorWithoutAfter = anchorStartingBalance([before], checkpoint);

    expect(anchorWithAfter).toBe(anchorWithoutAfter);
  });
});

describe("getLeadTimeInsight", () => {
  const today = "2026-08-15";

  it("returns null when there are no dips", () => {
    expect(getLeadTimeInsight([], today)).toBeNull();
  });

  it("ignores dips that already happened, even if they're the lowest of the month", () => {
    const dips = [
      { date: "2026-08-05", balance: -500 }, // already passed, worse balance
      { date: "2026-08-20", balance: 300 }, // still upcoming
    ];

    const insight = getLeadTimeInsight(dips, today);

    expect(insight?.dip.date).toBe("2026-08-20");
  });

  it("picks the worst upcoming dip when several are still ahead", () => {
    const dips = [
      { date: "2026-08-18", balance: 400 },
      { date: "2026-08-24", balance: 50 },
      { date: "2026-08-28", balance: 900 },
    ];

    const insight = getLeadTimeInsight(dips, today);

    expect(insight?.dip.date).toBe("2026-08-24");
  });

  it("flags urgent when the dip is within the lead-time threshold", () => {
    const dips = [{ date: "2026-08-17", balance: 100 }]; // 2 days out

    const insight = getLeadTimeInsight(dips, today);

    expect(insight?.daysUntil).toBe(2);
    expect(insight?.isUrgent).toBe(true);
  });

  it("does not flag urgent when the dip is beyond the lead-time threshold", () => {
    const dips = [{ date: "2026-08-28", balance: 100 }]; // well beyond LEAD_TIME_DAYS

    const insight = getLeadTimeInsight(dips, today);

    expect(insight!.daysUntil).toBeGreaterThan(LEAD_TIME_DAYS);
    expect(insight?.isUrgent).toBe(false);
  });

  it("treats a dip today as zero days out and urgent", () => {
    const dips = [{ date: today, balance: 100 }];

    const insight = getLeadTimeInsight(dips, today);

    expect(insight?.daysUntil).toBe(0);
    expect(insight?.isUrgent).toBe(true);
  });
});
