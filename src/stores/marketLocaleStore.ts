import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MarketCode } from "@/i18n/messages";

interface MarketLocaleState {
  market: MarketCode;
  setMarket: (market: MarketCode) => void;
}

export const useMarketLocaleStore = create<MarketLocaleState>()(
  persist(
    (set) => ({
      market: "FR",
      setMarket: (market) => set({ market }),
    }),
    {
      name: "rexel-market-locale",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ market: state.market }),
    }
  )
);
