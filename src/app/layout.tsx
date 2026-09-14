import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { OfflineBanner } from "@/components/offline-banner";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa-register";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "CanaGest — Gestão de fazendas de cana-de-açúcar",
    template: "%s · CanaGest",
  },
  description:
    "Gestão pessoal de fazendas de cana-de-açúcar: talhões, colheitas e finanças em um só lugar.",
  applicationName: "CanaGest",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CanaGest",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafbf8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1512" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-svh`}>
        <Providers>
          <AppShell>
            <OfflineBanner />
            {children}
          </AppShell>
          <Toaster richColors position="top-center" />
          <PwaRegister />
        </Providers>
      </body>
    </html>
  );
}