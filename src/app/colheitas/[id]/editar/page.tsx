import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";

import { updateColheita } from "@/lib/actions";
import { getColheitaForEdit } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { ColheitaForm, type ColheitaFormInitial } from "@/components/colheita-form";
import { Button } from "@/components/ui/button";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
  title: "Editar colheita | CanaGest",
};

export default async function EditarColheitaPage({ params }: { params: Params }) {
  const { id } = await params;
  const data = await getColheitaForEdit(id);
  if (!data) notFound();

  const c = data.colheita;
  const initial: ColheitaFormInitial = {
    id: c.id,
    fazendaId: c.fazendaId,
    data: c.data.toISOString().slice(0, 10),
    toneladas: c.toneladas,
    precoPorTonelada: c.precoPorTonelada,
    agio: c.agio,
    ctc: c.ctc,
    plantioUsina: c.plantioUsina,
    areaTarefasContrato: c.areaTarefasContrato,
    contratoToneladasPorTarefa: c.contratoToneladasPorTarefa,
    outrasDespesas: c.outrasDespesas,
    adubacao: c.adubacao
      ? {
          fazendaId: c.adubacao.fazendaId,
          doseSacosPorTarefa: c.adubacao.doseSacosPorTarefa,
          pesoSacoKg: c.adubacao.pesoSacoKg,
          precoTonelada: c.adubacao.precoTonelada,
          talhoes: c.adubacao.talhoes.map((t) => ({
            talhaoId: t.talhaoId,
            abrangencia: t.abrangencia as "total" | "parcial",
            areaTarefas: t.areaTarefas,
          })),
        }
      : null,
    herbicida: c.herbicida
      ? {
          fazendaId: c.herbicida.fazendaId,
          custoAplicacao: c.herbicida.custoAplicacao,
          outrosCustos: c.herbicida.outrosCustos,
          talhoes: c.herbicida.talhoes.map((t) => ({
            talhaoId: t.talhaoId,
            abrangencia: t.abrangencia as "total" | "parcial",
            areaTarefas: t.areaTarefas,
          })),
          produtos: c.herbicida.produtos.map((p) => ({
            nome: p.nome,
            quantidade: p.quantidade,
            unidade: p.unidade,
            precoUnitario: p.precoUnitario,
          })),
        }
      : null,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon-sm" className="-ml-2">
          <Link href={`/fazendas/${c.fazendaId}`} transitionTypes={["nav-back"]} aria-label="Voltar">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 font-heading text-xl font-semibold tracking-tight text-foreground">
            <PencilIcon className="size-5 text-primary" />
            Editar colheita
          </h1>
          <p className="text-sm text-muted-foreground">
            Colheita de {formatDate(c.data)} · {c.fazenda.nome} (ID {c.id.slice(0, 6)}).
          </p>
        </div>
      </div>

      <ColheitaForm
        action={updateColheita}
        fazendas={data.fazendas}
        initial={initial}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}