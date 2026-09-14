import { cn } from "cn";
import { Input } from "@/components/ui/input";

export function toInputString(value: number, fractionDigits = 2): string {
  return value
    .toLocaleString("pt-BR", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })
    .replace(/\u00a0/g, "");
}

export function MoneyInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-foreground">
        R$
      </span>
      <Input
        {...props}
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="next"
        className="h-11 pl-9 text-base font-medium tabular md:text-[15px]"
      />
    </div>
  );
}

export function SuffixedNumberInput({
  suffix,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { suffix: string }) {
  return (
    <div className={cn("relative", className)}>
      <Input
        {...props}
        inputMode="decimal"
        autoComplete="off"
        enterKeyHint="next"
        className="h-11 pr-12 text-base font-medium tabular md:text-[15px]"
      />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium text-muted-foreground">
        {suffix}
      </span>
    </div>
  );
}