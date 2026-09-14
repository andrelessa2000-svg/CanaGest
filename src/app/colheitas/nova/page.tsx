import type { Metadata } from "next";
import { TruckIcon } from "lucide-react";

import { createColheita } from "@/lib/actions";
import { getFazendaOptions } from "@/lib/queries";
import { ColheitaForm } from "@/components/colheita-form";

type SearchParams = Promise<{ fazenda?: string }>;

export const metadata: Metadata = {
  title: "Nova colheita | CanaGest",
};

export default async function NovaColheitaPage({ searchParams }: { searchParams: SearchParams }) {
  const { fazenda } = await searchParams;
  const fazendas = await getFazendaOptions();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          <TruckIcon className="size-6 text-primary" />
          Nova colheita
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registre a produção da fazenda e o resumo financeiro é calculado na hora.
        </p>
      </div>

      <ColheitaForm
        action={createColheita}
        fazendas={fazendas}
        preselectedFazendaId={fazenda}
        submitLabel="Registrar colheita"
      />
    </div>
  );
}