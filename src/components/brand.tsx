import { cn } from "cn";

const gradientId = "canagest-logo-gradient";

export function Logo({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14532d" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${gradientId})`} />
      <path
        d="M25 41V15"
        stroke="rgba(255,255,255,0.92)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M25 37C25 37 14.5 33 12.5 21.5C17 20 22 23.5 25 29.5Z"
        fill="rgba(255,255,255,0.9)"
      />
      <path
        d="M25 37C25 37 35.5 33 37.5 21.5C33 20 28 23.5 25 29.5Z"
        fill="rgba(255,255,255,0.72)"
      />
      <path
        d="M25 29C25 29 17.5 25 16.5 17.5C20.5 17 24 20 25 24Z"
        fill="rgba(255,255,255,0.95)"
      />
      <path
        d="M25 29C25 29 33.5 25 34.5 17.5C30.5 17 27 20 25 24Z"
        fill="rgba(255,255,255,0.8)"
      />
    </svg>
  );
}

export function Brand({
  size = 32,
  className,
  compact = false,
}: {
  size?: number;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo size={size} />
      {!compact && (
        <div className="leading-none">
          <span className="block font-heading text-[15px] font-semibold tracking-tight text-foreground">
            Cana<span className="text-primary">Gest</span>
          </span>
          <span className="mt-0.5 block text-[10px] font-medium tracking-wide text-muted-foreground">
            Gestão de cana-de-açúcar
          </span>
        </div>
      )}
    </div>
  );
}