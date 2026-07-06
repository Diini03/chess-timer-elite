# Changelog

All notable changes to Tempo (Chess Clock) are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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
