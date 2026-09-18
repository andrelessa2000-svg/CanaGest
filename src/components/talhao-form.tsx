"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/lib/actions";
import {
  fmtHa,
  fmtTarefas,
  parseDecimal,
  tarefasParaHa,
  UNIDADES_AREA,
  type UnidadeArea,
} from "@/lib/format";
import { AlertaFormulario, BotaoSubmit, Campo } from "./forms";

export function TalhaoForm({
  acao,
  nomeFazenda,
  inicial,
}: {
  acao: (prev: ActionState | undefined, formData: FormData) => Promise<ActionState>;
  nomeFazenda: string;
  inicial?: { nome: string; areaHa: number };
}) {
  const [state, acaoForm] = useActionState(acao, undefined);
  const [area, setArea] = useState(
    inicial ? String(inicial.areaHa).replace(".", ",") : "",
  );
  const [unidade, setUnidade] = useState<UnidadeArea>("ha");

  const valor = parseDecimal(area);
  const areaHa =
    Number.isFinite(valor) && valor > 0
      ? unidade === "tarefas"
        ? tarefasParaHa(valor)
        : valor
      : null;

  return (
    <form action={acaoForm} className="grid gap-5 pb-4">
      <AlertaFormulario mensagem={state && !state.ok ? state.error : undefined} />

      <p className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink-2">
        Fazenda: <span className="font-semibold text-ink">{nomeFazenda}</span>
      </p>

      <Campo
        label="Identificação do talhão"
        htmlFor="nome"
        hint="Ex.: T-01, T-02… Use um identificador curto."
      >
        <input
          id="nome"
          name="nome"
          className="field-input"
          defaultValue={inicial?.nome}
          required
          autoFocus
          maxLength={20}
          placeholder="Ex.: T-01"
        />
      </Campo>

      <div className="grid grid-cols-[1fr_9rem] gap-4">
        <Campo
          label="Área"
          htmlFor="area"
          hint={
            areaHa
              ? `${fmtHa(areaHa)} · ${fmtTarefas(areaHa)}`
              : "1 ha = 3,3 tarefas. Aceita vírgula."
          }
        >
          <input
            id="area"
            name="area"
            className="field-input tnum"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            inputMode="decimal"
            required
            placeholder={unidade === "ha" ? "Ex.: 42,5" : "Ex.: 140"}
          />
        </Campo>
        <Campo label="Unidade" htmlFor="unidade">
          <select
            id="unidade"
            name="unidade"
            className="field-input"
            value={unidade}
            onChange={(e) => setUnidade(e.target.value as UnidadeArea)}
          >
            {UNIDADES_AREA.map((u) => (
              <option key={u} value={u}>
                {u === "ha" ? "Hectares" : "Tarefas"}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <div className="flex justify-end">
        <BotaoSubmit>{inicial ? "Salvar alterações" : "Cadastrar talhão"}</BotaoSubmit>
      </div>
    </form>
  );
}