"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions";
import { AlertaFormulario, BotaoSubmit, Campo } from "./forms";

export function FazendaForm({
  acao,
  inicial,
}: {
  acao: (prev: ActionState | undefined, formData: FormData) => Promise<ActionState>;
  inicial?: { nome: string };
}) {
  const [state, acaoForm] = useActionState(acao, undefined);

  return (
    <form action={acaoForm} className="grid gap-5 pb-4">
      <AlertaFormulario mensagem={state && !state.ok ? state.error : undefined} />

      <Campo
        label="Nome da fazenda"
        htmlFor="nome"
        hint="A área total é calculada automaticamente pela soma dos talhões."
      >
        <input
          id="nome"
          name="nome"
          className="field-input"
          defaultValue={inicial?.nome}
          required
          autoFocus
          maxLength={80}
          placeholder="Ex.: Fazenda Boa Vista"
        />
      </Campo>

      <div className="flex justify-end">
        <BotaoSubmit>{inicial ? "Salvar alterações" : "Cadastrar fazenda"}</BotaoSubmit>
      </div>
    </form>
  );
}