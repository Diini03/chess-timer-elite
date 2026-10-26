import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Clock3, Home, Library, LogIn, LogOut, Play, Sparkles } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { to: "/", key: "home", icon: Home, exact: true },
  { to: "/clock", key: "clock", icon: Clock3, exact: false },
  { to: "/library", key: "library", icon: Library, exact: false },
  { to: "/coach", key: "onboardCoachLabel", icon: Sparkles, exact: false },
] as const;

export function AppNavbar() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const linkBase =
    "relative flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground";
  const linkActive = "bg-secondary text-foreground shadow-[inset_0_-2px_0_var(--primary)]";

  return (
    <>
      <header className="sticky top-0 z-40 px-3 pt-3 md:px-6">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-xl border border-border bg-card/80 px-2 ps-3 shadow-[var(--shadow-elevated)] backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Taktik home">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-display text-xl text-primary-foreground">T</span>
            <strong className="font-display text-xl leading-none">Taktik</strong>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-1 rounded-lg border border-border bg-background/60 p-1 md:flex">
            {items.map(({ to, key, icon: Icon, exact }) => (
              <Link key={to} to={to} activeOptions={{ exact }} className={linkBase} activeProps={{ className: linkActive }}>
                <Icon className="h-4 w-4" /> {t(key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <LanguageToggle compact />
            {isAuthenticated ? (
              <button type="button" onClick={signOut} aria-label={t("signOut")} title={t("signOut")} className="grid h-11 w-11 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground active:translate-y-px">
                <LogOut className="h-4 w-4 rtl:rotate-180" />
              </button>
            ) : (
              <Link to="/auth" aria-label={t("signIn")} className="hidden h-11 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground hover:text-foreground sm:flex">
                <LogIn className="h-4 w-4 rtl:rotate-180" /> {t("signIn")}
              </Link>
            )}
            <Link to="/clock" className="flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground transition-transform active:translate-y-px">
              <Play className="h-4 w-4" fill="currentColor" /> <span className="hidden sm:inline">{t("start")}</span>
            </Link>
          </div>
        </div>
      </header>

      <nav aria-label="Mobile navigation" className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 gap-1 rounded-xl border border-border bg-card/90 p-1.5 shadow-[var(--shadow-elevated)] backdrop-blur-xl md:hidden" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
        {items.map(({ to, key, icon: Icon, exact }) => (
          <Link key={to} to={to} activeOptions={{ exact }} className="flex h-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-semibold text-muted-foreground transition-colors" activeProps={{ className: "bg-primary text-primary-foreground" }}>
            <Icon className="h-5 w-5" />
            <span className="max-w-full truncate px-1">{t(key)}</span>
          </Link>
        ))}
      </nav>
      <div aria-hidden className="h-20 md:hidden" />
    </>
  );
}
