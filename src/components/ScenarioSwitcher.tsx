import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/i18n/useI18n";
import type { MarketCode } from "@/i18n/messages";
import { useMarketLocaleStore } from "@/stores/marketLocaleStore";

const MARKETS: MarketCode[] = ["FR", "SE", "DE"];

export default function ScenarioSwitcher() {
  const { t } = useI18n();
  const market = useMarketLocaleStore((s) => s.market);
  const setMarket = useMarketLocaleStore((s) => s.setMarket);

  const triggerClass =
    "h-8 w-[min(200px,70vw)] border-[var(--color-border-subtle)] bg-[var(--color-white)] text-[12px] text-[var(--color-text-primary)] shadow-none";

  return (
    <label className="flex items-center gap-2 font-[var(--font-body)] text-[12px] text-[var(--color-text-secondary)]">
      <span className="whitespace-nowrap">{t("proto.market")}</span>
      <Select value={market} onValueChange={(v) => setMarket(v as MarketCode)}>
        <SelectTrigger className={triggerClass}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MARKETS.map((code) => (
            <SelectItem key={code} value={code}>
              {t(`market.${code}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
