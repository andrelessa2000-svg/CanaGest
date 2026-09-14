import Link from "next/link";
import type { Metadata } from "next";
import {
  ChevronRightIcon,
  LandPlotIcon,
  PlusIcon,
  SproutIcon,
  TreesIcon,
  TruckIcon,
  WalletIcon,
} from "lucide-react";

import { getFazendaSummaries } from "@/lib/queries";
import { formatCurrency, formatNumber } from "@/lib/format";
import { formatTarefas, haToTarefas } from "@/lib/area";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Fazendas | CanaGest",
  description: "Gerencie suas fazendas.",
};

export const dynamic = "force-dynamic";

export default async function FazendasPage() {
  const fazendas = await getFazendaSummaries();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fazendas"
        description="Suas propriedades e o resumo de cada uma."
        icon={LandPlotIcon}
        actions={
          <Button asChild className="h-9">
            <Link href="/fazendas/nova">
              <PlusIcon className="size-4" />
              Nova fazenda
            </Link>
          </Button>
        }
      />

      {fazendas.length === 0 ? (
        <EmptyState
          icon={SproutIcon}
          title="Nenhuma fazenda cadastrada"
          description="Cadastre sua primeira fazenda para começar a organizar os talhões e colheitas."
          action={
            <Button asChild>
              <Link href="/fazendas/nova">
                <PlusIcon className="size-4" />
                Nova fazenda
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {fazendas.map((f) => (
            <li key={f.id}>
              <Link
                href={`/fazendas/${f.id}`}
                transitionTypes={["nav-forward"]}
                className="group flex w-full flex-col rounded-2xl border border-border/80 bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <TreesIcon className="size-[22px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-foreground">{f.nome}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <LandPlotIcon className="size-3.5" />
                      {f.talhaoCount} {f.talhaoCount === 1 ? "talhão" : "talhões"} ·{" "}
                      {formatNumber(f.areaTotal, 1)} ha
                      {f.areaTotal > 0 && (
                        <span> · {formatTarefas(haToTarefas(f.areaTotal))} tarefas</span>
                      )}
                    </p>
                  </div>
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/70 pt-3">
                  <MiniStat
                    icon={TruckIcon}
                    label="Toneladas"
                    value={formatNumber(f.toneladasTotal, 1)}
                  />
                  <MiniStat
                    icon={WalletIcon}
                    label="Receita líquida"
                    value={formatCurrency(f.receitaLiquida)}
                    valueClass={
                      f.receitaLiquida >= 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-destructive"
                    }
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[11px] leading-tight text-muted-foreground">{label}</p>
        <p className={`truncate text-[13px] leading-tight font-semibold ${valueClass ?? "text-foreground"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}