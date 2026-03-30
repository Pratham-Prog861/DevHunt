import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-32 w-full rounded-[1.7rem] border border-border/80 bg-background/80 px-4 py-3 text-sm leading-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
