import { useMemo, useRef, useState } from "react";
import type React from "react";
import { useLocalList } from "./hooks/useLocalList";
import type { Item } from "./types";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card } from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Separator } from "./components/ui/separator";
import { AlertDialog } from "./components/ui/alert-dialog";
import { X } from "lucide-react";

function App() {
  const { items, add, update, remove, clearAll, duplicateLast } = useLocalList();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(true);
  const [composer, setComposer] = useState<{ exercise: string; series: string; reps: string; weight: string; restSec: string }>({
    exercise: "",
    series: "",
    reps: "",
    weight: "",
    restSec: "",
  });
  const exerciseRef = useRef<HTMLInputElement | null>(null);

  const parsedRest = useMemo(() => {
    const trimmed = composer.restSec.trim();
    if (trimmed === "") return undefined;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
  }, [composer.restSec]);

  const parsedSeries = useMemo(() => {
    const t = composer.series.trim();
    if (t === "") return undefined;
    const n = Number(t);
    return Number.isFinite(n) ? n : undefined;
  }, [composer.series]);

  const parsedWeight = useMemo(() => {
    const t = composer.weight.trim();
    if (t === "") return undefined;
    const n = Number(t);
    return Number.isFinite(n) ? n : undefined;
  }, [composer.weight]);

  function handleAdd() {
    const payload = {
      exercise: composer.exercise.trim(),
      series: parsedSeries,
      reps: composer.reps.trim() || undefined,
      weight: parsedWeight,
      restSec: parsedRest,
    } satisfies Omit<Item, "id">;
    if (!payload.exercise && !payload.reps && payload.restSec === undefined) return;
    add(payload);
    // keep composer values, refocus exercise
    exerciseRef.current?.focus();
  }

  function handleEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  const repsChips = ["×5", "×8", "×10", "AMRAP"];
  const restChips = [60, 90, 120];

  return (
    <div className="min-h-full flex flex-col items-center">
      <div className="w-full max-w-screen-sm flex-1 pb-[calc(96px+var(--safe-bottom))]">
        <header className="sticky top-0 z-10 bg-neutral-950/80 backdrop-blur border-b border-neutral-800">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="font-semibold">Gym TODO</div>
            <div className="flex items-center gap-2">
              <Badge>{items.length} items</Badge>
              <Button variant="secondary" onClick={duplicateLast}>Duplicate last</Button>
              <Button variant="destructive" onClick={() => setConfirmOpen(true)}>Clear all</Button>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-3">
          {items.map((it) => (
            <Card key={it.id} className="flex items-center gap-3">
              <div className="grid grid-cols-6 sm:grid-cols-5 gap-2 flex-1">
                <Input
                  className="col-span-6 sm:col-span-1"
                  value={it.exercise}
                  placeholder="Exercise"
                  onChange={(e) => update(it.id, { exercise: e.target.value })}
                />
                <Input
                  className="col-span-3 sm:col-span-1"
                  value={it.series?.toString() ?? ""}
                  inputMode="numeric"
                  placeholder="Series"
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    if (v === "") return update(it.id, { series: undefined });
                    const n = Number(v);
                    if (Number.isFinite(n)) update(it.id, { series: n });
                  }}
                />
                <Input
                  className="col-span-3 sm:col-span-1"
                  value={it.reps ?? ""}
                  placeholder="Reps"
                  onChange={(e) => update(it.id, { reps: e.target.value })}
                />
                <Input
                  className="col-span-3 sm:col-span-1"
                  value={it.weight?.toString() ?? ""}
                  inputMode="numeric"
                  placeholder="Weight"
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    if (v === "") return update(it.id, { weight: undefined });
                    const n = Number(v);
                    if (Number.isFinite(n)) update(it.id, { weight: n });
                  }}
                />
                <Input
                  className="col-span-3 sm:col-span-1"
                  value={it.restSec?.toString() ?? ""}
                  inputMode="numeric"
                  placeholder="Rest (s)"
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    if (v === "") return update(it.id, { restSec: undefined });
                    const n = Number(v);
                    if (Number.isFinite(n)) update(it.id, { restSec: n });
                  }}
                />
              </div>
              <Button aria-label="Delete" variant="ghost" size="icon" onClick={() => remove(it.id)}>
                <X className="h-5 w-5" />
              </Button>
            </Card>
          ))}
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-20 bg-neutral-950/95 backdrop-blur border-t border-neutral-800">
        <div className="mx-auto w-full max-w-screen-sm p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-300">Composer</div>
            <Button variant="secondary" onClick={() => setComposerOpen((v) => !v)}>
              {composerOpen ? "Nascondi" : "Mostra"}
            </Button>
          </div>
          {composerOpen && (
          <div className="grid grid-cols-4 sm:grid-cols-[1fr_72px_92px_92px_92px_48px] gap-2">
            <Input
              ref={exerciseRef}
              className="col-span-4 sm:col-span-1"
              value={composer.exercise}
              placeholder="Exercise"
              onChange={(e) => setComposer((s) => ({ ...s, exercise: e.target.value }))}
              onKeyDown={handleEnter}
            />
            <Input
              className="col-span-2 sm:col-span-1"
              value={composer.series}
              inputMode="numeric"
              placeholder="Series"
              onChange={(e) => setComposer((s) => ({ ...s, series: e.target.value }))}
              onKeyDown={handleEnter}
            />
            <Input
              className="col-span-2 sm:col-span-1"
              value={composer.reps}
              placeholder="Reps"
              onChange={(e) => setComposer((s) => ({ ...s, reps: e.target.value }))}
              onKeyDown={handleEnter}
            />
            <Input
              className="col-span-2 sm:col-span-1"
              value={composer.weight}
              inputMode="numeric"
              placeholder="Weight"
              onChange={(e) => setComposer((s) => ({ ...s, weight: e.target.value }))}
              onKeyDown={handleEnter}
            />
            <Input
              className="col-span-2 sm:col-span-1"
              value={composer.restSec}
              inputMode="numeric"
              placeholder="Rest (s)"
              onChange={(e) => setComposer((s) => ({ ...s, restSec: e.target.value }))}
              onKeyDown={handleEnter}
            />
            <Button className="col-span-4 sm:col-span-1" onClick={handleAdd}>Add</Button>
          </div>
          )}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-neutral-400">Reps:</span>
            {repsChips.map((r) => (
              <Button key={r} size="sm" variant="ghost" onClick={() => setComposer((s) => ({ ...s, reps: r }))}>
                {r}
              </Button>
            ))}
            <Separator />
            <span className="text-neutral-400">Rest:</span>
            {restChips.map((r) => (
              <Button key={r} size="sm" variant="ghost" onClick={() => setComposer((s) => ({ ...s, restSec: String(r) }))}>
                {r}s
              </Button>
            ))}
          </div>
          <div className="pb-[calc(12px+var(--safe-bottom))]" />
        </div>
      </footer>

      <AlertDialog
        open={confirmOpen}
        title="Clear all items?"
        description="This action cannot be undone."
        cancelText="Cancel"
        actionText="Clear"
        onCancel={() => setConfirmOpen(false)}
        onAction={() => {
          clearAll();
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}

export default App;
