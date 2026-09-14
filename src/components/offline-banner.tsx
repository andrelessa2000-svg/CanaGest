"use client";

import { useOffline } from "next/offline";
import { WifiOffIcon } from "lucide-react";

export function OfflineBanner() {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center px-4 pt-3">
      <div
        role="status"
        className="pointer-events-auto flex items-center gap-2 rounded-full border border-dashed bg-popover/95 px-3.5 py-1.5 text-xs font-medium text-popover-foreground shadow-sm backdrop-blur"
      >
        <WifiOffIcon className="size-3.5 text-muted-foreground" />
        Você está offline. As alterações serão aplicadas quando a conexão voltar.
      </div>
    </div>
  );
}