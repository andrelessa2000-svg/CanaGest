"use client";

import { useState, useTransition } from "react";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ActionResult } from "@/lib/actions";

export function DeleteDialog({
  action,
  id,
  title,
  description,
  children,
  confirmLabel = "Excluir",
  successMessage = "Excluído com sucesso.",
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  id: string;
  title: string;
  description: string;
  children: React.ReactElement;
  confirmLabel?: string;
  successMessage?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      const result = await action(formData);
      if (result.success) {
        toast.success(result.message ?? successMessage);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message ?? "Não foi possível excluir.");
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={children} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2Icon className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={pending}
            variant="destructive"
          >
            {pending && <Loader2Icon className="size-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}