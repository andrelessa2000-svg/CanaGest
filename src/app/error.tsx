"use client";

import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60svh] max-w-md flex-col items-center justify-center text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-8" />
      </div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
        Algo deu errado
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Ocorreu um erro inesperado ao carregar esta página. Tente novamente; se o problema
        continuar, recarregue o aplicativo.
      </p>
      <div className="mt-8">
        <Button onClick={reset}>
          <RotateCcwIcon className="size-4" />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}