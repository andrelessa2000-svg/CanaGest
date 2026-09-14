import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, LandPlotIcon } from "lucide-react";

import { updateFazenda } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { FazendaForm } from "@/components/fazenda-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
  title: "Editar fazenda | CanaGest",
};

export default async function EditarFazendaPage({ params }: { params: Params }) {
  const { id } = await params;
  const fazenda = await prisma.fazenda.findUnique({ where: { id } });
  if (!fazenda) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon-sm" className="-ml-2">
          <Link href={`/fazendas/${fazenda.id}`} transitionTypes={["nav-back"]} aria-label="Voltar">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 font-heading text-xl font-semibold tracking-tight text-foreground">
            <LandPlotIcon className="size-5 text-primary" />
            Editar fazenda
          </h1>
          <p className="text-sm text-muted-foreground">Atualize os dados de {fazenda.nome}.</p>
        </div>
      </div>

      <Card>
        <CardContent>
          <FazendaForm
            action={updateFazenda}
            initial={{ id: fazenda.id, nome: fazenda.nome }}
            submitLabel="Salvar alterações"
          />
        </CardContent>
      </Card>
    </div>
  );
}