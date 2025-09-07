import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ExerciseItem, Item, SectionItem } from "../types";
import { LOCAL_STORAGE_KEY } from "../types";

type AddPayload = Omit<ExerciseItem, "id"> | Omit<SectionItem, "id">;

function parseInitial(): Item[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Backward compatibility: old entries were exercises without `type`
    const normalized = (parsed as any[])
      .map((x: any) => {
        if (x && typeof x === "object" && typeof x.id === "string") {
          if (x.type === "section" && typeof x.title === "string") {
            return { type: "section", id: x.id, title: x.title } as SectionItem;
          }
          // treat as exercise item
          if (typeof x.exercise === "string") {
            return {
              type: "exercise",
              id: x.id,
              exercise: x.exercise ?? "",
              series: typeof x.series === "number" ? x.series : undefined,
              reps: typeof x.reps === "string" ? x.reps : undefined,
              weight: typeof x.weight === "number" ? x.weight : undefined,
              restSec: typeof x.restSec === "number" ? x.restSec : undefined,
            } as ExerciseItem;
          }
        }
        return null;
      })
      .filter((v): v is Item => v !== null);
    return normalized;
  } catch {
    return [];
  }
}

function generateId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  const random = Math.floor(Math.random() * 1e9).toString(36);
  return `${Date.now().toString(36)}-${random}`;
}

export function useLocalList() {
  const [items, setItems] = useState<Item[]>(() => parseInitial());
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      return;
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore persistence errors
    }
  }, [items]);

  const add = useCallback((payload: AddPayload) => {
    if ((payload as any).type === "section") {
      const title = (payload as SectionItem).title?.trim() ?? "";
      if (!title) return;
      setItems((prev) => [...prev, { type: "section", id: generateId(), title }]);
      return;
    }
    const ex = payload as ExerciseItem;
    const hasAny = (ex.exercise?.trim() ?? "") || (ex.reps?.trim() ?? "") || (ex.restSec ?? "") !== "";
    if (!hasAny) return; // ignore empty add
    setItems((prev) => [
      ...prev,
      {
        type: "exercise",
        id: generateId(),
        exercise: ex.exercise ?? "",
        series: typeof ex.series === "number" ? ex.series : undefined,
        reps: ex.reps || (ex.reps === "" ? undefined : undefined),
        weight: typeof ex.weight === "number" ? ex.weight : undefined,
        restSec: typeof ex.restSec === "number" ? ex.restSec : undefined,
      },
    ]);
  }, []);

  const update = useCallback((id: string, patch: any) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const duplicateLast = useCallback(() => {
    setItems((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const copy: Item = { ...last, id: generateId() };
      return [...prev, copy];
    });
  }, []);

  return useMemo(
    () => ({ items, add, update, remove, clearAll, duplicateLast }),
    [items, add, update, remove, clearAll, duplicateLast]
  );
}

