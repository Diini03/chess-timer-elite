import { X } from "lucide-react";

export interface Shortcut {
  keys: string[];
  label: string;
}

/** Single source of truth for the bindings shown in the cheat sheet. */
export const SHORTCUTS: Shortcut[] = [
  { keys: ["Enter"], label: "End your turn (on focused panel)" },
  { keys: ["Space"], label: "Pause / resume" },
  { keys: ["Space"], label: "End your turn (on focused panel)" },
  { keys: ["↑"], label: "Focus top player" },
  { keys: ["↓"], label: "Focus bottom player" },
  { keys: ["←", "→"], label: "Move focus in the control bar" },
];

interface ShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal cheat sheet listing the current keyboard bindings.
 * Rendered controlled — toggled from the capsule toolbar.
 */
export function ShortcutsHelp({ open, onClose }: ShortcutsHelpProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-[min(24rem,90vw)] rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close keyboard shortcuts"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
        <h2 className="mb-1 text-base font-semibold">Keyboard shortcuts</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Works anywhere on the clock page.
        </p>
        <ul className="space-y-2.5 text-sm">
          {SHORTCUTS.map((s, i) => (
            <Row key={i} keys={s.keys} label={s.label} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function Row({ keys, label }: Shortcut) {
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
