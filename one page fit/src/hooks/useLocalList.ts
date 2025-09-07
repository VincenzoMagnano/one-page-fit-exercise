import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Item } from "../types";
import { LOCAL_STORAGE_KEY } from "../types";

type AddPayload = Omit<Item, "id">;

function parseInitial(): Item[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x.id === "string" && typeof x.exercise === "string");
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
    const hasAny = (payload.exercise?.trim() ?? "") || (payload.reps?.trim() ?? "") || (payload.restSec ?? "") !== "";
    if (!hasAny) return; // ignore empty add
    setItems((prev) => [
      ...prev,
      {
        id: generateId(),
        exercise: payload.exercise ?? "",
        series: typeof (payload as any).series === "number" ? (payload as any).series : undefined,
        reps: payload.reps || (payload.reps === "" ? undefined : undefined),
        weight: typeof (payload as any).weight === "number" ? (payload as any).weight : undefined,
        restSec: typeof payload.restSec === "number" ? payload.restSec : undefined,
      },
    ]);
  }, []);

  const update = useCallback((id: string, patch: Partial<Omit<Item, "id">>) => {
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

