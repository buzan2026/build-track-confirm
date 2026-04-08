import { Search } from "lucide-react";

export default function TopNav() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center justify-center h-8 w-8 rounded bg-[var(--color-primary)] text-[var(--color-white)] font-[var(--font-heading)] font-bold text-sm">
          R
        </div>
        <span className="font-[var(--font-heading)] font-bold text-base text-[var(--color-text-primary)]">
          Rexel
        </span>
      </div>

      {/* Global search */}
      <div className="flex-1 max-w-xl mx-auto px-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-placeholder)]" />
          <input
            type="text"
            disabled
            placeholder="Search across Rexel"
            className="h-9 w-full rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)] pl-9 pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      {/* User avatar */}
      <div className="shrink-0">
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[var(--color-rexel-primary-20)] text-[var(--color-primary)] font-semibold text-sm">
          JD
        </div>
      </div>
    </header>
  );
}
