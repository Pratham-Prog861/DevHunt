import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const fieldControlClassName =
  "w-full border border-border/80 bg-background/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2";

export const fieldSelectClassName = cn(
  fieldControlClassName,
  "h-12 rounded-[1.35rem] px-4 text-sm",
);

type AccessibleFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  srOnlyLabel?: boolean;
  className?: string;
  children: ReactNode;
};

export function AccessibleField({
  id,
  label,
  error,
  hint,
  srOnlyLabel = false,
  className,
  children,
}: AccessibleFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className={cn(
          "text-sm font-medium tracking-[-0.01em] text-foreground",
          srOnlyLabel && "sr-only",
        )}
      >
        {label}
      </label>
      {children}
      {hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
