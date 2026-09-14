export const TAREFAS_POR_HECTARE = 3.3;

export function haToTarefas(hectares: number): number {
  return hectares * TAREFAS_POR_HECTARE;
}

export function tarefasToHa(tarefas: number): number {
  return tarefas / TAREFAS_POR_HECTARE;
}

export const AREA_UNITS = ["ha", "tarefa"] as const;
export type AreaUnit = (typeof AREA_UNITS)[number];

const tarefasFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
});

export function formatTarefas(value: number): string {
  return tarefasFormatter.format(value);
}