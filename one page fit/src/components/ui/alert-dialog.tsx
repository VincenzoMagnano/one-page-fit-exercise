import { useId } from "react";
import { Button } from "./button";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  cancelText?: string;
  actionText?: string;
  onCancel: () => void;
  onAction: () => void;
};

export function AlertDialog({
  open,
  title,
  description,
  cancelText = "Cancel",
  actionText = "Confirm",
  onCancel,
  onAction,
}: Props) {
  const titleId = useId();
  const descId = useId();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900 p-4 shadow-lg m-4"
      >
        <h2 id={titleId} className="text-base font-semibold text-neutral-100">
          {title}
        </h2>
        {description ? (
          <p id={descId} className="mt-2 text-sm text-neutral-300">
            {description}
          </p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      </div>
    </div>
  );
}

