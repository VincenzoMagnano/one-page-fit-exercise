import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "./utils";

type Props = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md bg-neutral-900 border border-neutral-800 px-3 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600",
        className
      )}
      {...props}
    />
  );
});

