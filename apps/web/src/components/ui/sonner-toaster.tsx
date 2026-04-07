"use client";

import { Toaster } from "sonner";

export function SonnerToaster() {
  return (
    <Toaster
      richColors
      position="top-center"
      toastOptions={{ classNames: { title: "font-medium", description: "text-sm" } }}
    />
  );
}
