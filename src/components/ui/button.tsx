import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-text text-white hover:opacity-90",
        variant === "secondary" && "bg-accent text-white hover:opacity-90",
        variant === "ghost" && "bg-transparent text-text hover:bg-white",
        variant === "danger" && "bg-softRed text-text hover:opacity-90",
        className
      )}
      {...props}
    />
  );
}
