import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Zap, Clock3, Trophy, Github } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Tempo — A chess clock built for the board" },
      { name: "description", content: "Tournament-grade chess timing on your phone. Bullet to classical, Fischer increments, drift-free timing." },
      { property: "og:title", content: "Tempo — A chess clock built for the board" },
      { property: "og:description", content: "Tournament-grade chess timing on your phone." },
      { property: "og:type", content: "website" },
    ],
  }),
});

const presets = [
  { id: "bullet-1-0",  name: "Bullet",    time: "1+0",  note: "60 seconds. Nothing else." },
  { id: "blitz-3-2",   name: "Blitz",     time: "3+2",  note: "Fischer increment. Club night classic." },
  { id: "rapid-10-0",  name: "Rapid",     time: "10+0", note: "Enough time to think. Barely." },
  { id: "classical-30", name: "Classical", time: "30+0", note: "For when the position deserves it." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 md:px-12">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_16px_var(--primary)]" />
          <span className="font-display text-2xl tracking-[0.18em]">TEMPO</span>
        </Link>
        <nav className="flex items-center gap-6">
          <a href="#presets" className="hidden text-sm uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground md:inline">Presets</a>
          <a href="#features" className="hidden text-sm uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground md:inline">Features</a>
          <Link
            to="/clock"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Launch <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      {/* Split hero */}
      <section className="relative grid min-h-[calc(100vh-88px)] grid-cols-1 gap-12 px-6 pb-16 pt-8 md:grid-cols-2 md:gap-16 md:px-12 md:pt-16">
        {/* Left: type */}
        <div className="relative flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            v0.3 · Drift-free rAF timer
          </div>
          <h1 className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.85] tracking-tight">
            Time is <br />
            <span className="text-primary">the opponent</span> <br />
            you never see.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
            Tempo is a tournament-grade chess clock built for the phone in your pocket.
            Fischer increments. Sub-frame accuracy. No ads. No accounts.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/clock"
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-all hover:shadow-[0_20px_60px_-15px_var(--primary)]"
            >
              Start a game
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#presets"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-foreground hover:border-primary/60"
            >
              See presets
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border pt-8">
            {[
              { k: "±0ms", v: "Drift-free" },
              { k: "4", v: "Categories" },
              { k: "0", v: "Accounts" },
            ].map((s) => (
              <div key={s.v}>
                <div className="font-display text-4xl text-primary">{s.k}</div>
                <div className="mt-1 text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: clock mock */}
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(60% 50% at 70% 40%, color-mix(in oklab, var(--primary) 30%, transparent), transparent 70%)",
            }}
          />
          <div className="relative w-full max-w-md rotate-1 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_60px_120px_-40px_rgba(0,0,0,0.9)]">
            {/* Top player */}
            <div className="flex flex-col items-center justify-center px-8 py-16 opacity-60">
              <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Player 2 · waiting</div>
              <div className="timer-digits text-7xl font-semibold text-foreground/90">3:00</div>
            </div>
            {/* Divider + control */}
            <div className="relative flex items-center justify-center border-y border-border py-4">
              <div className="flex items-center gap-3 rounded-full border border-border bg-background px-3 py-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Blitz 3+2</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Zap className="h-4 w-4" fill="currentColor" />
                </span>
              </div>
            </div>
            {/* Bottom player active */}
            <div
              className="relative flex flex-col items-center justify-center px-8 py-16"
              style={{
                background:
                  "radial-gradient(120% 80% at 50% 100%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 65%)",
              }}
            >
              <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.3em] text-primary">Player 1 · your move</div>
              <div className="timer-digits text-7xl font-semibold text-primary">2:47</div>
              <div className="absolute inset-x-0 bottom-0 h-[3px] bg-primary shadow-[0_0_24px_2px_var(--primary)]" />
            </div>
          </div>
        </div>
      </section>

      {/* Presets */}
      <section id="presets" className="border-t border-border px-6 py-24 md:px-12">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.28em] text-primary">01 · Presets</div>
            <h2 className="font-display text-5xl tracking-tight md:text-7xl">Every format, one tap away.</h2>
          </div>
          <Link to="/clock" className="hidden text-sm uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground md:inline">
            Open the clock →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-4">
          {presets.map((p) => (
            <div key={p.name} className="group flex flex-col justify-between bg-card p-8 transition-colors hover:bg-accent">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{p.name}</div>
                <div className="mt-4 font-display text-6xl tracking-tight text-foreground group-hover:text-primary">{p.time}</div>
              </div>
              <p className="mt-8 text-sm leading-relaxed text-muted-foreground">{p.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border px-6 py-24 md:px-12">
        <div className="mb-12">
          <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.28em] text-primary">02 · Craft</div>
          <h2 className="font-display text-5xl tracking-tight md:text-7xl">Built like a tournament clock.</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { Icon: Clock3, t: "Drift-free timing", d: "requestAnimationFrame with delta-based accounting keeps the clock honest across tab switches and background stalls." },
            { Icon: Zap, t: "Fischer increment", d: "Automatic increment on move for every preset that supports it. No fiddling with configuration mid-game." },
            { Icon: Trophy, t: "Screen wake lock", d: "Your phone stays awake while a game is running. Never lose a bullet game to a screensaver." },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="rounded-3xl border border-border bg-card p-8">
              <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-display text-2xl tracking-wide">{t}</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-6 py-24 md:px-12">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-12 md:p-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(80% 100% at 100% 0%, color-mix(in oklab, var(--primary) 28%, transparent), transparent 60%)",
            }}
          />
          <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
            <h3 className="font-display text-5xl leading-none tracking-tight md:text-7xl">
              Set the clock. <br /> <span className="text-primary">Play the game.</span>
            </h3>
            <Link
              to="/clock"
              className="inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-semibold uppercase tracking-[0.18em] text-primary-foreground hover:shadow-[0_20px_60px_-15px_var(--primary)]"
            >
              Launch Tempo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col items-center justify-between gap-4 border-t border-border px-6 py-8 text-xs uppercase tracking-[0.24em] text-muted-foreground md:flex-row md:px-12">
        <div>© {new Date().getFullYear()} Tempo</div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 hover:text-foreground"
        >
          <Github className="h-4 w-4" /> Source
        </a>
      </footer>
    </div>
  );
}
