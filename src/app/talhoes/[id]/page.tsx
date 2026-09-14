import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowRightIcon,
  FlaskConicalIcon,
  MapPinnedIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import { deleteTalhao } from "@/lib/actions";
import { getTalhaoDetail } from "@/lib/queries";
import { formatTarefas, haToTarefas } from "@/lib/area";
import { formatHectares, formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const data = await getTalhaoDetail(id);
  if (!data) return { title: "Talhão | CanaGest" };
  return { title: `${data.talhao.nome} | CanaGest` };
}

export default async function TalhaoDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const data = await getTalhaoDetail(id);
  if (!data) notFound();

  const { talhao } = data;

  return (
    <div className="space-y-8">
      <PageHeader
        title={talhao.nome}
        description={
          <Link
            href={`/fazendas/${talhao.fazenda.id}`}
            transitionTypes={["nav-back"]}
            className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary/80"
          >
            {talhao.fazenda.nome}
            <ArrowRightIcon className="size-3.5" />
          </Link>
        }
        icon={MapPinnedIcon}
        backHref={`/fazendas/${talhao.fazenda.id}`}
        actions={
          <>
            <DeleteDialog
              title={`Excluir "${talhao.nome}"?`}
              description="Esta ação não pode ser desfeita. As adubações e herbicidas que o utilizam serão ajustadas."
              action={deleteTalhao}
              id={talhao.id}
            >
              <Button variant="ghost" size="icon-sm" aria-label="Excluir talhão">
                <Trash2Icon className="size-4" />
              </Button>
            </DeleteDialog>
            <Button asChild className="h-9">
              <Link href={`/talhoes/${talhao.id}/editar`} transitionTypes={["nav-forward"]}>
                <PencilIcon className="size-4" />
                Editar
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={MapPinnedIcon} label="Tamanho" value={`${formatHectares(talhao.tamanhoHectares)} ha`} hint={`${formatTarefas(haToTarefas(talhao.tamanhoHectares))} tarefas`} />
        <StatCard icon={FlaskConicalIcon} label="Área em tarefas" value={formatNumber(haToTarefas(talhao.tamanhoHectares), 1)} hint="1 ha = 3,3 tarefas" tone="neutral" />
      </div>

      {talhao.observacoes && (
        <Card>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FlaskConicalIcon className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Observações & tarefas</h2>
                <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {talhao.observacoes}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Colheitas da fazenda</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              O lançamento de colheitas é feito por fazenda, não por talhão.
            </p>
          </div>
          <Button asChild variant="secondary" className="h-9">
            <Link href={`/fazendas/${talhao.fazenda.id}`} transitionTypes={["nav-forward"]}>
              Ver colheitas de {talhao.fazenda.nome}
              <ArrowRightIcon className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}