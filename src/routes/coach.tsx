import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Cpu, Loader2, Sparkles } from "lucide-react";
import { analyzeGame } from "@/lib/coach.functions";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import type { EngineReport } from "@/lib/engine";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "AI Game Coach — Taktik" },
      { name: "description", content: "Paste a PGN and get Stockfish-checked mistakes explained with clear training tips." },
      { property: "og:title", content: "AI Game Coach — Taktik" },
      { property: "og:description", content: "Engine-accurate game reviews after every over-the-board game." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CoachPage,
});

const SAMPLE = `1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 4. Nxe5 Qg5 5. Nxf7 Qxg2 6. Rf1 Qxe4+ 7. Be2 Nf3#`;

function CoachPage() {
  const run = useServerFn(analyzeGame);
  const { t, locale } = useI18n();
  const [game, setGame] = useState("");
  const [stage, setStage] = useState<"idle" | "engine" | "coach">("idle");
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<EngineReport | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loading = stage !== "idle";

  const submit = async () => {
    if (game.trim().length < 10 || loading) return;
    setError(null); setResult(null); setReport(null); setProgress(0);
    try {
      let engine: string | undefined;
      const { parseGame, analyzeWithEngine } = await import("@/lib/engine");
      const chess = parseGame(game);
      if (chess) {
        setStage("engine");
        const r = await analyzeWithEngine(chess, 12, (d, total) => setProgress(Math.round((d / total) * 100)));
        setReport(r);
        engine = r.summary;
      }
      setStage("coach");
      const res = await run({ data: { game, language: locale, engine } });
      if (res.ok) setResult(res.text); else setError(res.error);
    } catch {
      setError(t("coachError"));
    } finally {
      setStage("idle");
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t("home")}
          </Link>
          <LanguageToggle compact />
        </div>
        <span className="eyebrow mt-4 block text-primary">{t("onboardCoachLabel")}</span>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">{t("coachTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("coachBody")}</p>

        <textarea
          value={game}
          onChange={(e) => setGame(e.target.value)}
          placeholder={t("coachPlaceholder")}
          aria-label={t("coachInputLabel")}
          maxLength={20000}
          dir="ltr"
          className="mt-5 min-h-48 w-full rounded-lg border border-border bg-card p-4 font-mono text-sm outline-none focus:border-primary"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={submit} disabled={loading || game.trim().length < 10} className="min-h-12 flex-1">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {stage === "engine" ? `${t("coachEngineRunning")} ${progress}%` : stage === "coach" ? t("coachWriting") : t("coachAnalyze")}
          </Button>
          <Button variant="outline" className="min-h-12" onClick={() => setGame(SAMPLE)} disabled={loading}>
            {t("coachSample")}
          </Button>
        </div>

        {error && <p role="alert" className="mt-5 rounded-lg border border-destructive/50 p-4 text-sm text-destructive">{error}</p>}

        {report && (
          <section className="mt-5 rounded-lg border border-border bg-card p-5" aria-label={t("coachEngineTitle")}>
            <h2 className="flex items-center gap-2 text-sm font-semibold"><Cpu className="h-4 w-4 text-primary" /> {t("coachEngineTitle")}</h2>
            {report.findings.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">{t("coachClean")}</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {report.findings.map((f) => (
                  <li key={f.ply} className="flex flex-wrap items-center gap-2 border-t border-border pt-2 first:border-0 first:pt-0">
                    <span className={f.label === "Blunder" ? "font-semibold text-destructive" : f.label === "Mistake" ? "font-semibold text-accent" : "text-muted-foreground"}>
                      {t(f.label === "Blunder" ? "blunder" : f.label === "Mistake" ? "mistake" : "inaccuracy")}
                    </span>
                    <span dir="ltr" className="font-mono">{f.moveNumber}{f.side === "White" ? "." : "…"} {f.played}</span>
                    <span className="text-muted-foreground">{t("coachBest")} <span dir="ltr" className="font-mono text-foreground">{f.best}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        {!report && result && <p className="mt-5 text-xs text-muted-foreground">{t("coachNoEngine")}</p>}
        {result && (
          <article className="mt-5 whitespace-pre-wrap rounded-lg border border-border bg-card p-5 text-sm leading-7">
            {result}
          </article>
        )}
      </div>
    </main>
  );
}
