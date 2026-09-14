import Link from "next/link";
import {
  ArrowRightIcon,
  AreaChartIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  CircleDollarSignIcon,
  LandPlotIcon,
  PlusIcon,
  SproutIcon,
  TreesIcon,
  TruckIcon,
} from "lucide-react";

import { getDashboardData } from "@/lib/queries";
import { formatTarefas, haToTarefas } from "@/lib/area";
import {
  formatCurrency,
  formatDate,
  formatHectares,
  formatNumber,
  formatToneladas,
} from "@/lib/format";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Logo } from "@/components/brand";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (data.totalFazendas === 0) {
    return (
      <div className="mx-auto flex min-h-[60svh] max-w-lg flex-col items-center justify-center text-center">
        <Logo size={64} className="mb-6" />
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Bem-vindo ao CanaGest
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Organize suas fazendas, talhões e colheitas em um só lugar, com resumo financeiro
          calculado automaticamente.
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button asChild size="lg" className="h-11 px-6">
            <Link href="/fazendas/nova">
              <PlusIcon className="size-4" />
              Cadastrar primeira fazenda
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="h-11 px-6">
            <Link href="/colheitas/nova">Lançar colheita</Link>
          </Button>
        </div>
      </div>
    );
  }

  const semColheitas = data.colheitasRecentes.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-[26px]">
          Resumo geral
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral da sua produção e dos resultados financeiros.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          icon={TreesIcon}
          label="Fazendas"
          value={String(data.totalFazendas)}
          hint={`${data.totalTalhoes} talhões`}
        />
        <StatCard
          icon={AreaChartIcon}
          label="Área total"
          value={`${formatHectares(data.areaTotal)} ha`}
          hint={`${formatTarefas(haToTarefas(data.areaTotal))} tarefas`}
          tone="neutral"
        />
        <StatCard
          icon={TruckIcon}
          label="Toneladas"
          value={formatToneladas(data.totais.toneladas)}
          hint={
            data.totais.toneladas === 0 || data.areaTotal === 0
              ? "—"
              : `${formatNumber(data.totais.toneladas / data.areaTotal, 1)} t/ha`
          }
        />
        <StatCard
          icon={CircleDollarSignIcon}
          label="Receita líquida"
          value={formatCurrency(data.totais.receitaLiquida)}
          tone={data.totais.receitaLiquida >= 0 ? "positive" : "negative"}
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
            <CalendarDaysIcon className="size-4 text-primary" />
            Últimas colheitas
          </h2>
          <Link
            href="/colheitas/nova"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <PlusIcon className="size-4" />
            Nova colheita
          </Link>
        </div>

        {semColheitas ? (
          <EmptyState
            icon={SproutIcon}
            title="Nenhuma colheita registrada"
            description="Registre a primeira colheita da safra para acompanhar a produção e os resultados financeiros."
            action={
              <Button asChild>
                <Link href="/colheitas/nova">
                  <PlusIcon className="size-4" />
                  Lançar colheita
                </Link>
              </Button>
            }
          />
        ) : (
          <Card className="gap-0">
            <CardContent className="px-2 py-1 sm:px-3">
              <ul className="divide-y divide-border/70">
                {data.colheitasRecentes.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/fazendas/${c.fazendaId}`}
                      transitionTypes={["nav-forward"]}
                      className="group flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-muted/60 sm:px-3"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <TruckIcon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {c.fazendaNome}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="capitalize">{formatDate(c.data)}</span>
                          <span className="size-1 rounded-full bg-border" />
                          <span className="tabular font-medium">{formatToneladas(c.toneladas)} t</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`tabular text-sm font-semibold ${
                            c.receitaLiquida >= 0
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-destructive"
                          }`}
                        >
                          {formatCurrency(c.receitaLiquida)}
                        </span>
                        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
            <LandPlotIcon className="size-4 text-primary" />
            Suas fazendas
          </h2>
          <Link
            href="/fazendas"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Ver todas
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.fazendasResumo.map((f) => (
            <li key={f.id}>
              <Link
                href={`/fazendas/${f.id}`}
                transitionTypes={["nav-forward"]}
                className="group block rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <TreesIcon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-foreground">{f.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.talhaoCount} {f.talhaoCount === 1 ? "talhão" : "talhões"}
                    </p>
                  </div>
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3 text-sm">
<span className="text-muted-foreground">
                      <span className="tabular font-semibold text-foreground">
                        {formatHectares(f.areaTotal)}
                      </span>{" "}
                      ha
                      {f.areaTotal > 0 && (
                        <span className="mx-1 text-muted-foreground/70">·</span>
                      )}
                      {f.areaTotal > 0 && (
                        <span className="tabular">{formatTarefas(haToTarefas(f.areaTotal))} tarefas</span>
                      )}
                    </span>
                  <span
                    className={`tabular font-semibold ${
                      f.receitaLiquida >= 0
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-destructive"
                    }`}
                  >
                    {formatCurrency(f.receitaLiquida)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}