"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarIcon,
  CircleDollarSignIcon,
  FlaskConicalIcon,
  LeafIcon,
  Loader2Icon,
  PiggyBankIcon,
  PlusIcon,
  SaveIcon,
  SproutIcon,
  TriangleAlertIcon,
  TruckIcon,
  WalletIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/field";
import {
  MoneyInput,
  SuffixedNumberInput,
  toInputString,
} from "@/components/number-inputs";
import { formatCurrency } from "@/lib/format";
import { formatTarefas, haToTarefas } from "@/lib/area";
import {
  adubacaoDetalhe,
  arrendamento,
  despesasSimples,
  herbicidaDetalhe,
  toMoney,
} from "@/lib/calcs";
import { parseDecimal } from "@/lib/parse-decimal";
import type { ActionResult } from "@/lib/actions";

type FazendaOption = {
  id: string;
  nome: string;
  talhoes: {
    id: string;
    nome: string;
    fazendaId: string;
    tamanhoHectares: number;
  }[];
};

export type AdubacaoTalhaoInitial = {
  talhaoId: string;
  abrangencia: "total" | "parcial";
  areaTarefas: number;
};

export type AdubacaoInitial = {
  fazendaId: string;
  doseSacosPorTarefa: number;
  pesoSacoKg: number;
  precoTonelada: number;
  talhoes: AdubacaoTalhaoInitial[];
};

export type HerbicidaProdutoInitial = {
  nome: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
};

export type HerbicidaInitial = {
  fazendaId: string;
  custoAplicacao: number;
  outrosCustos: number;
  talhoes: AdubacaoTalhaoInitial[];
  produtos: HerbicidaProdutoInitial[];
};

export type ColheitaFormInitial = {
  id?: string;
  fazendaId: string;
  data: string;
  toneladas: number;
  precoPorTonelada: number;
  agio: number;
  ctc: number;
  plantioUsina: number;
  areaTarefasContrato: number;
  contratoToneladasPorTarefa: number;
  outrasDespesas: number;
  adubacao?: AdubacaoInitial | null;
  herbicida?: HerbicidaInitial | null;
};

type TalhaoDraft = {
  talhaoId: string;
  abrangencia: "total" | "parcial";
  areaParcial: string;
};

type ProdutoDraft = {
  nome: string;
  quantidade: string;
  unidade: string;
  precoUnitario: string;
};

const UNIDADES = ["L", "kg", "g", "mL", "un"] as const;

export function ColheitaForm({
  action,
  fazendas,
  preselectedFazendaId,
  initial,
  submitLabel = "Salvar colheita",
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  fazendas: FazendaOption[];
  preselectedFazendaId?: string;
  initial?: ColheitaFormInitial;
  submitLabel?: string;
}) {
  const router = useRouter();

  const [fazendaId, setFazendaId] = useState(
    initial?.fazendaId ?? preselectedFazendaId ?? ""
  );

  const [data, setData] = useState(initial?.data ?? "");
  const [toneladas, setToneladas] = useState(
    initial ? toInputString(initial.toneladas, 1) : ""
  );
  const [preco, setPreco] = useState(
    initial && initial.precoPorTonelada > 0 ? toInputString(initial.precoPorTonelada) : ""
  );
  const [agio, setAgio] = useState(
    initial && initial.agio > 0 ? toInputString(initial.agio) : ""
  );
  const [ctc, setCtc] = useState(initial && initial.ctc > 0 ? toInputString(initial.ctc) : "");
  const [plantioUsina, setPlantioUsina] = useState(
    initial && initial.plantioUsina > 0 ? toInputString(initial.plantioUsina) : ""
  );
  const [areaContrato, setAreaContrato] = useState(
    initial && initial.areaTarefasContrato > 0 ? toInputString(initial.areaTarefasContrato, 1) : ""
  );
  const [tonTarefaContrato, setTonTarefaContrato] = useState(
    initial && initial.contratoToneladasPorTarefa > 0
      ? toInputString(initial.contratoToneladasPorTarefa, 1)
      : ""
  );
  const [outras, setOutras] = useState(
    initial && initial.outrasDespesas > 0 ? toInputString(initial.outrasDespesas) : ""
  );

  /* -------- Adubação -------- */
  const [adubDose, setAdubDose] = useState(
    initial?.adubacao ? toInputString(initial.adubacao.doseSacosPorTarefa, 1) : "3"
  );
  const [adubPeso, setAdubPeso] = useState(
    initial?.adubacao ? toInputString(initial.adubacao.pesoSacoKg, 1) : "50"
  );
  const [adubPreco, setAdubPreco] = useState(
    initial?.adubacao && initial.adubacao.precoTonelada > 0
      ? toInputString(initial.adubacao.precoTonelada)
      : ""
  );
  const [adubTalhoes, setAdubTalhoes] = useState<TalhaoDraft[]>(
    initial?.adubacao
      ? initial.adubacao.talhoes.map((t) => ({
          talhaoId: t.talhaoId,
          abrangencia: t.abrangencia,
          areaParcial: t.abrangencia === "parcial" ? toInputString(t.areaTarefas, 1) : "",
        }))
      : []
  );

  /* -------- Herbicida -------- */
  const [herbTalhoes, setHerbTalhoes] = useState<TalhaoDraft[]>(
    initial?.herbicida
      ? initial.herbicida.talhoes.map((t) => ({
          talhaoId: t.talhaoId,
          abrangencia: t.abrangencia,
          areaParcial: t.abrangencia === "parcial" ? toInputString(t.areaTarefas, 1) : "",
        }))
      : []
  );
  const [herbProdutos, setHerbProdutos] = useState<ProdutoDraft[]>(
    initial?.herbicida
      ? initial.herbicida.produtos.map((p) => ({
          nome: p.nome,
          quantidade: toInputString(p.quantidade, 1),
          unidade: p.unidade,
          precoUnitario: p.precoUnitario > 0 ? toInputString(p.precoUnitario) : "",
        }))
      : []
  );
  const [herbCustoAplicacao, setHerbCustoAplicacao] = useState(
    initial?.herbicida && initial.herbicida.custoAplicacao > 0
      ? toInputString(initial.herbicida.custoAplicacao)
      : ""
  );
  const [herbOutrosCustos, setHerbOutrosCustos] = useState(
    initial?.herbicida && initial.herbicida.outrosCustos > 0
      ? toInputString(initial.herbicida.outrosCustos)
      : ""
  );

  const [state, formAction, pending] = useActionState(action, { success: false });

  useEffect(() => {
    if (state.success) {
      toast.success("Colheita salva com sucesso.");
      router.push(state.redirectTo ?? (fazendaId ? `/fazendas/${fazendaId}` : "/"));
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router, fazendaId]);

  const fazendaSelecionada = fazendas.find((f) => f.id === fazendaId);
  const talhoesDaFazenda = useMemo(
    () => (fazendaSelecionada ? fazendaSelecionada.talhoes : []),
    [fazendaSelecionada]
  );

  function toggleTalhao(
    list: TalhaoDraft[],
    setList: React.Dispatch<React.SetStateAction<TalhaoDraft[]>>,
    talhaoIdSel: string
  ) {
    setList((prev) => {
      if (prev.some((t) => t.talhaoId === talhaoIdSel)) {
        return prev.filter((t) => t.talhaoId !== talhaoIdSel);
      }
      return [
        ...prev,
        {
          talhaoId: talhaoIdSel,
          abrangencia: "total" as const,
          areaParcial: "",
        },
      ];
    });
  }

  function updateTalhao(
    list: TalhaoDraft[],
    setList: React.Dispatch<React.SetStateAction<TalhaoDraft[]>>,
    talhaoIdSel: string,
    patch: Partial<TalhaoDraft>
  ) {
    setList((prev) =>
      prev.map((t) => (t.talhaoId === talhaoIdSel ? { ...t, ...patch } : t))
    );
  }

  const talhaoDraftComArea = useMemo(
    () =>
      (list: TalhaoDraft[]) =>
        list.map((t) => {
          const talhao = talhoesDaFazenda.find((th) => th.id === t.talhaoId);
          const total = talhao ? haToTarefas(talhao.tamanhoHectares) : 0;
          const areaTarefas =
            t.abrangencia === "total"
              ? total
              : Math.min(parseDecimal(t.areaParcial) ?? 0, total);
          return {
            talhaoId: t.talhaoId,
            talhaoNome: talhao?.nome ?? "",
            areaTarefas,
            abrangencia: t.abrangencia,
          };
        }),
    [talhoesDaFazenda]
  );

  const adubacaoDetalhado = useMemo(() => {
    const entrada = talhaoDraftComArea(adubTalhoes);
    const dose = parseDecimal(adubDose) ?? 0;
    const peso = parseDecimal(adubPeso) ?? 0;
    const precoTon = parseDecimal(adubPreco) ?? 0;
    const detalhe = adubacaoDetalhe({
      doseSacosPorTarefa: dose,
      pesoSacoKg: peso,
      precoTonelada: precoTon,
      talhoes: entrada,
    });
    return { entrada, detalhe };
  }, [talhaoDraftComArea, adubTalhoes, adubDose, adubPeso, adubPreco]);

  const herbicidaDetalhado = useMemo(() => {
    const entrada = talhaoDraftComArea(herbTalhoes);
    const produtos = herbProdutos.map((p) => ({
      nome: p.nome,
      quantidade: parseDecimal(p.quantidade) ?? 0,
      unidade: p.unidade,
      precoUnitario: parseDecimal(p.precoUnitario) ?? 0,
    }));
    const detalhe = herbicidaDetalhe({
      custoAplicacao: parseDecimal(herbCustoAplicacao) ?? 0,
      outrosCustos: parseDecimal(herbOutrosCustos) ?? 0,
      talhoes: entrada,
      produtos,
    });
    return { entrada, produtos, detalhe };
  }, [talhaoDraftComArea, herbTalhoes, herbProdutos, herbCustoAplicacao, herbOutrosCustos]);

  const preview = useMemo(() => {
    const t = parseDecimal(toneladas) ?? 0;
    const p = parseDecimal(preco) ?? 0;
    const a = toMoney(parseDecimal(agio) ?? 0);
    const bruta = toMoney(t * p + a);
    const simples = despesasSimples({
      ctc: parseDecimal(ctc) ?? 0,
      plantioUsina: parseDecimal(plantioUsina) ?? 0,
      areaTarefasContrato: parseDecimal(areaContrato) ?? 0,
      contratoToneladasPorTarefa: parseDecimal(tonTarefaContrato) ?? 0,
      precoPorTonelada: p,
      outrasDespesas: parseDecimal(outras) ?? 0,
    });
    const adub = adubacaoDetalhado.detalhe.custo;
    const herb = herbicidaDetalhado.detalhe.custoTotal;
    const despesas = toMoney(simples + adub + herb);
    return {
      bruta,
      arrendamento: arrendamento({
        areaTarefasContrato: parseDecimal(areaContrato) ?? 0,
        contratoToneladasPorTarefa: parseDecimal(tonTarefaContrato) ?? 0,
        precoPorTonelada: p,
      }),
      simples,
      adub,
      herb,
      despesas,
      liquida: toMoney(bruta - despesas),
    };
  }, [toneladas, preco, agio, ctc, plantioUsina, areaContrato, tonTarefaContrato, outras, adubacaoDetalhado, herbicidaDetalhado]);

  const adubacaoJson = useMemo(() => {
    if (adubacaoDetalhado.entrada.length === 0) return "";
    return JSON.stringify({
      fazendaId,
      doseSacosPorTarefa: parseDecimal(adubDose) ?? 0,
      pesoSacoKg: parseDecimal(adubPeso) ?? 0,
      precoTonelada: parseDecimal(adubPreco) ?? 0,
      talhoes: adubacaoDetalhado.entrada.map((t) => ({
        talhaoId: t.talhaoId,
        abrangencia: t.abrangencia,
        areaTarefas: t.areaTarefas,
      })),
    });
  }, [fazendaId, adubDose, adubPeso, adubPreco, adubacaoDetalhado]);

  const herbicidaJson = useMemo(() => {
    if (herbicidaDetalhado.entrada.length === 0 || herbicidaDetalhado.produtos.length === 0) return "";
    return JSON.stringify({
      fazendaId,
      custoAplicacao: parseDecimal(herbCustoAplicacao) ?? 0,
      outrosCustos: parseDecimal(herbOutrosCustos) ?? 0,
      talhoes: herbicidaDetalhado.entrada.map((t) => ({
        talhaoId: t.talhaoId,
        abrangencia: t.abrangencia,
        areaTarefas: t.areaTarefas,
      })),
      produtos: herbicidaDetalhado.produtos,
    });
  }, [fazendaId, herbicidaDetalhado, herbCustoAplicacao, herbOutrosCustos]);

  const canSubmit = !pending && fazendaId.length > 0 && data.length > 0;

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <input type="hidden" name="fazendaId" value={fazendaId} />
      <input type="hidden" name="toneladas" value={toneladas} />
      <input type="hidden" name="precoPorTonelada" value={preco} />
      <input type="hidden" name="agio" value={agio} />
      <input type="hidden" name="ctc" value={ctc} />
      <input type="hidden" name="plantioUsina" value={plantioUsina} />
      <input type="hidden" name="areaTarefasContrato" value={areaContrato} />
      <input type="hidden" name="contratoToneladasPorTarefa" value={tonTarefaContrato} />
      <input type="hidden" name="outrasDespesas" value={outras} />
      <input type="hidden" name="adubacao" value={adubacaoJson} />
      <input type="hidden" name="herbicida" value={herbicidaJson} />
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <div className="space-y-6">
        {/* 1 · Dados da colheita */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <SproutIcon className="size-4 text-primary" />
              1 · Dados da colheita
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Fazenda colhida" hint="A colheita é registrada por fazenda.">
              <Select
                items={fazendas.map((f) => ({ value: f.id, label: f.nome }))}
                value={fazendaId}
                onValueChange={(v) => {
                  setFazendaId(v ?? "");
                  setAdubTalhoes([]);
                  setHerbTalhoes([]);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a fazenda" />
                </SelectTrigger>
                <SelectContent>
                  {fazendas.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Data da colheita">
                <div className="relative">
                  <CalendarIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    required
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="h-11 pl-10 text-base md:text-[15px]"
                  />
                </div>
              </Field>
              <Field label="Produção da fazenda" hint="Toneladas de cana colhidas.">
                <SuffixedNumberInput
                  suffix="t"
                  required
                  value={toneladas}
                  onChange={(e) => setToneladas(e.target.value)}
                  placeholder="0,0"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* 2 · Receita */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <TruckIcon className="size-4 text-primary" />
              2 · Receita
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Preço por tonelada" hint="Valor da tonelada sem o ágio.">
              <MoneyInput
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="0,00"
              />
            </Field>
            <Field label="Ágio" hint="Bônus/preço extra recebido.">
              <MoneyInput
                value={agio}
                onChange={(e) => setAgio(e.target.value)}
                placeholder="0,00"
              />
            </Field>
          </CardContent>
        </Card>

        {/* 3 · Despesas da colheita */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <WalletIcon className="size-4 text-primary" />
              3 · Despesas da colheita
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="CTC" hint="CTC completo fornecido pela usina (inclui corte, transporte e carregamento).">
                <MoneyInput value={ctc} onChange={(e) => setCtc(e.target.value)} placeholder="0,00" />
              </Field>
              <Field label="Plantio / Usina">
                <MoneyInput value={plantioUsina} onChange={(e) => setPlantioUsina(e.target.value)} placeholder="0,00" />
              </Field>
              <Field label="Outras despesas">
                <MoneyInput value={outras} onChange={(e) => setOutras(e.target.value)} placeholder="0,00" />
              </Field>
            </div>

            <div className="space-y-4 rounded-xl border border-border/80 p-4">
              <p className="text-[13px] font-medium text-foreground">
                Arrendamento <span className="text-xs font-normal text-muted-foreground">(calculado: tarefas × ton/tarefa × preço sem ágio)</span>
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tarefas arrendadas">
                  <SuffixedNumberInput
                    suffix="tarefas"
                    value={areaContrato}
                    onChange={(e) => setAreaContrato(e.target.value)}
                    placeholder="0,0"
                  />
                </Field>
                <Field label="Toneladas por tarefa do contrato">
                  <SuffixedNumberInput
                    suffix="t/tarefa"
                    value={tonTarefaContrato}
                    onChange={(e) => setTonTarefaContrato(e.target.value)}
                    placeholder="0,0"
                  />
                </Field>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm font-medium text-foreground">Valor do arrendamento</span>
                <span className="font-bold tabular text-foreground">{formatCurrency(preview.arrendamento)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4 · Adubação da socaria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <LeafIcon className="size-4 text-primary" />
              4 · Adubação da socaria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-lg bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
              Aplicada na mesma fazenda da colheita, selecionando os talhões adubados.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Dose" hint="Sacos por tarefa.">
                <SuffixedNumberInput
                  suffix="sac/tarefa"
                  value={adubDose}
                  onChange={(e) => setAdubDose(e.target.value)}
                  placeholder="3"
                />
              </Field>
              <Field label="Peso do saco" hint="Em quilogramas.">
                <SuffixedNumberInput
                  suffix="kg"
                  value={adubPeso}
                  onChange={(e) => setAdubPeso(e.target.value)}
                  placeholder="50"
                />
              </Field>
              <Field label="Preço por tonelada" hint="Custo do adubo.">
                <MoneyInput
                  value={adubPreco}
                  onChange={(e) => setAdubPreco(e.target.value)}
                  placeholder="0,00"
                />
              </Field>
            </div>

            {talhoesDaFazenda.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                Selecione uma fazenda com talhões cadastrados.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-foreground">Talhões para adubar</p>
                {talhoesDaFazenda.map((t) => {
                  const selecionado = adubTalhoes.find((a) => a.talhaoId === t.id);
                  return (
                    <div
                      key={t.id}
                      className={cn(
                        "rounded-xl border p-3 transition-colors",
                        selecionado ? "border-primary/40 bg-primary/5" : "border-border/80"
                      )}
                    >
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!selecionado}
                          onChange={() => toggleTalhao(adubTalhoes, setAdubTalhoes, t.id)}
                          className="size-4 accent-primary"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{t.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTarefas(haToTarefas(t.tamanhoHectares))} tarefas
                          </p>
                        </div>
                      </label>

                      {selecionado && (
                        <div className="mt-3 grid gap-3 pl-7 sm:grid-cols-2">
                          <div
                            className="grid grid-cols-2 gap-1 rounded-lg border border-input bg-muted/60 p-1"
                            role="group"
                            aria-label="Abrangência da adubação"
                          >
                            <button
                              type="button"
                              onClick={() => updateTalhao(adubTalhoes, setAdubTalhoes, t.id, { abrangencia: "total", areaParcial: "" })}
                              aria-pressed={selecionado.abrangencia === "total"}
                              className={cn(
                                "h-8 rounded-md px-2 text-xs font-medium transition-colors",
                                selecionado.abrangencia === "total"
                                  ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              Todo o talhão
                            </button>
                            <button
                              type="button"
                              onClick={() => updateTalhao(adubTalhoes, setAdubTalhoes, t.id, { abrangencia: "parcial" })}
                              aria-pressed={selecionado.abrangencia === "parcial"}
                              className={cn(
                                "h-8 rounded-md px-2 text-xs font-medium transition-colors",
                                selecionado.abrangencia === "parcial"
                                  ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              Parte do talhão
                            </button>
                          </div>
                          {selecionado.abrangencia === "parcial" && (
                            <SuffixedNumberInput
                              suffix="tarefas"
                              value={selecionado.areaParcial}
                              onChange={(e) =>
                                updateTalhao(adubTalhoes, setAdubTalhoes, t.id, { areaParcial: e.target.value })
                              }
                              placeholder={`0,0 (máx. ${formatTarefas(haToTarefas(t.tamanhoHectares))})`}
                              className="h-10"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Detalhe por talhão */}
            {adubacaoDetalhado.entrada.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-border/80">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/40 text-left text-xs text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Talhão</th>
                      <th className="px-3 py-2 text-right font-medium">Área (tarefas)</th>
                      <th className="px-3 py-2 text-right font-medium">Sacos</th>
                      <th className="px-3 py-2 text-right font-medium">kg</th>
                      <th className="px-3 py-2 text-right font-medium">t</th>
                      <th className="px-3 py-2 text-right font-medium">Custo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {adubacaoDetalhado.entrada.map((t) => {
                      const dose = parseDecimal(adubDose) ?? 0;
                      const peso = parseDecimal(adubPeso) ?? 0;
                      const precoTon = parseDecimal(adubPreco) ?? 0;
                      const sacos = t.areaTarefas * dose;
                      const kg = sacos * peso;
                      const ton = kg / 1000;
                      const custo = toMoney(ton * precoTon);
                      return (
                        <tr key={t.talhaoId}>
                          <td className="px-3 py-2 font-medium text-foreground">{t.talhaoNome}</td>
                          <td className="px-3 py-2 text-right tabular text-muted-foreground">
                            {formatTarefas(t.areaTarefas)}
                          </td>
                          <td className="px-3 py-2 text-right tabular text-muted-foreground">
                            {formatTarefas(sacos)}
                          </td>
                          <td className="px-3 py-2 text-right tabular text-muted-foreground">
                            {formatTarefas(kg)}
                          </td>
                          <td className="px-3 py-2 text-right tabular text-muted-foreground">
                            {formatTarefas(ton)}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold tabular text-foreground">
                            {formatCurrency(custo)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t border-border/80 bg-muted/40">
                    <tr className="text-sm">
                      <td className="px-3 py-2 font-semibold text-foreground" colSpan={2}>
                        Total · {formatTarefas(adubacaoDetalhado.detalhe.areaTarefas)} tarefas
                      </td>
                      <td className="px-3 py-2 text-right font-semibold tabular text-foreground">
                        {formatTarefas(adubacaoDetalhado.detalhe.sacos)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold tabular text-foreground">
                        {formatTarefas(adubacaoDetalhado.detalhe.kg)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold tabular text-foreground">
                        {formatTarefas(adubacaoDetalhado.detalhe.toneladas)}
                      </td>
                      <td className="px-3 py-2 text-right font-bold tabular text-foreground">
                        {formatCurrency(adubacaoDetalhado.detalhe.custo)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 5 · Herbicida */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <FlaskConicalIcon className="size-4 text-primary" />
              5 · Herbicida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-lg bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
              Aplicado na mesma fazenda da colheita, selecionando os talhões tratados.
            </p>

            {talhoesDaFazenda.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                Selecione uma fazenda com talhões cadastrados.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-[13px] font-medium text-foreground">Talhões com aplicação</p>
                {talhoesDaFazenda.map((t) => {
                  const selecionado = herbTalhoes.find((a) => a.talhaoId === t.id);
                  return (
                    <div
                      key={t.id}
                      className={cn(
                        "rounded-xl border p-3 transition-colors",
                        selecionado ? "border-primary/40 bg-primary/5" : "border-border/80"
                      )}
                    >
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!selecionado}
                          onChange={() => toggleTalhao(herbTalhoes, setHerbTalhoes, t.id)}
                          className="size-4 accent-primary"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{t.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTarefas(haToTarefas(t.tamanhoHectares))} tarefas
                          </p>
                        </div>
                      </label>

                      {selecionado && (
                        <div className="mt-3 grid gap-3 pl-7 sm:grid-cols-2">
                          <div
                            className="grid grid-cols-2 gap-1 rounded-lg border border-input bg-muted/60 p-1"
                            role="group"
                            aria-label="Abrangência da aplicação"
                          >
                            <button
                              type="button"
                              onClick={() => updateTalhao(herbTalhoes, setHerbTalhoes, t.id, { abrangencia: "total", areaParcial: "" })}
                              aria-pressed={selecionado.abrangencia === "total"}
                              className={cn(
                                "h-8 rounded-md px-2 text-xs font-medium transition-colors",
                                selecionado.abrangencia === "total"
                                  ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              Aplicação geral
                            </button>
                            <button
                              type="button"
                              onClick={() => updateTalhao(herbTalhoes, setHerbTalhoes, t.id, { abrangencia: "parcial" })}
                              aria-pressed={selecionado.abrangencia === "parcial"}
                              className={cn(
                                "h-8 rounded-md px-2 text-xs font-medium transition-colors",
                                selecionado.abrangencia === "parcial"
                                  ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              Aplicação parcial
                            </button>
                          </div>
                          {selecionado.abrangencia === "parcial" && (
                            <SuffixedNumberInput
                              suffix="tarefas"
                              value={selecionado.areaParcial}
                              onChange={(e) =>
                                updateTalhao(herbTalhoes, setHerbTalhoes, t.id, { areaParcial: e.target.value })
                              }
                              placeholder={`0,0 (máx. ${formatTarefas(haToTarefas(t.tamanhoHectares))})`}
                              className="h-10"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-foreground">Produtos utilizados</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8"
                  onClick={() =>
                    setHerbProdutos((prev) => [
                      ...prev,
                      { nome: "", quantidade: "", unidade: "L", precoUnitario: "" },
                    ])
                  }
                >
                  <PlusIcon className="size-4" />
                  Adicionar produto
                </Button>
              </div>

              {herbProdutos.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
                  Nenhum produto adicionado.
                </p>
              ) : (
                <div className="space-y-2">
                  {herbProdutos.map((p, idx) => (
                    <div
                      key={idx}
                      className="grid gap-2 rounded-xl border border-border/80 p-3 sm:grid-cols-[1fr_110px_90px_120px_36px]"
                    >
                      <Field label="Produto">
                        <Input
                          value={p.nome}
                          onChange={(e) =>
                            setHerbProdutos((prev) =>
                              prev.map((x, i) => (i === idx ? { ...x, nome: e.target.value } : x))
                            )
                          }
                          placeholder="Ex.: Glifosato"
                          className="h-10 text-sm"
                        />
                      </Field>
                      <Field label="Quantidade">
                        <Input
                          inputMode="decimal"
                          value={p.quantidade}
                          onChange={(e) =>
                            setHerbProdutos((prev) =>
                              prev.map((x, i) => (i === idx ? { ...x, quantidade: e.target.value } : x))
                            )
                          }
                          placeholder="0,0"
                          className="h-10 text-right text-sm tabular"
                        />
                      </Field>
                      <Field label="Unidade">
                        <Select
                          items={UNIDADES.map((u) => ({ value: u, label: u }))}
                          value={p.unidade}
                          onValueChange={(v) =>
                            setHerbProdutos((prev) =>
                              prev.map((x, i) => (i === idx ? { ...x, unidade: v ?? "L" } : x))
                            )
                          }
                        >
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIDADES.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Preço unitário">
                        <MoneyInput
                          value={p.precoUnitario}
                          onChange={(e) =>
                            setHerbProdutos((prev) =>
                              prev.map((x, i) => (i === idx ? { ...x, precoUnitario: e.target.value } : x))
                            )
                          }
                          placeholder="0,00"
                          className="h-10"
                        />
                      </Field>
                      <div className="flex items-end justify-center pb-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remover produto"
                          onClick={() =>
                            setHerbProdutos((prev) => prev.filter((_, i) => i !== idx))
                          }
                        >
                          <XIcon className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Custo de aplicação">
                <MoneyInput
                  value={herbCustoAplicacao}
                  onChange={(e) => setHerbCustoAplicacao(e.target.value)}
                  placeholder="0,00"
                />
              </Field>
              <Field label="Outros custos">
                <MoneyInput
                  value={herbOutrosCustos}
                  onChange={(e) => setHerbOutrosCustos(e.target.value)}
                  placeholder="0,00"
                />
              </Field>
            </div>

            {herbProdutos.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-border/80">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/40 text-left text-xs text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Produto</th>
                      <th className="px-3 py-2 text-right font-medium">Qtd</th>
                      <th className="px-3 py-2 text-right font-medium">Unit.</th>
                      <th className="px-3 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {herbicidaDetalhado.produtos.map((p, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 font-medium text-foreground">{p.nome || "—"}</td>
                        <td className="px-3 py-2 text-right tabular text-muted-foreground">
                          {formatTarefas(p.quantidade)} {p.unidade}
                        </td>
                        <td className="px-3 py-2 text-right tabular text-muted-foreground">
                          {formatCurrency(p.precoUnitario)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium tabular text-foreground">
                          {formatCurrency(p.quantidade * p.precoUnitario)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-border/80 bg-muted/40">
                    <tr className="text-sm">
                      <td className="px-3 py-2 font-semibold text-foreground" colSpan={3}>
                        Custo dos produtos · {formatTarefas(herbicidaDetalhado.detalhe.areaTarefas)} tarefas
                      </td>
                      <td className="px-3 py-2 text-right font-bold tabular text-foreground">
                        {formatCurrency(herbicidaDetalhado.detalhe.custoProdutos)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {herbicidaDetalhado.detalhe.custoTotal > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-primary/5 px-4 py-3 ring-1 ring-primary/20">
                <span className="text-sm font-medium text-foreground">Total do herbicida</span>
                <span className="text-lg font-bold tabular text-foreground">
                  {formatCurrency(herbicidaDetalhado.detalhe.custoTotal)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 6 · Resumo financeiro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CircleDollarSignIcon className="size-4 text-primary" />
              6 · Resumo financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            <ResumoRow label="Receita bruta" value={formatCurrency(preview.bruta)} tone="neutral" />
            <ResumoRow label="CTC (completo)" value={formatCurrency(parseDecimal(ctc) ?? 0)} tone="negative" />
            <ResumoRow label="Plantio / Usina" value={formatCurrency(parseDecimal(plantioUsina) ?? 0)} tone="negative" />
            <ResumoRow label="Arrendamento" value={formatCurrency(preview.arrendamento)} tone="negative" />
            <ResumoRow label="Adubação" value={formatCurrency(preview.adub)} tone="negative" />
            <ResumoRow label="Herbicida" value={formatCurrency(preview.herb)} tone="negative" />
            <ResumoRow label="Outras despesas" value={formatCurrency(parseDecimal(outras) ?? 0)} tone="negative" />
            <ResumoRow
              label="Total de despesas"
              value={formatCurrency(preview.despesas)}
              tone="negative"
              bold
            />
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 sm:col-span-2">
              <span className="text-sm font-semibold text-foreground">Resultado líquido</span>
              <span
                className={`text-lg font-bold tabular ${
                  preview.liquida >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                }`}
              >
                {formatCurrency(preview.liquida)}
              </span>
            </div>
          </CardContent>
        </Card>

        {!state.success && state.message && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
            {state.message}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={!canSubmit} className="h-10 px-5">
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
      </div>

      {/* Sticky summary */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <Card className="gap-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CircleDollarSignIcon className="size-4 text-primary" />
              Resultado da colheita
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 divide-y divide-border/70">
            <SummaryRow icon={TruckIcon} label="Receita bruta" value={formatCurrency(preview.bruta)} tone="neutral" />
            <SummaryRow icon={WalletIcon} label="Despesas simples" value={formatCurrency(preview.simples)} tone="negative" />
            <SummaryRow icon={LeafIcon} label="Adubação" value={formatCurrency(preview.adub)} tone="negative" />
            <SummaryRow icon={FlaskConicalIcon} label="Herbicida" value={formatCurrency(preview.herb)} tone="negative" />
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-muted-foreground">Total de despesas</span>
              <span className="font-semibold tabular text-foreground">{formatCurrency(preview.despesas)}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <PiggyBankIcon className="size-4 text-primary" />
                Resultado líquido
              </span>
              <span
                className={`tabular text-base font-semibold ${
                  preview.liquida >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                }`}
              >
                {formatCurrency(preview.liquida)}
              </span>
            </div>
          </CardContent>
        </Card>
        <p className="mt-3 hidden text-xs leading-relaxed text-muted-foreground lg:block">
          Receita bruta = (toneladas × preço) + ágio.
          <br />
          Despesas simples = CTC + plantio/usina + arrendamento + outras.
          <br />
          Arrendamento = tarefas × ton/tarefa × preço sem ágio.
          <br />
          Resultado = bruta − despesas simples − adubação − herbicida.
        </p>
      </div>
    </form>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: "neutral" | "negative";
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon
          className={
            tone === "negative"
              ? "size-4 text-destructive/80"
              : "size-4 text-emerald-600 dark:text-emerald-400"
          }
        />
        {label}
      </span>
      <span
        className={`tabular text-[15px] font-medium ${
          tone === "negative" ? "text-destructive" : "text-foreground"
        }`}
      >
        − {value}
      </span>
    </div>
  );
}

function ResumoRow({
  label,
  value,
  tone,
  bold,
}: {
  label: string;
  value: string;
  tone: "neutral" | "negative";
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`tabular ${bold ? "font-bold" : "font-semibold"} ${
          tone === "negative" ? "text-destructive" : "text-foreground"
        }`}
      >
        − {value}
      </span>
    </div>
  );
}