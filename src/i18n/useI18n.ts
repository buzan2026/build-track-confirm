import { useCallback, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { fr, enUS, de as deLocale, sv as svLocale } from "date-fns/locale";
import { localeForMarket, translate, type AppLocale } from "@/i18n/messages";
import { useMarketLocaleStore } from "@/stores/marketLocaleStore";

const dfMap = { fr, en: enUS, sv: svLocale, de: deLocale } as const;
const intlLocale: Record<AppLocale, string> = {
  fr: "fr-FR",
  en: "en-GB",
  sv: "sv-SE",
  de: "de-DE",
};

export function useI18n() {
  const market = useMarketLocaleStore((s) => s.market);
  const locale = localeForMarket[market];

  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en" : locale;
  }, [locale]);

  const t = useCallback((key: string) => translate(locale, key), [locale]);
  const df = dfMap[locale];

  const formatDate = useCallback(
    (d: string | Date | null | undefined, fmt: string) => {
      if (d == null || d === "") return "—";
      const dt = typeof d === "string" ? new Date(d) : d;
      return format(dt, fmt, { locale: df });
    },
    [df]
  );

  const formatDateLong = useCallback(
    (d: Date) => format(d, "EEEE, dd MMMM yyyy", { locale: df }),
    [df]
  );

  const formatCurrency = useCallback(
    (n: number) =>
      new Intl.NumberFormat(intlLocale[locale], { style: "currency", currency: "EUR" }).format(n),
    [locale]
  );

  return useMemo(
    () => ({ t, locale, market, formatDate, formatDateLong, formatCurrency, df }),
    [t, locale, market, formatDate, formatDateLong, formatCurrency, df]
  );
}
