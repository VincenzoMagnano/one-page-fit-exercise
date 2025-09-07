import type { HTMLAttributes } from "react";
import { cn } from "./utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-800 bg-neutral-900 p-4 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

