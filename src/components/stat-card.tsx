import { Card, CardContent } from "@/components/ui/card";
import { cn } from "cn";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "positive" | "negative" | "neutral";
  className?: string;
}) {
  return (
    <Card className={cn("gap-0", className)}>
      <CardContent className="flex items-center gap-4 px-4 py-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            tone === "positive" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
            tone === "negative" && "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
            tone === "neutral" && "bg-neutral-200/70 text-neutral-600 dark:bg-neutral-500/15 dark:text-neutral-300",
            (tone === "default") && "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
          <p className="tabular mt-0.5 truncate font-heading text-lg font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}