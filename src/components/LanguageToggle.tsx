import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { locale, toggleLocale, t } = useI18n();
  return (
    <Button type="button" variant="outline" size={compact ? "icon" : "sm"} onClick={toggleLocale} aria-label={locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"} title={t("language")}>
      <Languages aria-hidden />{!compact && <span>{t("language")}</span>}
    </Button>
  );
}