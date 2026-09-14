"use client";

import { useEffect, useState } from "react";
import { MonitorDownIcon } from "lucide-react";

import { cn } from "cn";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [state, setState] = useState<"idle" | "prompting" | "handled">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setState("handled");
      setDeferred(null);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (state === "handled" || !deferred) return null;

  const handleInstall = () => {
    setState("prompting");
    void deferred.prompt().finally(() => setState("idle"));
    setDeferred(null);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleInstall}
        disabled={state === "prompting"}
        aria-label="Instalar aplicativo"
        title="Instalar aplicativo"
        className={cn(
          "flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          className
        )}
      >
        <MonitorDownIcon className="size-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      disabled={state === "prompting"}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-muted",
        className
      )}
    >
      <MonitorDownIcon className="size-4 text-primary" />
      Instalar aplicativo
    </button>
  );
}