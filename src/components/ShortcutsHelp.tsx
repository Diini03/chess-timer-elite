import { useEffect, useState } from "react";
import { Keyboard, X } from "lucide-react";

const KEY = "tempo:shortcuts-dismissed";

/**
 * Small floating "?" trigger that reveals a keyboard shortcuts cheat sheet.
 * Auto-hidden on touch devices after first dismissal.
 */
export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    // Only surface on devices with a physical keyboard (rough heuristic).
    if (typeof window === "undefined") return;
    const isCoarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    const dismissed = localStorage.getItem(KEY) === "1";
    setHidden(isCoarse || dismissed);
  }, []);

  if (hidden) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Keyboard shortcuts"
        className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground backdrop-blur hover:text-foreground"
      >
        <Keyboard className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-[min(22rem,90vw)] rounded-2xl border border-border bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="mb-4 text-base font-semibold">Keyboard shortcuts</h2>
            <ul className="space-y-2 text-sm">
              <Row keys={["Enter"]} label="End your turn (on focused panel)" />
              <Row keys={["Space"]} label="Pause / resume" />
              <Row keys={["↑"]} label="Focus top player" />
              <Row keys={["↓"]} label="Focus bottom player" />
              <Row keys={["←", "→"]} label="Move focus in the control bar" />
            </ul>
            <button
              onClick={() => {
                localStorage.setItem(KEY, "1");
                setOpen(false);
                setHidden(true);
              }}
              className="mt-5 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground"
            >
              Don't show again
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ keys, label }: { keys: string[]; label: string }) {
  return (
    <li className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-[11px] text-foreground"
          >
            {k}
          </kbd>
        ))}
      </span>
    </li>
  );
}
