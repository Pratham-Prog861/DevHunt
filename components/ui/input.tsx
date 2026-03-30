import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-[1.35rem] border border-border/80 bg-background/80 px-4 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
