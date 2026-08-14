export function formatCurrency(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Accepts an ISO YYYY-MM-DD string, e.g. "2026-03-12" -> "12 March, 2026"
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_NAMES[m - 1]}, ${y}`;
}

// Compact form for chart axis ticks, e.g. "2026-03-12" -> "12 Mar"
export function formatDateShort(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTH_NAMES[m - 1].slice(0, 3)}`;
}

// e.g. "2026-03-12" -> "March 2026"
export function formatMonthYear(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}
