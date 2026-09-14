"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  PlusIcon,
  SproutIcon,
  TreesIcon,
  LandPlotIcon,
} from "lucide-react";

import { cn } from "cn";
import { Brand, Logo } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { InstallAppButton } from "@/components/install-app-button";

const mainNav = [
  { href: "/", label: "Início", icon: LayoutDashboardIcon, match: (p: string) => p === "/" },
  { href: "/fazendas", label: "Fazendas", icon: TreesIcon, match: (p: string) => p.startsWith("/fazendas") },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {mainNav.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Ambient background for desktop */}
      <div className="pointer-events-none fixed inset-0 -z-10 hidden bg-hero-glow bg-hero-glow-cane md:block" />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar/80 px-4 py-6 backdrop-blur-xl md:flex">
        <Link href="/" className="px-2" aria-label="CanaGest – Início">
          <Brand size={34} />
        </Link>

        <div className="mt-8 flex-1 space-y-6">
          <div>
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Navegação
            </p>
            <SidebarNav />
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          <Link
            href="/colheitas/nova"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <PlusIcon className="size-4" />
            Nova colheita
          </Link>
          <InstallAppButton />
          <p className="px-2 pt-0.5 text-[11px] text-muted-foreground">
            Seus dados ficam salvos na nuvem.
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header
        className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/70 bg-background/85 px-4 backdrop-blur-xl md:hidden"
      >
        <Link href="/" aria-label="CanaGest – Início">
          <Brand size={30} />
        </Link>
        <div className="flex items-center gap-1">
          <InstallAppButton compact />
          <ThemeToggle />
        </div>
      </header>

      {/* Main */}
      <div className="md:pl-64">
        <div className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:px-6 md:pt-10 md:pb-16">
          {children}
        </div>
      </div>

      {/* Desktop header (right zone) */}
      <header
        className="fixed top-0 right-0 z-40 hidden h-14 items-center justify-between border-b border-border/70 bg-background/70 px-6 backdrop-blur-xl md:flex md:left-64"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SproutIcon className="size-4 text-primary/70" />
          <span className="font-medium">Painel de safra</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-3 items-center rounded-2xl border border-border/80 bg-popover/95 px-2 py-2 shadow-lg shadow-black/5 backdrop-blur-xl">
          <NavItem href="/" label="Início" icon={LayoutDashboardIcon} active={pathname === "/"} />
          <div className="relative flex justify-center">
            <Link
              href="/colheitas/nova"
              aria-label="Nova colheita"
              className="-mt-8 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95"
            >
              <PlusIcon className="size-6" />
            </Link>
          </div>
          <NavItem
            href="/fazendas"
            label="Fazendas"
            icon={LandPlotIcon}
            active={pathname.startsWith("/fazendas")}
          />
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboardIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
      {label}
    </Link>
  );
}

export function SidebarLogoCompact() {
  return <Logo size={34} />;
}