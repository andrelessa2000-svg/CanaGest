export type AdubacaoTalhaoFinance = {
  abrangencia: string;
  areaTarefas: number;
};

export type AdubacaoFinance = {
  doseSacosPorTarefa: number;
  pesoSacoKg: number;
  precoTonelada: number;
  talhoes: AdubacaoTalhaoFinance[];
};

export type HerbicidaProdutoFinance = {
  quantidade: number;
  precoUnitario: number;
};

export type HerbicidaTalhaoFinance = {
  abrangencia: string;
  areaTarefas: number;
};

export type HerbicidaFinance = {
  custoAplicacao: number;
  outrosCustos: number;
  talhoes: HerbicidaTalhaoFinance[];
  produtos: HerbicidaProdutoFinance[];
};

export type ColheitaFinance = {
  toneladas: number;
  precoPorTonelada: number;
  agio: number;
  ctc: number;
  plantioUsina: number;
  areaTarefasContrato: number;
  contratoToneladasPorTarefa: number;
  outrasDespesas: number;
  adubacao?: AdubacaoFinance | null;
  herbicida?: HerbicidaFinance | null;
};

export function toMoney(value: number | null | undefined): number {
  return Math.round((value ?? 0) * 100) / 100;
}

export function receitaBruta(
  c: Pick<ColheitaFinance, "toneladas" | "precoPorTonelada" | "agio">
): number {
  return toMoney(c.toneladas * (c.precoPorTonelada ?? 0) + (c.agio ?? 0));
}

export function arrendamento(
  c: Pick<
    ColheitaFinance,
    "areaTarefasContrato" | "contratoToneladasPorTarefa" | "precoPorTonelada"
  >
): number {
  return toMoney(
    (c.areaTarefasContrato ?? 0) *
      (c.contratoToneladasPorTarefa ?? 0) *
      (c.precoPorTonelada ?? 0)
  );
}

export function despesasSimples(
  c: Pick<
    ColheitaFinance,
    | "ctc"
    | "plantioUsina"
    | "outrasDespesas"
    | "areaTarefasContrato"
    | "contratoToneladasPorTarefa"
    | "precoPorTonelada"
  >
): number {
  return toMoney(
    (c.ctc ?? 0) + (c.plantioUsina ?? 0) + arrendamento(c) + (c.outrasDespesas ?? 0)
  );
}

export function adubacaoDetalhe(a: AdubacaoFinance | null | undefined) {
  if (!a) {
    return {
      areaTarefas: 0,
      sacos: 0,
      kg: 0,
      toneladas: 0,
      custo: 0,
    };
  }
  const areaTarefas = a.talhoes.reduce((s, t) => s + (t.areaTarefas ?? 0), 0);
  const sacos = areaTarefas * (a.doseSacosPorTarefa ?? 0);
  const kg = sacos * (a.pesoSacoKg ?? 0);
  const toneladas = kg / 1000;
  const custo = toMoney(toneladas * (a.precoTonelada ?? 0));
  return { areaTarefas, sacos, kg, toneladas, custo };
}

export function totalAdubacao(a: AdubacaoFinance | null | undefined): number {
  return adubacaoDetalhe(a).custo;
}

export function herbicidaDetalhe(h: HerbicidaFinance | null | undefined) {
  if (!h) {
    return {
      areaTarefas: 0,
      custoProdutos: 0,
      custoAplicacao: 0,
      outrosCustos: 0,
      custoTotal: 0,
    };
  }
  const custoProdutos = toMoney(
    h.produtos.reduce((s, p) => s + (p.quantidade ?? 0) * (p.precoUnitario ?? 0), 0)
  );
  const custoAplicacao = toMoney(h.custoAplicacao ?? 0);
  const outrosCustos = toMoney(h.outrosCustos ?? 0);
  const custoTotal = toMoney(custoProdutos + custoAplicacao + outrosCustos);
  return {
    areaTarefas: h.talhoes.reduce((s, t) => s + (t.areaTarefas ?? 0), 0),
    custoProdutos,
    custoAplicacao,
    outrosCustos,
    custoTotal,
  };
}

export function totalHerbicida(h: HerbicidaFinance | null | undefined): number {
  return herbicidaDetalhe(h).custoTotal;
}

export function despesasTotais(c: ColheitaFinance): number {
  return toMoney(
    despesasSimples(c) + totalAdubacao(c.adubacao) + totalHerbicida(c.herbicida)
  );
}

export function receitaLiquida(c: ColheitaFinance): number {
  return toMoney(receitaBruta(c) - despesasTotais(c));
}