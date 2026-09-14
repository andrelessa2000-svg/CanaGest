import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CanaGest — Gestão de fazendas de cana-de-açúcar",
    short_name: "CanaGest",
    description:
      "Gestão pessoal de fazendas de cana-de-açúcar: talhões, colheitas e finanças.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fafbf8",
    theme_color: "#166534",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["finance", "productivity", "utilities"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Fazendas",
        short_name: "Fazendas",
        url: "/fazendas",
      },
      {
        name: "Nova colheita",
        short_name: "Nova colheita",
        url: "/colheitas/nova",
      },
    ],
  };
}