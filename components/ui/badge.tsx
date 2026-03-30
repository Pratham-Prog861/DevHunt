import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border/80 bg-background/75 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}
