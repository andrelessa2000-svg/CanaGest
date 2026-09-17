import "dotenv/config";
import { defineConfig } from "prisma/config";

// No build da Vercel (postinstall -> prisma generate) as variáveis de ambiente
// ainda podem não existir. O `prisma generate` não precisa do banco, então
// usamos um placeholder para não falhar. Localmente o .env traz a URL real.
const datasourceUrl =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_URL ??
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: datasourceUrl,
  },
});