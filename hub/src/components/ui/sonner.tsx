"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "rounded-lg border border-border bg-card text-card-foreground shadow-soft",
          description: "text-muted-foreground",
          success: "text-success",
          error: "text-destructive",
        },
      }}
    />
  );
}
