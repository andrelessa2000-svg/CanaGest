import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  GavelIcon,
  LandPlotIcon,
  MapPinnedIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  TruckIcon,
  WalletIcon,
} from "lucide-react";

import { deleteColheita, deleteFazenda } from "@/lib/actions";
import { getFazendaDetail } from "@/lib/queries";
import { formatTarefas, haToTarefas } from "@/lib/area";
import {
  formatCurrency,
  formatDate,
  formatHectares,
  formatNumber,
  formatToneladas,
} from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const data = await getFazendaDetail(id);
  if (!data) return { title: "Fazenda | CanaGest" };
  return { title: `${data.fazenda.nome} | CanaGest` };
}

export default async function FazendaDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const data = await getFazendaDetail(id);
  if (!data) notFound();

  const { fazenda, resumo, talhoes, colheitasRecentes } = data;

  return (
    <div className="space-y-8">
      <PageHeader
        title={fazenda.nome}
        description={
          <>
            Criada em {formatDate(fazenda.createdAt)} · {talhoes.length}{" "}
            {talhoes.length === 1 ? "talhão" : "talhões"}
          </>
        }
        icon={LandPlotIcon}
        backHref="/fazendas"
        actions={
          <>
            <DeleteDialog
              title={`Excluir "${fazenda.nome}"?`}
              description="Todos os talhões, colheitas, adubações e herbicidas desta fazenda também serão excluídos. Esta ação não pode ser desfeita."
              action={deleteFazenda}
              id={fazenda.id}
            >
              <Button variant="ghost" size="icon-sm" aria-label="Excluir fazenda">
                <Trash2Icon className="size-4" />
              </Button>
            </DeleteDialog>
            <Button asChild className="h-9">
              <Link href={`/fazendas/${fazenda.id}/editar`} transitionTypes={["nav-forward"]}>
                <PencilIcon className="size-4" />
                Editar
              </Link>
            </Button>
            <Button asChild className="h-9">
              <Link href={`/colheitas/nova?fazenda=${fazenda.id}`} transitionTypes={["nav-forward"]}>
                <PlusIcon className="size-4" />
                Nova colheita
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={LandPlotIcon} label="Área total" value={`${formatHectares(resumo.areaTotal)} ha`} hint={`${formatTarefas(haToTarefas(resumo.areaTotal))} tarefas`} />
        <StatCard icon={TruckIcon} label="Toneladas" value={formatToneladas(resumo.toneladas)} hint={`${colheitasRecentes.length} colheitas`} />
        <StatCard icon={WalletIcon} label="Receita líquida" value={formatCurrency(resumo.receitaLiquida)} tone={resumo.receitaLiquida >= 0 ? "positive" : "negative"} />
        <StatCard icon={GavelIcon} label="Valor médio" hint="por tonelada" value={resumo.toneladas > 0 ? formatCurrency(resumo.receitaLiquida / resumo.toneladas) : "—"} tone="neutral" />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
            <MapPinnedIcon className="size-4 text-primary" />
            Talhões
          </h2>
          <Button asChild variant="default" size="sm" className="h-8">
            <Link href={`/fazendas/${fazenda.id}/talhoes/novo`} transitionTypes={["nav-forward"]}>
              <PlusIcon className="size-4" />
              Novo talhão
            </Link>
          </Button>
        </div>

        {talhoes.length === 0 ? (
          <EmptyState
            icon={MapPinnedIcon}
            title="Nenhum talhão nesta fazenda"
            description="Cadastre o primeiro talhão para acompanhar a área da fazenda."
            action={
              <Button asChild>
                <Link href={`/fazendas/${fazenda.id}/talhoes/novo`}>
                  <PlusIcon className="size-4" />
                  Novo talhão
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {talhoes.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/talhoes/${t.id}`}
                  transitionTypes={["nav-forward"]}
                  className="group flex w-full flex-col rounded-2xl border border-border/80 bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MapPinnedIcon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-foreground">{t.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(t.tamanhoHectares, 1)} ha ·{" "}
                        {formatTarefas(haToTarefas(t.tamanhoHectares))} tarefas
                      </p>
                    </div>
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
            <CalendarDaysIcon className="size-4 text-primary" />
            {colheitasRecentes.length > 0 ? "Colheitas" : "Últimas colheitas"}
          </h2>
          {colheitasRecentes.length > 0 && (
            <Button asChild variant="secondary" size="sm" className="h-8">
              <Link href={`/colheitas/nova?fazenda=${fazenda.id}`} transitionTypes={["nav-forward"]}>
                <PlusIcon className="size-4" />
                Registrar colheita
              </Link>
            </Button>
          )}
        </div>

        {colheitasRecentes.length === 0 ? (
          <EmptyState
            icon={TruckIcon}
            title="Nenhuma colheita registrada"
            description="Registre a primeira colheita desta fazenda para acompanhar a produção e o resultado financeiro."
            action={
              <Button asChild>
                <Link href={`/colheitas/nova?fazenda=${fazenda.id}`}>
                  <PlusIcon className="size-4" />
                  Registrar colheita
                </Link>
              </Button>
            }
          />
        ) : (
          <Card className="gap-0">
            <CardContent className="px-2 py-1 sm:px-3">
              <ul className="divide-y divide-border/70">
                {colheitasRecentes.map((c) => (
                  <li key={c.id} className="flex items-center gap-3 px-2 py-3 sm:px-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <TruckIcon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium capitalize text-foreground">
                        {formatDate(c.data)}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="tabular font-medium">{formatToneladas(c.toneladas)} t</span>
                        <span className="size-1 rounded-full bg-border" />
                        <span>R$ {formatNumber(c.despesas, 2)} despesas</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`hidden text-sm font-semibold tabular sm:block ${
                          c.receitaLiquida >= 0
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-destructive"
                        }`}
                      >
                        {formatCurrency(c.receitaLiquida)}
                      </span>
                      <Link
                        href={`/colheitas/${c.id}/editar`}
                        transitionTypes={["nav-forward"]}
                        aria-label="Editar colheita"
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <PencilIcon className="size-4" />
                      </Link>
                      <DeleteDialog
                        title="Excluir colheita?"
                        description="A colheita será removida e os resumos serão recalculados."
                        action={deleteColheita}
                        id={c.id}
                      >
                        <button
                          type="button"
                          aria-label="Excluir colheita"
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2Icon className="size-4" />
                        </button>
                      </DeleteDialog>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>

      {talhoes.length > 0 && (
        <p className="text-sm">
          <Link
            href={`/fazendas/${fazenda.id}/talhoes/novo`}
            className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80"
          >
            Novo talhão
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </p>
      )}
    </div>
  );
}