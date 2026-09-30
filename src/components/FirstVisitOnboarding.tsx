import { useEffect, useState } from "react";
import { BookOpen, ChevronRight, Clock3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

const STORAGE_KEY = "taktik:onboarding:v1";

export function FirstVisitOnboarding() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      // Browsers that block storage can still show the introduction.
      setOpen(true);
    }
  }, []);

  function dismiss() {
    try { window.localStorage.setItem(STORAGE_KEY, "done"); } catch { /* storage is optional */ }
    setOpen(false);
  }

  const slides = [
    { icon: Clock3, title: t("onboardClockTitle"), body: t("onboardClockBody"), label: t("clock") },
    { icon: BookOpen, title: t("onboardLibraryTitle"), body: t("onboardLibraryBody"), label: t("library") },
    { icon: Sparkles, title: t("onboardCoachTitle"), body: t("onboardCoachBody"), label: t("onboardCoachLabel") },
  ];
  const current = slides[step];
  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) dismiss(); }}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[430px] gap-0 overflow-hidden rounded-md border-border bg-background p-0 shadow-[var(--shadow-elevated)] [&>button]:z-10 [&>button]:h-11 [&>button]:w-11 [&>button]:grid [&>button]:place-items-center">
        <div className="relative flex h-52 items-center justify-center overflow-hidden border-b border-border bg-secondary sm:h-60" aria-hidden="true">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
          <span className="absolute start-5 top-6 font-mono text-xs font-semibold text-primary">TAKTIK / 0{step + 1}</span>
          {step === 0 && (
            <div className="flex w-[80%] max-w-[300px] overflow-hidden rounded-md border border-primary/40 bg-background shadow-[var(--shadow-elevated)]">
              <div className="flex h-24 flex-1 flex-col justify-center border-e border-border px-4"><span className="mb-2 font-mono text-[10px] text-muted-foreground">01 / 02</span><span className="font-mono text-3xl font-semibold tabular-nums text-primary">03:00</span></div>
              <div className="flex h-24 flex-1 flex-col justify-center px-4"><span className="mb-2 font-mono text-[10px] text-muted-foreground">02 / 02</span><span className="font-mono text-3xl font-semibold tabular-nums text-foreground">03:00</span></div>
            </div>
          )}
          {step === 1 && (
            <div className="flex items-end gap-2">
              <div className="flex h-28 w-20 flex-col justify-between rounded-sm border border-primary/50 bg-primary/10 p-3"><BookOpen className="h-5 w-5 text-primary"/><span className="font-display text-xl leading-none text-foreground">01</span></div>
              <div className="flex h-36 w-24 flex-col justify-between rounded-sm border border-primary bg-background p-3 shadow-[var(--shadow-elevated)]"><span className="h-1 w-8 bg-primary"/><span className="font-display text-2xl leading-none text-foreground">Taktik<br/>Library</span></div>
              <div className="flex h-24 w-16 flex-col justify-end rounded-sm border border-border bg-card p-3"><span className="font-display text-xl text-muted-foreground">03</span></div>
            </div>
          )}
          {step === 2 && (
            <div className="w-[78%] max-w-[265px] rounded-md border border-border bg-background p-4 shadow-[var(--shadow-elevated)]">
              <div className="mb-4 flex items-center gap-2 text-primary"><Sparkles className="h-5 w-5"/><span className="font-mono text-[10px] uppercase">Taktik / coach</span></div>
              <div className="mb-2 h-1.5 w-4/5 rounded-full bg-muted-foreground/50"/><div className="mb-4 h-1.5 w-3/5 rounded-full bg-muted-foreground/30"/>
              <div className="flex items-center gap-3 border-t border-border pt-3"><span className="font-mono text-xs text-accent">14. Nf3?</span><span className="h-1.5 w-2/5 rounded-full bg-primary/70"/></div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-6 sm:px-8 sm:pb-8">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase text-primary"><Icon className="h-4 w-4"/>{current.label}</div>
          <DialogTitle className="font-display text-4xl font-normal leading-tight text-foreground sm:text-5xl">{current.title}</DialogTitle>
          <DialogDescription className="mt-3 min-h-16 text-sm leading-6 text-muted-foreground">{current.body}</DialogDescription>
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex gap-2" aria-label={t("onboardProgress")}>
              {slides.map((_, index) => <span key={index} className={`h-1.5 w-7 rounded-full ${index === step ? "bg-primary" : "bg-border"}`} aria-current={index === step ? "step" : undefined} />)}
            </div>
            <span className="font-mono text-xs text-muted-foreground">0{step + 1} / 03</span>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={dismiss} className="shrink-0">{t("onboardSkip")}</Button>
            <Button type="button" className="min-w-0 flex-1" onClick={() => step === slides.length - 1 ? dismiss() : setStep(step + 1)}>
              {step === slides.length - 1 ? t("onboardFinish") : t("onboardNext")}
              {step < slides.length - 1 && <ChevronRight className="rtl:rotate-180" aria-hidden="true"/>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}