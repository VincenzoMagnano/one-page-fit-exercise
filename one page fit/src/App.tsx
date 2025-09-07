import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { useLocalList } from "./hooks/useLocalList";
import type { ExerciseItem, SectionItem, Item } from "./types";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card } from "./components/ui/card";
import { AlertDialog } from "./components/ui/alert-dialog";
import { X, ChevronDown, Plus, Menu } from "lucide-react";

function App() {
  const { items, add, update, remove, clearAll, duplicateLast, setItems } = useLocalList();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [openById, setOpenById] = useState<Record<string, boolean>>({});
  const [headerHidden, setHeaderHidden] = useState(false);
  const [composer, setComposer] = useState<{ exercise: string; series: string; reps: string; weight: string; restSec: string }>({
    exercise: "",
    series: "",
    reps: "",
    weight: "",
    restSec: "",
  });
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number; type: 'exercise' | 'section' } | null>(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [burgerMenuOpen, setBurgerMenuOpen] = useState(false);
  const [burgerMenuVisible, setBurgerMenuVisible] = useState(false);
  const exerciseRef = useRef<HTMLInputElement | null>(null);
  const lastScrollYRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Hide header on scroll down, show on scroll up
  useEffect(() => {
    function onScroll() {
      const run = () => {
        rafRef.current = null;
        const y = window.scrollY || 0;
        const last = lastScrollYRef.current || 0;
        const delta = y - last;
        lastScrollYRef.current = y;
        if (y <= 8) return setHeaderHidden(false);
        if (delta > 2) setHeaderHidden(true); // scrolling down
        else if (delta < -2) setHeaderHidden(false); // scrolling up
      };
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(run);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    function handleClickOutside() {
      closeContextMenu();
    }
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Close burger menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // Don't close if clicking on the burger menu button or the dropdown itself
      if (target.closest('[data-burger-menu]') || target.closest('[data-burger-dropdown]')) {
        return;
      }
      if (burgerMenuOpen) {
        closeBurgerMenu();
      }
    }
    if (burgerMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [burgerMenuOpen]);


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
      type: "exercise" as const,
      exercise: composer.exercise.trim(),
      series: parsedSeries,
      reps: composer.reps.trim() || undefined,
      weight: parsedWeight,
      restSec: parsedRest,
    } satisfies Omit<ExerciseItem, "id">;
    if (!payload.exercise && !payload.reps && payload.restSec === undefined) return;
    add(payload);
    // reset composer values and refocus exercise
    setComposer({ exercise: "", series: "", reps: "", weight: "", restSec: "" });
    exerciseRef.current?.focus();
  }

  function handleAddSection() {
    const title = newSectionTitle.trim();
    if (!title) return;
    add({ type: "section", title } as Omit<SectionItem, "id">);
    setNewSectionTitle("");
  }

  function handleInsertSectionAbove(exerciseId: string) {
    const exerciseIndex = items.findIndex(item => item.id === exerciseId);
    if (exerciseIndex === -1) return;
    
    const title = prompt("Section title:");
    if (!title?.trim()) return;
    
    const newSection = { type: "section" as const, id: generateId(), title: title.trim() };
    setItems((prev: Item[]) => [
      ...prev.slice(0, exerciseIndex),
      newSection,
      ...prev.slice(exerciseIndex)
    ]);
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

  function handleContextMenu(e: React.MouseEvent, id: string, type: 'exercise' | 'section') {
    e.preventDefault();
    setContextMenu({ id, x: e.clientX, y: e.clientY, type });
    // Trigger animation after a small delay to ensure DOM update
    setTimeout(() => setContextMenuVisible(true), 10);
  }

  function handleDeleteSection(sectionId: string) {
    remove(sectionId);
    closeContextMenu();
  }


  const handleLongPressStart = (e: React.TouchEvent, id: string, type: 'exercise' | 'section') => {
    e.preventDefault();
    const timer = setTimeout(() => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setContextMenu({
        id,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        type
      });
      // Trigger animation after a small delay to ensure DOM update
      setTimeout(() => setContextMenuVisible(true), 10);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const moveItem = (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const currentIndex = items.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    let newIndex = currentIndex;
    
    switch (direction) {
      case 'up':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'down':
        newIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'top':
        newIndex = 0;
        break;
      case 'bottom':
        newIndex = items.length - 1;
        break;
    }

    if (newIndex !== currentIndex) {
      const newItems = [...items];
      const [movedItem] = newItems.splice(currentIndex, 1);
      newItems.splice(newIndex, 0, movedItem);
      setItems(newItems);
    }
    
    closeContextMenu();
  };

  const closeContextMenu = () => {
    setContextMenuVisible(false);
    setTimeout(() => {
      setContextMenu(null);
    }, 200); // Wait for animation to complete
  };

  const toggleBurgerMenu = () => {
    if (burgerMenuOpen) {
      closeBurgerMenu();
    } else {
      setBurgerMenuOpen(true);
      setTimeout(() => setBurgerMenuVisible(true), 10);
    }
  };

  const closeBurgerMenu = () => {
    setBurgerMenuVisible(false);
    setTimeout(() => {
      setBurgerMenuOpen(false);
    }, 200);
  };

  function handleEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  

  return (
    <div className="min-h-full flex flex-col items-center">
      <div className="w-full max-w-screen-sm flex-1 pb-[calc(24px+var(--safe-bottom))]">
        <header className={`sticky top-0 z-10 bg-neutral-950/80 backdrop-blur border-b border-neutral-800 transition-transform duration-200 ${headerHidden ? "-translate-y-full" : "translate-y-0"}`}>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="font-semibold">Gym TODO</div>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleBurgerMenu}
                className="h-8 w-8"
                data-burger-menu
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* Burger Menu Dropdown */}
              {burgerMenuOpen && (
                <div
                  className={`absolute right-0 top-full mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl py-1 min-w-[160px] transition-all duration-200 ${
                    burgerMenuVisible 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 -translate-y-2'
                  }`}
                  onMouseLeave={closeBurgerMenu}
                  data-burger-dropdown
                >
                  <button
                    className="w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700 transition-colors duration-150"
                    onClick={() => {
                      duplicateLast();
                      closeBurgerMenu();
                    }}
                  >
                    Duplicate last
                  </button>
                  <div className="border-t border-neutral-700 my-1" />
                  <button
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-neutral-700 transition-colors duration-150"
                    onClick={() => {
                      setConfirmOpen(true);
                      closeBurgerMenu();
                    }}
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 space-y-3">
          {items.map((it) => {
            if (it.type === "section") {
              return (
                <div 
                  key={it.id} 
                  className="px-1 pt-6 pb-2 relative transition-all duration-300 select-none"
                  onContextMenu={(e) => handleContextMenu(e, it.id, 'section')}
                  onTouchStart={(e) => handleLongPressStart(e, it.id, 'section')}
                  onTouchEnd={handleLongPressEnd}
                  onTouchMove={handleLongPressEnd}
                  style={{ 
                    WebkitUserSelect: 'none', 
                    userSelect: 'none'
                  }}
                >
                  <div className="flex items-center justify-between border-b border-neutral-700 pb-2">
                    <div className="text-sm font-semibold uppercase tracking-wide text-neutral-300">
                      {it.title}
                    </div>
                    <button
                      className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                      onClick={() => handleDeleteSection(it.id)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            }
            const isOpen = !!openById[it.id];
            return (
              <Card 
                key={it.id} 
                className="flex flex-col transition-all duration-300 select-none"
                onContextMenu={(e) => handleContextMenu(e, it.id, 'exercise')}
                onTouchStart={(e) => handleLongPressStart(e, it.id, 'exercise')}
                onTouchEnd={handleLongPressEnd}
                onTouchMove={handleLongPressEnd}
                style={{ 
                  WebkitUserSelect: 'none', 
                  userSelect: 'none'
                }}
              >
                <button
                  type="button"
                  className="w-full px-3 py-2 flex items-center justify-between gap-3 select-none"
                  onClick={() => setOpenById((s) => ({ ...s, [it.id]: !s[it.id] }))}
                  onContextMenu={(e) => handleContextMenu(e, it.id, 'exercise')}
                  style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="font-semibold truncate">{it.exercise || "Unnamed"}</div>
                    {!isOpen && (
                      <div className="flex items-center gap-1 text-sm text-neutral-300">
                        {typeof it.series === "number" && it.reps ? (
                          <>
                            <span>{it.series}</span>
                            <span className="text-neutral-500">×</span>
                            <span>{it.reps}</span>
                          </>
                        ) : (
                          <>
                            {typeof it.series === "number" ? <span>{it.series}</span> : null}
                            {it.reps ? <span>{it.reps}</span> : null}
                          </>
                        )}
                        {typeof it.weight === "number" && (
                          <>
                            <span className="text-neutral-500">,</span>
                            <span>{it.weight}kg</span>
                          </>
                        )}
                        {typeof it.restSec === "number" && (
                          <>
                            <span className="text-neutral-500">,</span>
                            <span>{it.restSec}s</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 pt-1 flex items-start gap-3">
                    <div className="grid grid-cols-6 sm:grid-cols-5 gap-2 flex-1">
                      <Input
                        className="col-span-6 sm:col-span-1 font-semibold"
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
                  </div>
                )}
              </Card>
            );
          })}
        </main>
      </div>

      {/* Composer Panel (animated) */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-20 bg-neutral-950/95 backdrop-blur border-t border-neutral-800 transform transition-all duration-300 ${
          composerOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
        aria-hidden={!composerOpen}
      >
        <div className="mx-auto w-full max-w-screen-sm p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-300">Composer</div>
            </div>
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
            <div className="grid grid-cols-4 sm:grid-cols-[1fr_120px] gap-2">
              <Input
                className="col-span-4 sm:col-span-1"
                value={newSectionTitle}
                placeholder="Section title (e.g., Warm-up)"
                onChange={(e) => setNewSectionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddSection();
                }}
              />
              <Button className="col-span-4 sm:col-span-1 w-full" variant="secondary" onClick={handleAddSection}>Add section</Button>
            </div>
            <div className="pb-[calc(12px+var(--safe-bottom))]" />
        </div>
      </div>
      {/* Floating Action Button */}
      <Button
        aria-label="Add"
        size="icon"
        className={`fixed bottom-[calc(16px+var(--safe-bottom))] right-4 z-30 rounded-full h-14 w-14 shadow-xl transition-transform duration-300 ${
          composerOpen ? "rotate-45 scale-95" : "hover:scale-110 active:scale-95"
        }`}
        onClick={() => setComposerOpen((v) => !v)}
      >
        <Plus className="h-7 w-7" />
      </Button>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className={`fixed z-50 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl py-1 min-w-[180px] transition-all duration-200 ${
            contextMenuVisible 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 -translate-y-2'
          }`}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={closeContextMenu}
        >
          {/* Movement options for both exercises and sections */}
          <button
            className="w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700 transition-colors duration-150"
            onClick={() => moveItem(contextMenu.id, 'up')}
          >
            Move up
          </button>
          <button
            className="w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700 transition-colors duration-150"
            onClick={() => moveItem(contextMenu.id, 'down')}
          >
            Move down
          </button>
          <button
            className="w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700 transition-colors duration-150"
            onClick={() => moveItem(contextMenu.id, 'top')}
          >
            Move to top
          </button>
          <button
            className="w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700 transition-colors duration-150"
            onClick={() => moveItem(contextMenu.id, 'bottom')}
          >
            Move to bottom
          </button>
          
          {/* Separator */}
          <div className="border-t border-neutral-700 my-1" />
          
          {/* Type-specific options */}
          {contextMenu.type === 'exercise' && (
            <button
              className="w-full px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700 transition-colors duration-150"
              onClick={() => {
                handleInsertSectionAbove(contextMenu.id);
                closeContextMenu();
              }}
            >
              Insert section above
            </button>
          )}
          {contextMenu.type === 'section' && (
            <button
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-neutral-700 transition-colors duration-150"
              onClick={() => handleDeleteSection(contextMenu.id)}
            >
              Delete section
            </button>
          )}
        </div>
      )}

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
