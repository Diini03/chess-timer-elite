# Changelog

All notable changes to Tempo (Chess Clock) are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Return focus to the Keyboard shortcuts button in the control capsule when the
  shortcuts cheat sheet closes, so keyboard users keep their place
- Full keyboard support: Enter/Space on a focused player panel ends that
  player's turn; Space (elsewhere) toggles pause/resume; ↑/↓ move focus
  between the two player panels; ←/→ move focus into and across the center
  control capsule (roving-focus toolbar pattern)
- Focus trap inside the keyboard-shortcuts cheat sheet dialog: Tab cycles
  within the modal, focus moves to the close button on open, and Escape closes it
- Player name edit button moved outside the player panel tap surface to fix
  invalid nested-button HTML and restore toolbar/button interactions
- Landing page at `/` with split-screen hero, quick-start chips, presets grid, and features
- Dedicated `/clock` route with deep-linkable time-control via `?tc=<id>` search param
- Home button in the clock control capsule for quick return to the landing page
- Midnight Indigo color palette and Bebas Neue + Barlow typography pairing

### Changed
- Clock layout rotated back to vertical (stacked top/bottom) — the natural chess-clock orientation
- Center control capsule is now a horizontal floating bar between the two players
- Preset cards on the landing page are now deep links that launch the clock with the chosen time control

### Added
- Game history panel with per-game stats persisted to localStorage
- Screen wake lock during active games (mobile)
- Long-press hook scaffolding for gesture actions
- Standalone time formatter (`src/lib/format-time.ts`) with hour support

### Changed
- Redesigned color system: cool graphite base with electric cyan accent
- Player accents switched to amber vs. violet for stronger dual identity
- Tighter global radius (`--radius: 1rem`) for a more precise system feel

### Kept
- Drift-free rAF timer loop
- Fischer increment on move
- Bullet / Blitz / Rapid / Classical presets

## [0.2.0]

### Added
- Sound effects (tap, low-time, timeout) with mute toggle
- Keyboard shortcuts overlay
- PWA manifest + favicon

## [0.1.0]

### Added
- Initial chess clock: two player panels, center control, presets
