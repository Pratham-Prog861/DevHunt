import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost";
};

export function Button({
  className,
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold tracking-[-0.01em] shadow-[0_10px_25px_-20px_rgba(10,20,50,0.7)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "default" &&
          "bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-[0_18px_35px_-20px_rgba(54,76,191,0.75)]",
        variant === "secondary" &&
          "border border-border/70 bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/80",
        variant === "outline" &&
          "border border-border/80 bg-background/80 text-foreground backdrop-blur-sm hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground",
        variant === "ghost" &&
          "bg-transparent text-foreground shadow-none hover:bg-accent/70 hover:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}
