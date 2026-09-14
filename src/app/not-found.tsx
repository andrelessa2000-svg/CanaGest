import Link from "next/link";
import { CompassIcon, HomeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60svh] max-w-md flex-col items-center justify-center text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <CompassIcon className="size-8" />
      </div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
        Página não encontrada
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        O conteúdo que você procura não existe ou foi movido. Verifique o endereço ou volte para o
        início.
      </p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Button asChild>
          <Link href="/">
            <HomeIcon className="size-4" />
            Ir para o início
          </Link>
        </Button>
      </div>
    </div>
  );
}