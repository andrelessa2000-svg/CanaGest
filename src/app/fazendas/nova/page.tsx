import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, LandPlotIcon } from "lucide-react";

import { createFazenda } from "@/lib/actions";
import { FazendaForm } from "@/components/fazenda-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Nova fazenda | CanaGest",
  description: "Cadastre uma nova fazenda.",
};

export default function NovaFazendaPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon-sm" className="-ml-2">
          <Link href="/fazendas" transitionTypes={["nav-back"]} aria-label="Voltar">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="flex items-center gap-2 font-heading text-xl font-semibold tracking-tight text-foreground">
            <LandPlotIcon className="size-5 text-primary" />
            Nova fazenda
          </h1>
          <p className="text-sm text-muted-foreground">Preencha os dados principais da propriedade.</p>
        </div>
      </div>

      <Card>
        <CardContent>
          <FazendaForm action={createFazenda} submitLabel="Cadastrar fazenda" />
        </CardContent>
      </Card>
    </div>
  );
}