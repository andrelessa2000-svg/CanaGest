"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { toMoney } from "@/lib/calcs";
import { parseDecimal } from "@/lib/parse-decimal";
import { haToTarefas } from "@/lib/area";

export type ActionResult = {
  success: boolean;
  message?: string;
  redirectTo?: string;
};

function textField(formData: FormData, name: string): string {
  return (formData.get(name) as string | null)?.trim() ?? "";
}

function moneyField(formData: FormData, name: string): number {
  const raw = formData.get(name) as string | null;
  if (raw == null || raw.trim() === "") return 0;
  const parsed = parseDecimal(raw);
  return parsed == null ? 0 : toMoney(parsed);
}

function numberField(formData: FormData, name: string): number | null {
  const raw = formData.get(name) as string | null;
  if (raw == null || raw.trim() === "") return null;
  return parseDecimal(raw);
}

function jsonField<T>(formData: FormData, name: string): T | null {
  const raw = formData.get(name) as string | null;
  if (raw == null || raw.trim() === "" || raw.trim() === "null") return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

const fazendaSchema = z.object({
  nome: z
    .string()
    .min(1, "Informe o nome da fazenda.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
});

const talhaoSchema = z.object({
  nome: z
    .string()
    .min(1, "Informe o nome do talhão.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
  tamanhoHectares: z
    .number({ message: "Informe o tamanho em hectares." })
    .min(0.01, "O tamanho deve ser maior que zero.")
    .max(100000, "Valor inválido."),
  observacoes: z.string().max(2000, "Máximo de 2000 caracteres.").optional(),
  fazendaId: z.string().min(1, "Fazenda inválida."),
});

const colheitaSchema = z.object({
  fazendaId: z.string().min(1, "Fazenda inválida."),
  data: z.string().min(1, "Informe a data."),
  toneladas: z
    .number({ message: "Informe as toneladas." })
    .min(0.001, "As toneladas devem ser maiores que zero."),
  precoPorTonelada: z.number().min(0).max(1_000_000),
  agio: z.number().min(0).max(1_000_000_000),
  ctc: z.number().min(0).max(1_000_000_000),
  plantioUsina: z.number().min(0).max(1_000_000_000),
  areaTarefasContrato: z.number().min(0).max(1_000_000_000),
  contratoToneladasPorTarefa: z.number().min(0).max(1_000_000),
  outrasDespesas: z.number().min(0).max(1_000_000_000),
});

const talhaoFinanceiroSchema = z.object({
  talhaoId: z.string().min(1, "Talhão inválido."),
  abrangencia: z.enum(["total", "parcial"]),
  areaTarefas: z.number().min(0).max(100000),
});

const adubacaoSchema = z.object({
  fazendaId: z.string().min(1, "Fazenda inválida."),
  doseSacosPorTarefa: z.number().min(0).max(1000),
  pesoSacoKg: z.number().min(0).max(1000),
  precoTonelada: z.number().min(0).max(1_000_000),
  talhoes: z.array(talhaoFinanceiroSchema).min(1, "Selecione ao menos um talhão."),
});

const herbicidaProdutoSchema = z.object({
  nome: z.string().min(1, "Informe o nome do produto."),
  quantidade: z.number().min(0).max(1_000_000),
  unidade: z.string().min(1, "Informe a unidade."),
  precoUnitario: z.number().min(0).max(1_000_000),
});

const herbicidaSchema = z.object({
  fazendaId: z.string().min(1, "Fazenda inválida."),
  custoAplicacao: z.number().min(0).max(1_000_000_000),
  outrosCustos: z.number().min(0).max(1_000_000_000),
  talhoes: z.array(talhaoFinanceiroSchema).min(1, "Selecione ao menos um talhão."),
  produtos: z.array(herbicidaProdutoSchema).min(1, "Adicione ao menos um produto."),
});

function schemaError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Verifique os dados informados.";
}

async function fazendaExists(id: string) {
  return (await prisma.fazenda.count({ where: { id } })) > 0;
}

function validateFaseFazenda(
  colheitaFazendaId: string,
  faseNome: "adubação" | "herbicida",
  faseFazendaId?: string
): string | null {
  if (faseFazendaId && faseFazendaId !== colheitaFazendaId) {
    return `A ${faseNome} deve pertencer à mesma fazenda da colheita.`;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Fazendas                                                             */
/* ------------------------------------------------------------------ */

export async function createFazenda(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = fazendaSchema.safeParse({ nome: textField(formData, "nome") });
  if (!parsed.success) return { success: false, message: schemaError(parsed.error) };

  const fazenda = await prisma.fazenda.create({ data: { nome: parsed.data.nome } });
  revalidatePath("/");
  revalidatePath("/fazendas");
  return { success: true, redirectTo: `/fazendas/${fazenda.id}` };
}

export async function updateFazenda(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const id = textField(formData, "id");
  if (!id) return { success: false, message: "Fazenda inválida." };

  const parsed = fazendaSchema.safeParse({ nome: textField(formData, "nome") });
  if (!parsed.success) return { success: false, message: schemaError(parsed.error) };

  await prisma.fazenda.update({
    where: { id },
    data: { nome: parsed.data.nome },
  });
  revalidatePath("/");
  revalidatePath("/fazendas");
  revalidatePath(`/fazendas/${id}`);
  return { success: true, redirectTo: `/fazendas/${id}` };
}

export async function deleteFazenda(formData: FormData): Promise<ActionResult> {
  const id = textField(formData, "id");
  if (!id) return { success: false, message: "Fazenda inválida." };
  await prisma.fazenda.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/fazendas");
  return { success: true, message: "Fazenda excluída." };
}

/* ------------------------------------------------------------------ */
/* Talhões                                                              */
/* ------------------------------------------------------------------ */

export async function createTalhao(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = talhaoSchema.safeParse({
    nome: textField(formData, "nome"),
    tamanhoHectares: numberField(formData, "tamanhoHectares"),
    observacoes: textField(formData, "observacoes") || undefined,
    fazendaId: textField(formData, "fazendaId"),
  });
  if (!parsed.success) return { success: false, message: schemaError(parsed.error) };
  if (!(await fazendaExists(parsed.data.fazendaId))) {
    return { success: false, message: "Fazenda não encontrada." };
  }

  const talhao = await prisma.talhao.create({
    data: {
      nome: parsed.data.nome,
      tamanhoHectares: parsed.data.tamanhoHectares,
      observacoes: parsed.data.observacoes,
      fazendaId: parsed.data.fazendaId,
    },
  });
  revalidatePath("/");
  revalidatePath("/fazendas");
  revalidatePath(`/fazendas/${parsed.data.fazendaId}`);
  return { success: true, redirectTo: `/talhoes/${talhao.id}` };
}

export async function updateTalhao(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const id = textField(formData, "id");
  if (!id) return { success: false, message: "Talhão inválido." };

  const parsed = talhaoSchema.safeParse({
    nome: textField(formData, "nome"),
    tamanhoHectares: numberField(formData, "tamanhoHectares"),
    observacoes: textField(formData, "observacoes") || undefined,
    fazendaId: textField(formData, "fazendaId"),
  });
  if (!parsed.success) return { success: false, message: schemaError(parsed.error) };

  const talhao = await prisma.talhao.update({
    where: { id },
    data: {
      nome: parsed.data.nome,
      tamanhoHectares: parsed.data.tamanhoHectares,
      observacoes: parsed.data.observacoes,
    },
  });
  revalidatePath("/");
  revalidatePath("/fazendas");
  revalidatePath(`/fazendas/${parsed.data.fazendaId}`);
  revalidatePath(`/talhoes/${id}`);
  return { success: true, redirectTo: `/talhoes/${talhao.id}` };
}

export async function deleteTalhao(formData: FormData): Promise<ActionResult> {
  const id = textField(formData, "id");
  if (!id) return { success: false, message: "Talhão inválido." };

  const talhao = await prisma.talhao.findUnique({
    where: { id },
    select: { fazendaId: true },
  });
  if (!talhao) return { success: false, message: "Talhão não encontrado." };

  await prisma.talhao.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/fazendas");
  revalidatePath(`/fazendas/${talhao.fazendaId}`);
  return { success: true, message: "Talhão excluído." };
}

/* ------------------------------------------------------------------ */
/* Colheitas                                                            */
/* ------------------------------------------------------------------ */

async function normalizeTalhoesFinanceiros(
  fase: "adubação" | "herbicida",
  fazendaId: string,
  talhoes: z.infer<typeof talhaoFinanceiroSchema>[]
) {
  const found = await prisma.talhao.findMany({
    where: { id: { in: talhoes.map((t) => t.talhaoId) } },
    select: { id: true, fazendaId: true, tamanhoHectares: true },
  });
  const byId = new Map(found.map((t) => [t.id, t]));

  for (const t of talhoes) {
    const talhao = byId.get(t.talhaoId);
    if (!talhao) return { error: `Talhão não encontrado na ${fase}.` };
    if (talhao.fazendaId !== fazendaId) {
      return { error: `Um dos talhões selecionados não pertence à fazenda da ${fase}.` };
    }
    if (t.abrangencia === "total") {
      t.areaTarefas = haToTarefas(talhao.tamanhoHectares);
    } else if (t.areaTarefas <= 0) {
      return { error: `Informe a área da ${fase} em tarefas.` };
    } else {
      const maxArea = haToTarefas(talhao.tamanhoHectares);
      if (t.areaTarefas > maxArea) {
        return { error: "A área parcial não pode ser maior que a área do talhão." };
      }
    }
  }
  return {};
}

export async function createColheita(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const parsed = colheitaSchema.safeParse({
    fazendaId: textField(formData, "fazendaId"),
    data: textField(formData, "data"),
    toneladas: numberField(formData, "toneladas"),
    precoPorTonelada: moneyField(formData, "precoPorTonelada"),
    agio: moneyField(formData, "agio"),
    ctc: moneyField(formData, "ctc"),
    plantioUsina: moneyField(formData, "plantioUsina"),
    areaTarefasContrato: numberField(formData, "areaTarefasContrato"),
    contratoToneladasPorTarefa: numberField(formData, "contratoToneladasPorTarefa"),
    outrasDespesas: moneyField(formData, "outrasDespesas"),
  });
  if (!parsed.success) return { success: false, message: schemaError(parsed.error) };
  if (!(await fazendaExists(parsed.data.fazendaId))) {
    return { success: false, message: "Fazenda não encontrada." };
  }

  const adubacaoRaw = jsonField<unknown>(formData, "adubacao");
  const herbicidaRaw = jsonField<unknown>(formData, "herbicida");

  const adubacaoParsed = adubacaoRaw ? adubacaoSchema.safeParse(adubacaoRaw) : null;
  const herbicidaParsed = herbicidaRaw ? herbicidaSchema.safeParse(herbicidaRaw) : null;
  if (adubacaoParsed && !adubacaoParsed.success)
    return { success: false, message: schemaError(adubacaoParsed.error) };
  if (herbicidaParsed && !herbicidaParsed.success)
    return { success: false, message: schemaError(herbicidaParsed.error) };

  const erroFase = validateFaseFazenda(
    parsed.data.fazendaId,
    "adubação",
    adubacaoParsed?.data?.fazendaId
  );
  if (erroFase) return { success: false, message: erroFase };

  if (adubacaoParsed?.data) {
    const normalized = await normalizeTalhoesFinanceiros(
      "adubação",
      adubacaoParsed.data.fazendaId,
      adubacaoParsed.data.talhoes
    );
    if ("error" in normalized) return { success: false, message: normalized.error };
  }

  if (herbicidaParsed?.data) {
    const normalized = await normalizeTalhoesFinanceiros(
      "herbicida",
      herbicidaParsed.data.fazendaId,
      herbicidaParsed.data.talhoes
    );
    if ("error" in normalized) return { success: false, message: normalized.error };
  }

  await prisma.colheita.create({
    data: {
      fazendaId: parsed.data.fazendaId,
      data: new Date(`${parsed.data.data}T12:00:00`),
      toneladas: parsed.data.toneladas,
      precoPorTonelada: parsed.data.precoPorTonelada,
      agio: parsed.data.agio,
      ctc: parsed.data.ctc,
      plantioUsina: parsed.data.plantioUsina,
      areaTarefasContrato: parsed.data.areaTarefasContrato,
      contratoToneladasPorTarefa: parsed.data.contratoToneladasPorTarefa,
      outrasDespesas: parsed.data.outrasDespesas,
      ...(adubacaoParsed?.data && {
        adubacao: {
          create: {
            fazendaId: adubacaoParsed.data.fazendaId,
            doseSacosPorTarefa: adubacaoParsed.data.doseSacosPorTarefa,
            pesoSacoKg: adubacaoParsed.data.pesoSacoKg,
            precoTonelada: adubacaoParsed.data.precoTonelada,
            talhoes: {
              create: adubacaoParsed.data.talhoes.map((t) => ({
                talhaoId: t.talhaoId,
                abrangencia: t.abrangencia,
                areaTarefas: t.areaTarefas,
              })),
            },
          },
        },
      }),
      ...(herbicidaParsed?.data && {
        herbicida: {
          create: {
            fazendaId: herbicidaParsed.data.fazendaId,
            custoAplicacao: herbicidaParsed.data.custoAplicacao,
            outrosCustos: herbicidaParsed.data.outrosCustos,
            talhoes: {
              create: herbicidaParsed.data.talhoes.map((t) => ({
                talhaoId: t.talhaoId,
                abrangencia: t.abrangencia,
                areaTarefas: t.areaTarefas,
              })),
            },
            produtos: {
              create: herbicidaParsed.data.produtos.map((p) => ({
                nome: p.nome,
                quantidade: p.quantidade,
                unidade: p.unidade,
                precoUnitario: p.precoUnitario,
              })),
            },
          },
        },
      }),
    },
  });

  revalidatePath("/");
  revalidatePath("/fazendas");
  revalidatePath(`/fazendas/${parsed.data.fazendaId}`);
  return { success: true, redirectTo: `/fazendas/${parsed.data.fazendaId}` };
}

export async function updateColheita(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const id = textField(formData, "id");
  if (!id) return { success: false, message: "Colheita inválida." };

  const parsed = colheitaSchema.safeParse({
    fazendaId: textField(formData, "fazendaId"),
    data: textField(formData, "data"),
    toneladas: numberField(formData, "toneladas"),
    precoPorTonelada: moneyField(formData, "precoPorTonelada"),
    agio: moneyField(formData, "agio"),
    ctc: moneyField(formData, "ctc"),
    plantioUsina: moneyField(formData, "plantioUsina"),
    areaTarefasContrato: numberField(formData, "areaTarefasContrato"),
    contratoToneladasPorTarefa: numberField(formData, "contratoToneladasPorTarefa"),
    outrasDespesas: moneyField(formData, "outrasDespesas"),
  });
  if (!parsed.success) return { success: false, message: schemaError(parsed.error) };

  const previous = await prisma.colheita.findUnique({
    where: { id },
    select: { fazendaId: true },
  });
  if (!previous) return { success: false, message: "Colheita não encontrada." };
  if (!(await fazendaExists(parsed.data.fazendaId))) {
    return { success: false, message: "Fazenda não encontrada." };
  }

  const adubacaoRaw = jsonField<unknown>(formData, "adubacao");
  const herbicidaRaw = jsonField<unknown>(formData, "herbicida");

  const adubacaoParsed = adubacaoRaw ? adubacaoSchema.safeParse(adubacaoRaw) : null;
  const herbicidaParsed = herbicidaRaw ? herbicidaSchema.safeParse(herbicidaRaw) : null;
  if (adubacaoParsed && !adubacaoParsed.success)
    return { success: false, message: schemaError(adubacaoParsed.error) };
  if (herbicidaParsed && !herbicidaParsed.success)
    return { success: false, message: schemaError(herbicidaParsed.error) };

  const erroFase = validateFaseFazenda(
    parsed.data.fazendaId,
    "adubação",
    adubacaoParsed?.data?.fazendaId
  );
  if (erroFase) return { success: false, message: erroFase };

  if (adubacaoParsed?.data) {
    const normalized = await normalizeTalhoesFinanceiros(
      "adubação",
      adubacaoParsed.data.fazendaId,
      adubacaoParsed.data.talhoes
    );
    if ("error" in normalized) return { success: false, message: normalized.error };
  }

  if (herbicidaParsed?.data) {
    const normalized = await normalizeTalhoesFinanceiros(
      "herbicida",
      herbicidaParsed.data.fazendaId,
      herbicidaParsed.data.talhoes
    );
    if ("error" in normalized) return { success: false, message: normalized.error };
  }

  await prisma.$transaction([
    prisma.adubacao.deleteMany({ where: { colheitaId: id } }),
    prisma.herbicida.deleteMany({ where: { colheitaId: id } }),
    prisma.colheita.update({
      where: { id },
      data: {
        fazendaId: parsed.data.fazendaId,
        data: new Date(`${parsed.data.data}T12:00:00`),
        toneladas: parsed.data.toneladas,
        precoPorTonelada: parsed.data.precoPorTonelada,
        agio: parsed.data.agio,
        ctc: parsed.data.ctc,
        plantioUsina: parsed.data.plantioUsina,
        areaTarefasContrato: parsed.data.areaTarefasContrato,
        contratoToneladasPorTarefa: parsed.data.contratoToneladasPorTarefa,
        outrasDespesas: parsed.data.outrasDespesas,
        ...(adubacaoParsed?.data && {
          adubacao: {
            create: {
              fazendaId: adubacaoParsed.data.fazendaId,
              doseSacosPorTarefa: adubacaoParsed.data.doseSacosPorTarefa,
              pesoSacoKg: adubacaoParsed.data.pesoSacoKg,
              precoTonelada: adubacaoParsed.data.precoTonelada,
              talhoes: {
                create: adubacaoParsed.data.talhoes.map((t) => ({
                  talhaoId: t.talhaoId,
                  abrangencia: t.abrangencia,
                  areaTarefas: t.areaTarefas,
                })),
              },
            },
          },
        }),
        ...(herbicidaParsed?.data && {
          herbicida: {
            create: {
              fazendaId: herbicidaParsed.data.fazendaId,
              custoAplicacao: herbicidaParsed.data.custoAplicacao,
              outrosCustos: herbicidaParsed.data.outrosCustos,
              talhoes: {
                create: herbicidaParsed.data.talhoes.map((t) => ({
                  talhaoId: t.talhaoId,
                  abrangencia: t.abrangencia,
                  areaTarefas: t.areaTarefas,
                })),
              },
              produtos: {
                create: herbicidaParsed.data.produtos.map((p) => ({
                  nome: p.nome,
                  quantidade: p.quantidade,
                  unidade: p.unidade,
                  precoUnitario: p.precoUnitario,
                })),
              },
            },
          },
        }),
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/fazendas");
  revalidatePath(`/fazendas/${parsed.data.fazendaId}`);
  if (previous.fazendaId !== parsed.data.fazendaId) {
    revalidatePath(`/fazendas/${previous.fazendaId}`);
  }
  return { success: true, redirectTo: `/fazendas/${parsed.data.fazendaId}` };
}

export async function deleteColheita(formData: FormData): Promise<ActionResult> {
  const id = textField(formData, "id");
  if (!id) return { success: false, message: "Colheita inválida." };

  const colheita = await prisma.colheita.findUnique({
    where: { id },
    select: { fazendaId: true },
  });
  if (!colheita) return { success: false, message: "Colheita não encontrada." };

  await prisma.colheita.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/fazendas");
  revalidatePath(`/fazendas/${colheita.fazendaId}`);
  return { success: true, message: "Colheita excluída." };
}