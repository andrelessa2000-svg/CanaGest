"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, PlusIcon, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/field";
import { SuffixedNumberInput, toInputString } from "@/components/number-inputs";
import type { ActionResult } from "@/lib/actions";
import {
  AREA_UNITS,
  AreaUnit,
  formatTarefas,
  haToTarefas,
  tarefasToHa,
} from "@/lib/area";
import { formatHectares } from "@/lib/format";
import { parseDecimal } from "@/lib/parse-decimal";

export function TalhaoForm({
  action,
  fazendaId,
  fazendaNome,
  initial,
  submitLabel = "Salvar talhão",
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  fazendaId: string;
  fazendaNome: string;
  initial?: { id: string; nome: string; tamanhoHectares: number; observacoes?: string | null };
  submitLabel?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, {
    success: false,
  });

  const [unit, setUnit] = useState<AreaUnit>("ha");
  const [rawValue, setRawValue] = useState(
    initial ? toInputString(initial.tamanhoHectares, 2) : ""
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Talhão salvo com sucesso.");
      router.push(state.redirectTo ?? `/fazendas/${fazendaId}`);
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router, fazendaId]);

  const parsed = parseDecimal(rawValue);
  const hectares =
    parsed == null ? null : unit === "ha" ? parsed : tarefasToHa(parsed);
  const tarefas = parsed == null ? null : unit === "tarefa" ? parsed : haToTarefas(parsed);

  function switchUnit(next: AreaUnit) {
    if (next === unit) return;
    if (parsed != null) {
      const valueInNext = next === "ha" ? tarefasToHa(parsed) : haToTarefas(parsed);
      setRawValue(toInputString(valueInNext, 2));
    }
    setUnit(next);
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="fazendaId" value={fazendaId} />
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="tamanhoHectares" value={hectares == null ? "" : String(hectares)} />

      <Field label="Fazenda" hint={fazendaNome}>
        <input
          type="text"
          value={fazendaNome}
          disabled
          className="h-11 w-full rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground"
        />
      </Field>

      <Field label="Nome do talhão">
        <Input
          name="nome"
          autoFocus
          required
          maxLength={120}
          defaultValue={initial?.nome ?? ""}
          placeholder="Ex.: Talhão 01 ou Zona Norte"
          className="h-11 text-base"
        />
      </Field>

      <Field
        label="Área do talhão"
        hint="Digite em hectares (ha) ou em tarefas — a conversão é automática."
      >
        <div className="flex flex-col gap-2">
          <div
            className="grid grid-cols-2 gap-1 rounded-lg border border-input bg-muted/60 p-1"
            role="group"
            aria-label="Unidade de área"
          >
            {AREA_UNITS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => switchUnit(u)}
                aria-pressed={unit === u}
                className={cn(
                  "h-9 rounded-md px-3 text-sm font-medium transition-colors",
                  unit === u
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {u === "ha" ? "Hectares (ha)" : "Tarefas"}
              </button>
            ))}
          </div>

          <SuffixedNumberInput
            suffix={unit === "ha" ? "ha" : "tarefas"}
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="next"
            value={rawValue}
            onChange={(e) => setRawValue(e.target.value)}
            placeholder="0,00"
          />

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary/50" />
            {hectares != null && tarefas != null ? (
              <span>
                <span className="font-medium text-foreground">{formatHectares(hectares)} ha</span>
                <span className="mx-1">=</span>
                <span className="font-medium text-foreground">{formatTarefas(tarefas)} tarefas</span>
                <span className="ml-1">(1 ha = 3,3 tarefas)</span>
              </span>
            ) : (
              <span>1 ha = 3,3 tarefas</span>
            )}
          </div>
        </div>
      </Field>

      <Field label="Observações / tarefas" hint="Anotações livres, tarefas e observações da área.">
        <Textarea
          name="observacoes"
          maxLength={2000}
          defaultValue={initial?.observacoes ?? ""}
          placeholder="Ex.: reforma prevista, adubação de plantio, pragas observadas..."
          className="min-h-28 resize-y text-[15px]"
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