"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, PlusIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import type { ActionResult } from "@/lib/actions";

export function FazendaForm({
  action,
  initial,
  submitLabel = "Salvar fazenda",
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  initial?: { id: string; nome: string };
  submitLabel?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, {
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      toast.success("Fazenda salva com sucesso.");
      router.push(state.redirectTo ?? "/fazendas");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <Field
        label="Nome da fazenda"
        hint="Ex.: Fazenda Santa Clara"
        error={!state.success && state.message ? state.message : undefined}
      >
        <Input
          name="nome"
          autoFocus
          required
          maxLength={120}
          defaultValue={initial?.nome ?? ""}
          placeholder="Qual o nome da fazenda?"
          className="h-11 text-base"
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending} className="h-10 px-5">
          {pending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : initial?.id ? (
            <SaveIcon className="size-4" />
          ) : (
            <PlusIcon className="size-4" />
          )}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}