# Tempo — Minimal Chess Clock

A premium, mobile-first chess clock built for over-the-board play. Designed to sit next to a real board on your phone.
it was just designed for practice, and this idea came when i was playing while we cant have any physical timer, so i created this one, then i notice some old ones exit

## Features

- Drift-free timing driven by `performance.now()` and `requestAnimationFrame`
- Bullet, Blitz, Rapid, and Classical presets with Fischer increments
- Editable player names, persisted locally
- Move counter per player
- Tap-to-confirm reset, pause / resume, haptic feedback
- Subtle synthesized click sounds (mute toggle)


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
