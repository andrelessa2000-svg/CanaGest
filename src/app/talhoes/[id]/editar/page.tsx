import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, MapPinnedIcon } from "lucide-react";

import { updateTalhao } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { TalhaoForm } from "@/components/talhao-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
  title: "Editar talhão | CanaGest",
};

export default async function EditarTalhaoPage({ params }: { params: Params }) {
  const { id } = await params;
  const talhao = await prisma.talhao.findUnique({ where: { id }, include: { fazenda: true } });
  if (!talhao) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon-sm" className="-ml-2">
          <Link href={`/talhoes/${talhao.id}`} transitionTypes={["nav-back"]} aria-label="Voltar">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 font-heading text-xl font-semibold tracking-tight text-foreground">
            <MapPinnedIcon className="size-5 text-primary" />
            Editar talhão
          </h1>
          <p className="text-sm text-muted-foreground">
            Atualize os dados de {talhao.nome} em {talhao.fazenda.nome}.
          </p>
        </div>
      </div>

      <Card>
        <CardContent>
          <TalhaoForm
            action={updateTalhao}
            fazendaId={talhao.fazendaId}
            fazendaNome={talhao.fazenda.nome}
            initial={{
              id: talhao.id,
              nome: talhao.nome,
              tamanhoHectares: talhao.tamanhoHectares,
              observacoes: talhao.observacoes,
            }}
            submitLabel="Salvar alterações"
          />
        </CardContent>
      </Card>
    </div>
  );
}