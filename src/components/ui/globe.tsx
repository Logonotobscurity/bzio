"use client";

import { cn } from "@/lib/utils";
import { Globe as GlobeIcon } from "lucide-react";

export const Globe = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "relative flex h-80 w-80 items-center justify-center rounded-full bg-gradient-to-b from-primary/10 to-primary/20 p-4",
        className
      )}
    >
      <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20" />
      <div className="absolute inset-4 rounded-full border-2 border-dashed border-primary/30" />
      <div className="absolute inset-8 rounded-full border-2 border-dashed border-primary/40" />

      <GlobeIcon className="h-40 w-40 text-primary/50 opacity-50" />
    </div>
  );
};
