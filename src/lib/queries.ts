import { prisma } from "@/lib/db";
import {
  despesasSimples,
  despesasTotais,
  receitaBruta,
  receitaLiquida,
  totalAdubacao,
  totalHerbicida,
} from "@/lib/calcs";
import type { Adubacao, Colheita, Herbicida } from "@/generated/prisma/client";

export const colheitaInclude = {
  fazenda: { include: { talhoes: true } },
  adubacao: { include: { talhoes: true } },
  herbicida: { include: { talhoes: true, produtos: true } },
} as const;

export type ColheitaFinanceiro = Colheita & {
  fazenda: { id: string; nome: string };
  adubacao?: (Adubacao & { talhoes: { abrangencia: string; areaTarefas: number }[] }) | null;
  herbicida?: (Herbicida & {
    talhoes: { abrangencia: string; areaTarefas: number }[];
    produtos: { quantidade: number; precoUnitario: number }[];
  }) | null;
};

export type ColheitaComCalculos = ColheitaFinanceiro & {
  receitaBruta: number;
  despesasSimples: number;
  totalAdubacao: number;
  totalHerbicida: number;
  despesas: number;
  receitaLiquida: number;
};

export function colheitaComCalculos(c: ColheitaFinanceiro): ColheitaComCalculos {
  const bruta = receitaBruta(c);
  const despesasSimplesTotal = despesasSimples(c);
  const adubacaoTotal = totalAdubacao(c.adubacao);
  const herbicidaTotal = totalHerbicida(c.herbicida);
  const despesas = despesasTotais(c);
  return {
    ...c,
    receitaBruta: bruta,
    despesasSimples: despesasSimplesTotal,
    totalAdubacao: adubacaoTotal,
    totalHerbicida: herbicidaTotal,
    despesas,
    receitaLiquida: bruta - despesas,
  };
}

export async function getDashboardData() {
  const [fazendas, colheitas] = await Promise.all([
    prisma.fazenda.findMany({
      orderBy: { createdAt: "asc" },
      include: { talhoes: true },
    }),
    prisma.colheita.findMany({
      orderBy: { data: "desc" },
      include: colheitaInclude,
    }),
  ]);

  const areaTotal = fazendas.reduce(
    (sum, f) => sum + f.talhoes.reduce((s, t) => s + t.tamanhoHectares, 0),
    0
  );

  const comCalculos = colheitas.map(colheitaComCalculos);

  const toneladasTotal = comCalculos.reduce((s, c) => s + c.toneladas, 0);
  const receitaBrutaTotal = comCalculos.reduce((s, c) => s + c.receitaBruta, 0);
  const despesasTotal = comCalculos.reduce((s, c) => s + c.despesas, 0);
  const receitaLiquidaTotal = comCalculos.reduce((s, c) => s + c.receitaLiquida, 0);

  return {
    totalFazendas: fazendas.length,
    totalTalhoes: fazendas.reduce((s, f) => s + f.talhoes.length, 0),
    areaTotal,
    colheitasRecentes: comCalculos
      .slice(0, 6)
      .map((c) => ({
        id: c.id,
        data: c.data,
        toneladas: c.toneladas,
        receitaLiquida: c.receitaLiquida,
        fazendaNome: c.fazenda.nome,
        fazendaId: c.fazenda.id,
      })),
    fazendasResumo: fazendas.map((f) => ({
      id: f.id,
      nome: f.nome,
      areaTotal: f.talhoes.reduce((s, t) => s + t.tamanhoHectares, 0),
      talhaoCount: f.talhoes.length,
      receitaLiquida: colheitas
        .filter((c) => c.fazendaId === f.id)
        .reduce((s, c) => s + receitaLiquida(c), 0),
    })),
    totais: {
      toneladas: toneladasTotal,
      receitaBruta: receitaBrutaTotal,
      despesas: despesasTotal,
      receitaLiquida: receitaLiquidaTotal,
    },
  };
}

export async function getFazendaSummaries() {
  const fazendas = await prisma.fazenda.findMany({
    orderBy: { createdAt: "asc" },
    include: { talhoes: true, colheitas: { include: colheitaInclude } },
  });

  return fazendas.map((f) => {
    const comCalculos = f.colheitas.map(colheitaComCalculos);
    return {
      id: f.id,
      nome: f.nome,
      createdAt: f.createdAt,
      talhaoCount: f.talhoes.length,
      areaTotal: f.talhoes.reduce((s, t) => s + t.tamanhoHectares, 0),
      toneladasTotal: comCalculos.reduce((s, c) => s + c.toneladas, 0),
      colheitaCount: comCalculos.length,
      receitaLiquida: comCalculos.reduce((s, c) => s + c.receitaLiquida, 0),
    };
  });
}

export async function getFazendaDetail(id: string) {
  const fazenda = await prisma.fazenda.findUnique({
    where: { id },
    include: {
      talhoes: { orderBy: { createdAt: "asc" } },
      colheitas: { orderBy: { data: "desc" }, include: colheitaInclude },
    },
  });
  if (!fazenda) return null;

  const comCalculos = fazenda.colheitas.map(colheitaComCalculos);

  const resumo = {
    areaTotal: fazenda.talhoes.reduce((s, t) => s + t.tamanhoHectares, 0),
    receitaBruta: comCalculos.reduce((s, c) => s + c.receitaBruta, 0),
    despesas: comCalculos.reduce((s, c) => s + c.despesas, 0),
    receitaLiquida: comCalculos.reduce((s, c) => s + c.receitaLiquida, 0),
    toneladas: comCalculos.reduce((s, c) => s + c.toneladas, 0),
  };

  const talhoes = fazenda.talhoes.map((t) => ({
    id: t.id,
    nome: t.nome,
    tamanhoHectares: t.tamanhoHectares,
    observacoes: t.observacoes,
  }));

  return { fazenda, resumo, talhoes, colheitasRecentes: comCalculos.slice(0, 5) };
}

export async function getTalhaoDetail(id: string) {
  const talhao = await prisma.talhao.findUnique({
    where: { id },
    include: { fazenda: true },
  });
  if (!talhao) return null;

  return { talhao };
}

export async function getColheitaForEdit(id: string) {
  const colheita = await prisma.colheita.findUnique({
    where: { id },
    include: colheitaInclude,
  });
  if (!colheita) return null;

  return {
    colheita,
    fazendas: await getFazendaOptions(),
  };
}

export async function getFazendaOptions() {
  const fazendas = await prisma.fazenda.findMany({
    orderBy: { nome: "asc" },
    include: { talhoes: { orderBy: { nome: "asc" } } },
  });
  return fazendas.map((f) => ({
    id: f.id,
    nome: f.nome,
    talhoes: f.talhoes.map((t) => ({
      id: t.id,
      nome: t.nome,
      fazendaId: f.id,
      tamanhoHectares: t.tamanhoHectares,
    })),
  }));
}