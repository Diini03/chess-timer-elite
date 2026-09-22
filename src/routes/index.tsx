import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock3, Gauge, Library, Play, ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: CommandCenter,
  head: () => ({
    meta: [
      { title: "Taktik — Chess Command Center" },
      { name: "description", content: "Start a precise chess clock, choose a tournament preset, and open your private chess library." },
      { property: "og:title", content: "Taktik — Chess Command Center" },
      { property: "og:description", content: "Precise chess timing and your private chess library in one focused command center." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const presets = [
  { id: "bullet-1-0", name: "Bullet", time: "1|0", detail: "No increment" },
  { id: "blitz-3-2", name: "Blitz", time: "3|2", detail: "Fischer" },
  { id: "rapid-10-0", name: "Rapid", time: "10|0", detail: "Think fast" },
  { id: "classical-30", name: "Classical", time: "30|0", detail: "Full focus" },
];

function CommandCenter() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Taktik home">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-primary/50 bg-primary/10 font-display text-2xl text-primary">T</span>
            <span><strong className="block font-display text-2xl leading-none">Taktik</strong><span className="eyebrow text-[0.55rem]">Chess command</span></span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Primary navigation">
            <Link to="/library" className="flex h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:text-foreground"><Library className="h-4 w-4" /><span className="hidden sm:inline">Library</span></Link>
            <Link to="/clock" className="flex h-11 items-center gap-2 rounded-lg border border-primary bg-primary px-4 text-xs font-bold text-primary-foreground"><Play className="h-4 w-4" fill="currentColor" /> Start</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-5 py-5 md:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)] md:px-8 md:py-8">
        <section className="relative overflow-hidden rounded-lg border border-border bg-card p-6 md:min-h-[510px] md:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
          <div className="eyebrow flex items-center gap-2 text-primary"><span className="h-2 w-2 rounded-full bg-primary" /> System ready</div>
          <h1 className="mt-8 max-w-3xl font-display text-6xl leading-[0.92] md:text-8xl">Your move.<br/><em className="text-primary">Right on time.</em></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">A precise, distraction-free clock for the board beside you. Choose a format and begin in one tap.</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link to="/clock" className="group flex min-h-14 flex-1 items-center justify-between rounded-lg border border-primary bg-primary px-5 font-bold text-primary-foreground transition-transform active:translate-y-px">
              <span className="flex items-center gap-3"><Play className="h-5 w-5" fill="currentColor" /> Start clock</span><ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/library" className="flex min-h-14 items-center justify-center gap-3 rounded-lg border border-border bg-background px-6 font-semibold hover:border-primary/60"><BookOpen className="h-5 w-5 text-primary" /> Open library</Link>
          </div>

          <div className="mt-10 grid grid-cols-3 border-t border-border pt-6">
            {[{ icon: Gauge, value: "±0ms", label: "drift" }, { icon: Zap, value: "+60s", label: "increment" }, { icon: ShieldCheck, value: "Private", label: "library" }].map(({icon: Icon, value, label}) => (
              <div key={label} className="border-r border-border px-3 first:pl-0 last:border-0">
                <Icon className="mb-3 h-4 w-4 text-primary"/><strong className="block font-mono text-sm sm:text-lg">{value}</strong><span className="eyebrow text-[0.5rem]">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <aside className="grid gap-5">
          <section className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between"><div><span className="eyebrow">Active setup</span><h2 className="mt-1 font-display text-3xl">Blitz match</h2></div><Clock3 className="h-6 w-6 text-primary" /></div>
            <div className="mt-6 grid grid-cols-2 gap-2 font-mono text-4xl"><div className="rounded-md border border-border bg-background p-4 text-center">3:00</div><div className="rounded-md border border-primary/50 bg-primary/10 p-4 text-center text-primary">3:00</div></div>
            <Link to="/clock" search={{tc: "blitz-3-2"}} className="mt-3 flex h-12 items-center justify-center gap-2 rounded-lg border border-primary bg-primary font-bold text-primary-foreground"><Zap className="h-4 w-4" fill="currentColor"/> Launch 3|2</Link>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-end justify-between"><div><span className="eyebrow">Quick launch</span><h2 className="mt-1 font-display text-3xl">Presets</h2></div><span className="text-xs text-muted-foreground">4 formats</span></div>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => <Link key={preset.id} to="/clock" search={{tc: preset.id}} className="group rounded-lg border border-border bg-background p-4 hover:border-primary/60"><div className="flex items-start justify-between"><span className="font-mono text-xl group-hover:text-primary">{preset.time}</span><ArrowRight className="h-4 w-4 text-muted-foreground"/></div><strong className="mt-4 block text-xs">{preset.name}</strong><span className="text-[11px] text-muted-foreground">{preset.detail}</span></Link>)}
            </div>
          </section>
        </aside>

        <section className="rounded-lg border border-border bg-card p-5 md:col-span-2 md:p-7">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center"><div><span className="eyebrow text-primary">Private study vault</span><h2 className="mt-2 font-display text-4xl md:text-5xl">Books, notes, and PDFs beside the board.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Keep opening manuals and endgame studies searchable, private, and ready to read without leaving Taktik.</p></div><Link to="/library" className="flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 font-semibold hover:border-primary/60"><BookOpen className="h-4 w-4 text-primary"/> Enter library <ArrowRight className="h-4 w-4"/></Link></div>
        </section>
      </main>
    </div>
  );
}