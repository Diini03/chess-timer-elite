import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Zap, Clock3, Trophy, Github, BookOpen } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Tempo v2 — A chess clock built for the board" },
      { name: "description", content: "Tournament-grade chess timing on your phone. Bullet to classical, Fischer increments, drift-free timing, plus a private book library." },
      { property: "og:title", content: "Tempo v2 — A chess clock built for the board" },
      { property: "og:description", content: "Tournament-grade chess timing on your phone, plus a private book library." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const presets = [
  { id: "bullet-1-0", name: "Bullet", time: "1+0", note: "Sixty seconds. Nothing else." },
  { id: "blitz-3-2", name: "Blitz", time: "3+2", note: "Fischer increment. Club night classic." },
  { id: "rapid-10-0", name: "Rapid", time: "10+0", note: "Enough time to think. Barely." },
  { id: "classical-30", name: "Classical", time: "30+0", note: "For when the position deserves it." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Masthead */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex items-stretch justify-between">
          <Link to="/" className="flex items-center gap-3 border-r border-border px-5 py-4">
            <span className="inline-block h-3 w-3 rounded-full bg-primary" />
            <span className="font-display text-3xl leading-none tracking-[0.06em]">Tempo</span>
            <span className="eyebrow hidden sm:inline">v2.0</span>
          </Link>
          <nav className="flex items-stretch divide-x divide-border">
            <a href="#presets" className="eyebrow hidden items-center px-5 hover:text-foreground md:flex">Presets</a>
            <a href="#craft" className="eyebrow hidden items-center px-5 hover:text-foreground md:flex">Craft</a>
            <Link to="/library" className="eyebrow flex items-center gap-2 px-5 hover:text-foreground">
              <BookOpen className="h-3.5 w-3.5" /> Library
            </Link>
            <Link
              to="/clock"
              className="flex items-center gap-2 bg-primary px-5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary-foreground"
            >
              Launch <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="grid grid-cols-1 border-b border-border md:grid-cols-[1.1fr_0.9fr]">
        <div className="border-b border-border px-6 py-16 md:border-b-0 md:border-r md:px-12 md:py-24">
          <div className="eyebrow mb-8">Issue 02 — Drift-free rAF timer</div>
          <h1 className="font-display text-[clamp(3.5rem,9vw,8rem)] leading-[0.86] tracking-tight">
            Time is the opponent{" "}
            <span className="italic text-primary">you never see.</span>
          </h1>
          <p className="mt-10 max-w-md text-base leading-relaxed text-muted-foreground">
            A tournament-grade chess clock for the phone beside your board. Fischer increments,
            sub-frame accuracy, no ads — now with a private library for your chess books and PDFs.
          </p>

          <div className="mt-10 flex flex-wrap items-stretch gap-3">
            <Link
              to="/clock"
              className="group inline-flex items-center gap-3 bg-primary px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary-foreground"
            >
              Start a game
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#presets"
              className="inline-flex items-center border border-border px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-foreground hover:bg-secondary"
            >
              See presets
            </a>
          </div>

          <div className="mt-12">
            <div className="eyebrow mb-4">Quick start</div>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <Link
                  key={p.id}
                  to="/clock"
                  search={{ tc: p.id }}
                  className="flex items-baseline gap-2 border border-border px-4 py-3 hover:bg-secondary"
                >
                  <span className="eyebrow">{p.name}</span>
                  <span className="font-mono text-sm text-primary">{p.time}</span>
                </Link>
              ))}
            </div>
          </div>

          <dl className="mt-14 grid grid-cols-3 gap-8 border-t border-border pt-8">
            {[
              { k: "±0ms", v: "Drift-free" },
              { k: "04", v: "Categories" },
              { k: "∞", v: "Books" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-5xl leading-none text-primary">{s.k}</dt>
                <dd className="eyebrow mt-2">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Specimen */}
        <div className="flex items-center justify-center bg-card px-6 py-16 md:px-10">
          <div className="w-full max-w-sm border border-border bg-background">
            <div className="flex flex-col items-center border-b border-border px-8 py-14 opacity-70">
              <div className="eyebrow mb-3">Player 2 — waiting</div>
              <div className="timer-digits text-6xl text-muted-foreground">3:00</div>
            </div>
            <div className="flex items-stretch divide-x divide-border border-b border-border">
              <div className="eyebrow flex flex-1 items-center justify-center py-4">Blitz 3+2</div>
              <div className="flex w-16 items-center justify-center bg-primary text-primary-foreground">
                <Zap className="h-4 w-4" fill="currentColor" />
              </div>
            </div>
            <div className="relative flex flex-col items-center px-8 py-14">
              <div className="eyebrow mb-3 text-primary">Player 1 — your move</div>
              <div className="timer-digits text-6xl text-primary">2:47</div>
              <div className="absolute inset-x-0 bottom-0 h-[3px] bg-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* Presets */}
      <section id="presets" className="border-b border-border">
        <div className="flex flex-wrap items-end justify-between gap-6 px-6 py-14 md:px-12">
          <div>
            <div className="eyebrow mb-4">01 — Presets</div>
            <h2 className="font-display text-5xl tracking-tight md:text-7xl">
              Every format, <span className="italic text-primary">one tap away.</span>
            </h2>
          </div>
          <Link to="/clock" className="eyebrow hover:text-foreground">Open the clock →</Link>
        </div>
        <div className="grid grid-cols-1 gap-px border-t border-border bg-border sm:grid-cols-2 md:grid-cols-4">
          {presets.map((p) => (
            <Link
              key={p.id}
              to="/clock"
              search={{ tc: p.id }}
              className="group flex flex-col justify-between bg-background p-8 transition-colors hover:bg-card"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="eyebrow">{p.name}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="mt-6 font-display text-6xl tracking-tight group-hover:text-primary">{p.time}</div>
              </div>
              <p className="mt-10 text-sm leading-relaxed text-muted-foreground">{p.note}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Craft */}
      <section id="craft" className="border-b border-border">
        <div className="px-6 py-14 md:px-12">
          <div className="eyebrow mb-4">02 — Craft</div>
          <h2 className="font-display text-5xl tracking-tight md:text-7xl">
            Built like a <span className="italic text-primary">tournament clock.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-px border-t border-border bg-border md:grid-cols-3">
          {[
            { Icon: Clock3, t: "Drift-free timing", d: "Delta-based accounting on requestAnimationFrame keeps the clock honest across tab switches and background stalls." },
            { Icon: Zap, t: "Fischer increment", d: "Automatic increment on move for every preset that supports it. No configuration mid-game." },
            { Icon: Trophy, t: "Screen wake lock", d: "Your phone stays awake while a game runs. Never lose a bullet game to a screensaver." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="bg-background p-8">
              <Icon className="mb-8 h-5 w-5 text-primary" />
              <div className="font-display text-3xl tracking-wide">{t}</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Library CTA */}
      <section className="grid grid-cols-1 border-b border-border md:grid-cols-2">
        <div className="border-b border-border px-6 py-16 md:border-b-0 md:border-r md:px-12">
          <div className="eyebrow mb-4">03 — Library</div>
          <h3 className="font-display text-4xl leading-tight tracking-tight md:text-6xl">
            Your openings, endgames and PDFs — <span className="italic text-primary">private, searchable, readable in the browser.</span>
          </h3>
          <Link
            to="/library"
            className="mt-10 inline-flex items-center gap-3 border border-border px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.24em] hover:bg-secondary"
          >
            Open library <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex flex-col items-start justify-center gap-8 bg-card px-6 py-16 md:px-12">
          <h3 className="font-display text-5xl leading-none tracking-tight md:text-7xl">
            Set the clock. <span className="italic text-primary">Play the game.</span>
          </h3>
          <Link
            to="/clock"
            className="inline-flex items-center gap-3 bg-primary px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-primary-foreground"
          >
            Launch Tempo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="flex flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row md:px-12">
        <div className="eyebrow">© {new Date().getFullYear()} Tempo — v2.0</div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="eyebrow inline-flex items-center gap-2 hover:text-foreground"
        >
          <Github className="h-4 w-4" /> Source
        </a>
      </footer>
    </div>
  );
}
