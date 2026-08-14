import { Separator } from "@/components/ui/separator";

export function SiteHeader() {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        Cash-Flow Forecaster
      </h1>
      <p className="max-w-xl text-sm text-muted-foreground sm:max-w-2xl">
        Shows your <span className="font-medium text-foreground">floor</span> this
        month — the lowest your balance can go from committed income and bills
        alone, assuming no spending beyond that. Not a prediction of real
        spending.
      </p>
      <Separator />
    </header>
  );
}
