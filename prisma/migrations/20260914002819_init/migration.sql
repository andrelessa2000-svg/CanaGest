-- CreateTable
CREATE TABLE "Fazenda" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fazenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Talhao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tamanhoHectares" DOUBLE PRECISION NOT NULL,
    "observacoes" TEXT,
    "fazendaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Talhao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colheita" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "toneladas" DOUBLE PRECISION NOT NULL,
    "precoPorTonelada" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ctc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "plantioUsina" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "areaTarefasContrato" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contratoToneladasPorTarefa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outrasDespesas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fazendaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Colheita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adubacao" (
    "id" TEXT NOT NULL,
    "colheitaId" TEXT NOT NULL,
    "fazendaId" TEXT NOT NULL,
    "doseSacosPorTarefa" DOUBLE PRECISION NOT NULL DEFAULT 3,
    "pesoSacoKg" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "precoTonelada" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Adubacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdubacaoTalhao" (
    "id" TEXT NOT NULL,
    "adubacaoId" TEXT NOT NULL,
    "talhaoId" TEXT NOT NULL,
    "abrangencia" TEXT NOT NULL DEFAULT 'total',
    "areaTarefas" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "AdubacaoTalhao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Herbicida" (
    "id" TEXT NOT NULL,
    "colheitaId" TEXT NOT NULL,
    "fazendaId" TEXT NOT NULL,
    "custoAplicacao" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "outrosCustos" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Herbicida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HerbicidaTalhao" (
    "id" TEXT NOT NULL,
    "herbicidaId" TEXT NOT NULL,
    "talhaoId" TEXT NOT NULL,
    "abrangencia" TEXT NOT NULL DEFAULT 'total',
    "areaTarefas" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "HerbicidaTalhao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HerbicidaProduto" (
    "id" TEXT NOT NULL,
    "herbicidaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "unidade" TEXT NOT NULL,
    "precoUnitario" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "HerbicidaProduto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Talhao_fazendaId_idx" ON "Talhao"("fazendaId");

-- CreateIndex
CREATE INDEX "Colheita_fazendaId_idx" ON "Colheita"("fazendaId");

-- CreateIndex
CREATE INDEX "Colheita_data_idx" ON "Colheita"("data");

-- CreateIndex
CREATE UNIQUE INDEX "Adubacao_colheitaId_key" ON "Adubacao"("colheitaId");

-- CreateIndex
CREATE INDEX "Adubacao_fazendaId_idx" ON "Adubacao"("fazendaId");

-- CreateIndex
CREATE INDEX "AdubacaoTalhao_adubacaoId_idx" ON "AdubacaoTalhao"("adubacaoId");

-- CreateIndex
CREATE INDEX "AdubacaoTalhao_talhaoId_idx" ON "AdubacaoTalhao"("talhaoId");

-- CreateIndex
CREATE UNIQUE INDEX "Herbicida_colheitaId_key" ON "Herbicida"("colheitaId");

-- CreateIndex
CREATE INDEX "Herbicida_fazendaId_idx" ON "Herbicida"("fazendaId");

-- CreateIndex
CREATE INDEX "HerbicidaTalhao_herbicidaId_idx" ON "HerbicidaTalhao"("herbicidaId");

-- CreateIndex
CREATE INDEX "HerbicidaTalhao_talhaoId_idx" ON "HerbicidaTalhao"("talhaoId");

-- CreateIndex
CREATE INDEX "HerbicidaProduto_herbicidaId_idx" ON "HerbicidaProduto"("herbicidaId");

-- AddForeignKey
ALTER TABLE "Talhao" ADD CONSTRAINT "Talhao_fazendaId_fkey" FOREIGN KEY ("fazendaId") REFERENCES "Fazenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colheita" ADD CONSTRAINT "Colheita_fazendaId_fkey" FOREIGN KEY ("fazendaId") REFERENCES "Fazenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adubacao" ADD CONSTRAINT "Adubacao_colheitaId_fkey" FOREIGN KEY ("colheitaId") REFERENCES "Colheita"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adubacao" ADD CONSTRAINT "Adubacao_fazendaId_fkey" FOREIGN KEY ("fazendaId") REFERENCES "Fazenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdubacaoTalhao" ADD CONSTRAINT "AdubacaoTalhao_adubacaoId_fkey" FOREIGN KEY ("adubacaoId") REFERENCES "Adubacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdubacaoTalhao" ADD CONSTRAINT "AdubacaoTalhao_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "Talhao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Herbicida" ADD CONSTRAINT "Herbicida_colheitaId_fkey" FOREIGN KEY ("colheitaId") REFERENCES "Colheita"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Herbicida" ADD CONSTRAINT "Herbicida_fazendaId_fkey" FOREIGN KEY ("fazendaId") REFERENCES "Fazenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HerbicidaTalhao" ADD CONSTRAINT "HerbicidaTalhao_herbicidaId_fkey" FOREIGN KEY ("herbicidaId") REFERENCES "Herbicida"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HerbicidaTalhao" ADD CONSTRAINT "HerbicidaTalhao_talhaoId_fkey" FOREIGN KEY ("talhaoId") REFERENCES "Talhao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HerbicidaProduto" ADD CONSTRAINT "HerbicidaProduto_herbicidaId_fkey" FOREIGN KEY ("herbicidaId") REFERENCES "Herbicida"("id") ON DELETE CASCADE ON UPDATE CASCADE;
