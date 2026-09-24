import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { analyzeGame } from "@/lib/coach.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "AI Game Coach — Taktik" },
      { name: "description", content: "Paste a PGN or game notes and get your key mistakes explained with clear improvement tips." },
      { property: "og:title", content: "AI Game Coach — Taktik" },
      { property: "og:description", content: "Understand your mistakes and improve after every over-the-board game." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CoachPage,
});

const SAMPLE = `1. e4 e5 2. Nf3 Nc6 3. Bc4 Nd4 4. Nxe5 Qg5 5. Nxf7 Qxg2 6. Rf1 Qxe4+ 7. Be2 Nf3#`;

function CoachPage() {
  const run = useServerFn(analyzeGame);
  const [game, setGame] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (game.trim().length < 10 || loading) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const lang = document.documentElement.lang === "ar" ? "ar" : "en";
      const r = await run({ data: { game, language: lang } });
      if (r.ok) setResult(r.text); else setError(r.error);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-2xl">
        <Link to="/" className="inline-flex h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> Home
        </Link>
        <span className="eyebrow mt-4 block text-primary">AI coach</span>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Review your game</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Paste a PGN or describe what happened. The coach points out key mistakes and how to improve.
        </p>

        <textarea
          value={game}
          onChange={(e) => setGame(e.target.value)}
          placeholder="1. e4 e5 2. Nf3 ... or: I lost my queen around move 15 after..."
          aria-label="PGN or game notes"
          maxLength={20000}
          className="mt-5 min-h-48 w-full rounded-lg border border-border bg-card p-4 font-mono text-sm outline-none focus:border-primary"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={submit} disabled={loading || game.trim().length < 10} className="min-h-12 flex-1">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Analyzing…" : "Analyze game"}
          </Button>
          <Button variant="outline" className="min-h-12" onClick={() => setGame(SAMPLE)} disabled={loading}>
            Try a sample
          </Button>
        </div>

        {error && <p role="alert" className="mt-5 rounded-lg border border-destructive/50 p-4 text-sm text-destructive">{error}</p>}
        {result && (
          <article className="mt-5 whitespace-pre-wrap rounded-lg border border-border bg-card p-5 text-sm leading-7">
            {result}
          </article>
        )}
      </div>
    </main>
  );
}
