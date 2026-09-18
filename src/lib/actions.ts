"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import {
  colheitaSchema,
  fazendaSchema,
  primeiraMensagem,
  talhaoSchema,
} from "./validators";

export type ActionState = { ok: true } | { ok: false; error: string };

function campo(formData: FormData, nome: string): string {
  return formData.get(nome)?.toString() ?? "";
}

function falha(e: unknown): ActionState {
  if (e instanceof Error) {
    return { ok: false, error: e.message };
  }
  return { ok: false, error: "Não foi possível concluir a operação." };
}

export async function criarFazenda(
  prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = fazendaSchema.safeParse({
    nome: campo(formData, "nome"),
  });

  if (!parsed.success) {
    return { ok: false, error: primeiraMensagem(parsed.error) };
  }

  try {
    await prisma.fazenda.create({
      data: {
        nome: parsed.data.nome,
      },
    });
  } catch (e) {
    console.error(e);
    return falha(e);
  }

  revalidatePath("/");
  revalidatePath("/fazendas");
  redirect("/fazendas");
}

export async function atualizarFazenda(
  id: string,
  prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = fazendaSchema.safeParse({
    nome: campo(formData, "nome"),
  });

  if (!parsed.success) {
    return { ok: false, error: primeiraMensagem(parsed.error) };
  }

  try {
    await prisma.fazenda.update({
      where: { id },
      data: {
        nome: parsed.data.nome,
      },
    });
  } catch (e) {
    console.error(e);
    return falha(e);
  }

  revalidatePath("/");
  revalidatePath("/fazendas");
  revalidatePath(`/fazendas/${id}`);
  redirect(`/fazendas/${id}`);
}

export async function excluirFazenda(id: string): Promise<void> {
  try {
    await prisma.fazenda.delete({ where: { id } });
  } catch (e) {
    console.error(e);
    throw e;
  }
  revalidatePath("/");
  revalidatePath("/fazendas");
  redirect("/fazendas");
}

export async function criarTalhao(
  fazendaId: string,
  prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = talhaoSchema.safeParse({
    fazendaId,
    nome: campo(formData, "nome"),
    area: campo(formData, "area"),
    unidade: campo(formData, "unidade"),
  });

  if (!parsed.success) {
    return { ok: false, error: primeiraMensagem(parsed.error) };
  }

  let talhaoId: string;
  try {
    const talhao = await prisma.talhao.create({
      data: {
        fazendaId,
        nome: parsed.data.nome,
        areaHa: parsed.data.areaHa,
      },
    });
    talhaoId = talhao.id;
  } catch (e) {
    console.error(e);
    return falha(e);
  }

  revalidatePath("/");
  revalidatePath("/fazendas");
  revalidatePath(`/fazendas/${fazendaId}`);
  redirect(`/talhoes/${talhaoId}`);
}

export async function atualizarTalhao(
  id: string,
  prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const original = await prisma.talhao.findUnique({ where: { id } });
  if (!original) {
    return { ok: false, error: "Talhão não encontrado." };
  }

  const parsed = talhaoSchema.safeParse({
    fazendaId: original.fazendaId,
    nome: campo(formData, "nome"),
    area: campo(formData, "area"),
    unidade: campo(formData, "unidade"),
  });

  if (!parsed.success) {
    return { ok: false, error: primeiraMensagem(parsed.error) };
  }

  try {
    await prisma.talhao.update({
      where: { id },
      data: {
        nome: parsed.data.nome,
        areaHa: parsed.data.areaHa,
      },
    });
  } catch (e) {
    console.error(e);
    return falha(e);
  }

  revalidatePath("/");
  revalidatePath(`/fazendas/${original.fazendaId}`);
  revalidatePath(`/talhoes/${id}`);
  redirect(`/talhoes/${id}`);
}

export async function excluirTalhao(id: string): Promise<void> {
  let fazendaId: string;
  try {
    const talhao = await prisma.talhao.findUnique({ where: { id } });
    if (!talhao) {
      throw new Error("Talhão não encontrado.");
    }
    fazendaId = talhao.fazendaId;
    await prisma.talhao.delete({ where: { id } });
  } catch (e) {
    console.error(e);
    throw e;
  }
  revalidatePath("/");
  revalidatePath("/fazendas");
  revalidatePath(`/fazendas/${fazendaId}`);
  redirect(`/fazendas/${fazendaId}`);
}

export async function criarColheita(
  prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = colheitaSchema.safeParse({
    talhaoId: campo(formData, "talhaoId"),
    data: campo(formData, "data"),
    tipo: campo(formData, "tipo"),
    toneladas: campo(formData, "toneladas"),
    observacao: campo(formData, "observacao"),
  });

  if (!parsed.success) {
    return { ok: false, error: primeiraMensagem(parsed.error) };
  }

  try {
    const colheita = await prisma.colheita.create({
      data: {
        talhaoId: parsed.data.talhaoId,
        data: new Date(`${parsed.data.data}T12:00:00`),
        tipo: parsed.data.tipo,
        toneladas: parsed.data.toneladas,
        observacao: parsed.data.observacao,
      },
      include: { talhao: true },
    });
    revalidatePath("/");
    revalidatePath("/colheitas");
    revalidatePath(`/talhoes/${colheita.talhaoId}`);
    revalidatePath(`/fazendas/${colheita.talhao.fazendaId}`);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return falha(e);
  }
}

export async function excluirColheita(id: string): Promise<ActionState> {
  try {
    await prisma.colheita.delete({ where: { id } });
  } catch (e) {
    console.error(e);
    return falha(e);
  }
  revalidatePath("/");
  revalidatePath("/colheitas");
  revalidatePath("/talhoes", "layout");
  return { ok: true };
}