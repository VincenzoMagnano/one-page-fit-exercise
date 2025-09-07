import type { HTMLAttributes } from "react";
import { cn } from "./utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-200",
        className
      )}
      {...props}
    />
  );
}

