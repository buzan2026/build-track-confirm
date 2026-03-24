import * as React from "react";

import { cn } from "@/lib/utils";

function ArrowBackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const headerIconButtonClass = cn(
  "inline-flex min-w-[var(--spacing-7)] shrink-0 items-center justify-center rounded-[var(--border-radius-sm)]",
  "p-[calc(var(--spacing-2)+var(--spacing-1))] text-[var(--color-text-primary)]",
  "transition-colors hover:bg-[var(--color-bg-layer-01)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-layer-02)]",
);

export interface SidepanelRootProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidepanelRoot({ className, ...props }: SidepanelRootProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[100dvh] w-full min-w-0 max-w-[var(--size-sheet-max)] flex-col border border-solid border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] shadow-[var(--shadow-1)]",
        className,
      )}
      {...props}
    />
  );
}

export interface SidepanelHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  backLabel?: string;
  showClose?: boolean;
  onClose?: () => void;
  closeLabel?: string;
}

export function SidepanelHeader({
  title,
  showBack = false,
  onBack,
  backLabel = "Back",
  showClose = true,
  onClose,
  closeLabel = "Close",
  className,
  ...props
}: SidepanelHeaderProps) {
  return (
    <header
      className={cn(
        "flex w-full shrink-0 items-stretch border-b border-solid border-[var(--color-border-subtle)]",
        className,
      )}
      {...props}
    >
      {showBack ? (
        <div className="flex shrink-0 items-stretch">
          <button
            type="button"
            className={headerIconButtonClass}
            aria-label={backLabel}
            onClick={onBack}
          >
            <ArrowBackIcon className="h-[var(--spacing-4)] w-[var(--spacing-4)]" />
          </button>
        </div>
      ) : null}
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col items-start gap-[calc(var(--spacing-2)+var(--size-2px))]",
          "px-[var(--spacing-3)] py-[calc(var(--spacing-2)+var(--spacing-1))]",
        )}
      >
        <div
          className={cn(
            "max-h-[var(--spacing-7)] w-full min-w-0 overflow-hidden text-ellipsis font-[var(--font-heading)] font-[var(--font-weight-semibold)]",
            "text-[var(--font-size-m)] leading-[var(--line-height-m)] tracking-normal text-[var(--color-text-primary)]",
          )}
        >
          {title}
        </div>
      </div>
      {showClose ? (
        <div className="flex shrink-0 items-stretch">
          <button
            type="button"
            className={headerIconButtonClass}
            aria-label={closeLabel}
            onClick={onClose}
          >
            <CloseIcon className="h-[var(--spacing-4)] w-[var(--spacing-4)]" />
          </button>
        </div>
      ) : null}
    </header>
  );
}

export interface SidepanelBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidepanelBody({ className, children, ...props }: SidepanelBodyProps) {
  return (
    <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)} {...props}>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto px-[var(--spacing-3)] pt-[var(--spacing-3)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export interface SidepanelFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidepanelFooter({ className, ...props }: SidepanelFooterProps) {
  return (
    <footer
      className={cn(
        "flex w-full shrink-0 flex-wrap items-center justify-end gap-[var(--spacing-3)] overflow-hidden",
        "border-t border-solid border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] p-[var(--spacing-3)]",
        className,
      )}
      {...props}
    />
  );
}

export interface SidepanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  /** Main scrollable region. */
  children: React.ReactNode;
  /** Optional action row (e.g. secondary + primary buttons). */
  footer?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  backLabel?: string;
  showClose?: boolean;
  onClose?: () => void;
  closeLabel?: string;
}

/**
 * Design-system side panel (Figma `9251:875` — `.panel`).
 * Compose primitives yourself, or use this wrapper for the common layout.
 */
export function Sidepanel({
  title,
  children,
  footer,
  showBack,
  onBack,
  backLabel,
  showClose = true,
  onClose,
  closeLabel,
  className,
  ...props
}: SidepanelProps) {
  return (
    <SidepanelRoot className={className} {...props}>
      <SidepanelHeader
        title={title}
        showBack={showBack}
        onBack={onBack}
        backLabel={backLabel}
        showClose={showClose}
        onClose={onClose}
        closeLabel={closeLabel}
      />
      <SidepanelBody>{children}</SidepanelBody>
      {footer != null ? <SidepanelFooter>{footer}</SidepanelFooter> : null}
    </SidepanelRoot>
  );
}

SidepanelRoot.displayName = "SidepanelRoot";
SidepanelHeader.displayName = "SidepanelHeader";
SidepanelBody.displayName = "SidepanelBody";
SidepanelFooter.displayName = "SidepanelFooter";
Sidepanel.displayName = "Sidepanel";

// PascalCase re-exports for consumers
export {
  Sidepanel as SidePanel,
  SidepanelBody as SidePanelBody,
  SidepanelFooter as SidePanelFooter,
  SidepanelHeader as SidePanelHeader,
  SidepanelRoot as SidePanelRoot,
  type SidepanelProps as SidePanelProps,
  type SidepanelBodyProps as SidePanelBodyProps,
  type SidepanelFooterProps as SidePanelFooterProps,
  type SidepanelHeaderProps as SidePanelHeaderProps,
  type SidepanelRootProps as SidePanelRootProps,
};
