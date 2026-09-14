export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto flex max-w-sm flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center ${className ?? ""}`}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-6" />
      </div>
      <h3 className="font-heading text-base font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}