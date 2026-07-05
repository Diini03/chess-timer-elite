# Tempo — Minimal Chess Clock

A premium, mobile-first chess clock built for over-the-board play. Designed to sit next to a real board on your phone.

## Features

- Drift-free timing driven by `performance.now()` and `requestAnimationFrame`
- Bullet, Blitz, Rapid, and Classical presets with Fischer increments
- Editable player names, persisted locally
- Move counter per player
- Tap-to-confirm reset, pause / resume, haptic feedback
- Subtle synthesized click sounds (mute toggle)
- Keyboard shortcuts: `Space` pause/resume, `↑` / `↓` switch turns
- Installable as a PWA (manifest included)

## Tech

TanStack Start · React 19 · Vite 7 · Tailwind v4

## Development

```bash
bun install
bun dev
```

## Roadmap

- Game history view
- FIDE two-stage time controls
- Online sync via Lovable Cloud
- Themes
