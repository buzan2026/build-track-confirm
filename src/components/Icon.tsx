import * as React from "react";

import { cn } from "@/lib/utils";

export type IconSize = "16" | "20" | "24" | "32";

export type IconLibrary = "material" | "fontawesome";

const shellSize: Record<IconSize, string> = {
  "16": "h-[var(--spacing-3)] w-[var(--spacing-3)] min-h-[var(--spacing-3)] min-w-[var(--spacing-3)]",
  "20": "h-[var(--font-size-l)] w-[var(--font-size-l)] min-h-[var(--font-size-l)] min-w-[var(--font-size-l)]",
  "24": "h-[var(--spacing-4)] w-[var(--spacing-4)] min-h-[var(--spacing-4)] min-w-[var(--spacing-4)]",
  "32": "h-[var(--spacing-5)] w-[var(--spacing-5)] min-h-[var(--spacing-5)] min-w-[var(--spacing-5)]",
};

function MaterialTextureIcon({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex size-full items-center justify-center overflow-hidden", className)}>
      <svg
        viewBox="0 0 24 24"
        className="h-[75%] w-[75%] shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path d="M4 20L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 12L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 20L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

const faInnerBox: Record<IconSize, string> = {
  "16": "h-[var(--font-size-xs)] w-[var(--font-size-xs)]",
  "20": "h-[var(--spacing-3)] w-[var(--spacing-3)]",
  "24": "h-[var(--spacing-2-25)] w-[var(--spacing-2-25)]",
  "32": "h-[var(--spacing-4)] w-[var(--spacing-4)]",
};

const faTextClass: Record<IconSize, string> = {
  "16": "text-[var(--font-size-xs)] leading-[var(--line-height-s)]",
  "20": "text-[var(--font-size-s)] leading-[var(--line-height-l)]",
  "24": "text-[length:var(--spacing-2-25)] leading-[var(--line-height-m)]",
  "32": "text-[var(--spacing-4)] leading-none",
};

function FontAwesomeGlyph({ size, iconText }: { size: IconSize; iconText: string }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center text-center text-[var(--color-text-primary)]",
        "not-italic uppercase tracking-[-0.05em]",
        faInnerBox[size],
        faTextClass[size],
      )}
      style={{ fontFamily: "'Font Awesome 5 Free', sans-serif", fontWeight: 900 }}
    >
      {iconText}
    </span>
  );
}

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Swappable “texture” (Material) or glyph text (Font Awesome). */
  library?: IconLibrary;
  size?: IconSize;
  /** Font Awesome only: single glyph / ligature string (requires FA webfont in the app). */
  iconText?: string;
  /** Replaces default library artwork (e.g. pass a Lucide icon). */
  children?: React.ReactNode;
}

/**
 * Design-system icon shell (Figma `4536:3931` — Icon shell).
 * Material: diagonal “texture” placeholder. Font Awesome: `iconText` with FA 5 Free Solid.
 */
export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  (
    {
      className,
      library = "material",
      size = "16",
      iconText = "layer-group",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex shrink-0 items-center justify-center text-[var(--color-text-primary)]",
          shellSize[size],
          className,
        )}
        {...props}
      >
        {children ?? (
          library === "fontawesome" ? (
            <FontAwesomeGlyph size={size} iconText={iconText} />
          ) : (
            <MaterialTextureIcon />
          )
        )}
      </span>
    );
  },
);

Icon.displayName = "Icon";
