import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { ViewTransition } from "react";

export function PageHeader({
  title,
  description,
  icon: Icon,
  backHref,
  backLabel = "Voltar",
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {backHref && (
        <Link
          href={backHref}
          transitionTypes={["nav-back"]}
          className="group mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
          {backLabel}
        </Link>
      )}
      <div className={actions ? "flex flex-wrap items-start justify-between gap-4" : undefined}>
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
          )}
          <ViewTransition name="page-header" enter="auto" default="none">
            <div className="min-w-0 space-y-1">
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[26px]">
                {title}
              </h1>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          </ViewTransition>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}