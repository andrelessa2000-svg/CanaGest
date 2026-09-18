import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL não definida no ambiente.");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const tipos = ["planta", "soca", "ressoca"];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const fazendas = [
    { nome: "Fazenda Boa Vista" },
    { nome: "Fazenda Santa Clara" },
    { nome: "Fazenda São José" },
  ];

  for (const def of fazendas) {
    const fazenda = await prisma.fazenda.create({
      data: {
        nome: def.nome,
      },
    });

    const qtdTalhoes = randInt(4, 7);
    for (let t = 1; t <= qtdTalhoes; t++) {
      const areaHa = randInt(18, 70) + Math.round(Math.random() * 10) / 10;
      const talhao = await prisma.talhao.create({
        data: {
          fazendaId: fazenda.id,
          nome: `T-${String(t).padStart(2, "0")}`,
          areaHa,
        },
      });

      const qtdColheitas = randInt(2, 5);
      for (let c = 0; c < qtdColheitas; c++) {
        const diasAtras = c * randInt(380, 430) + randInt(0, 120);
        const produtividade = randInt(78, 112) + Math.round(Math.random() * 10) / 10;
        await prisma.colheita.create({
          data: {
            talhaoId: talhao.id,
            data: new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000),
            tipo: tipos[c] ?? "ressoca",
            toneladas: Math.round(areaHa * produtividade * 10) / 10,
          },
        });
      }
    }
  }

  console.log("Seed concluído. Fazendas, talhões e colheitas criados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });