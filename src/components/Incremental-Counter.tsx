import * as React from "react";

import { cn } from "@/lib/utils";

export type IncrementalCounterSize = "small" | "medium" | "large";

export interface IncrementalCounterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  size?: IncrementalCounterSize;
  /** Current value (controlled). */
  value?: number;
  /** Initial value when uncontrolled. */
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  readOnly?: boolean;
  /** Accessible label for the value field (e.g. "Quantity"). */
  valueLabel?: string;
  minusLabel?: string;
  plusLabel?: string;
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const sizeStyles: Record<
  IncrementalCounterSize,
  {
    rootMinW: string;
    h: string;
    segment: string;
    icon: string;
    pad: string;
    fontSize: string;
    lineHeight: string;
  }
> = {
  small: {
    rootMinW: "min-w-[var(--spacing-11)]",
    h: "h-[var(--spacing-5)] min-h-[var(--spacing-5)]",
    segment: "min-h-[var(--spacing-5)] min-w-[var(--spacing-5)] w-[var(--spacing-5)]",
    icon: "h-[var(--spacing-3)] w-[var(--spacing-3)]",
    pad: "p-[var(--spacing-2)]",
    fontSize: "text-[var(--font-size-xs)]",
    lineHeight: "leading-[var(--line-height-xs)]",
  },
  medium: {
    rootMinW: "min-w-[var(--spacing-12)]",
    h: "h-[var(--spacing-6)] min-h-[var(--spacing-6)]",
    segment: "min-h-[var(--spacing-6)] min-w-[var(--spacing-6)] w-[var(--spacing-6)]",
    icon: "h-[var(--font-size-l)] w-[var(--font-size-l)]",
    pad: "p-[calc(var(--spacing-2)+var(--size-2px))]",
    fontSize: "text-[var(--font-size-s)]",
    lineHeight: "leading-[var(--line-height-s)]",
  },
  large: {
    rootMinW: "min-w-[calc(var(--spacing-11)+var(--spacing-7))]",
    h: "h-[var(--spacing-7)] min-h-[var(--spacing-7)]",
    segment: "min-h-[var(--spacing-7)] min-w-[var(--spacing-7)] w-[var(--spacing-7)]",
    icon: "h-[var(--spacing-4)] w-[var(--spacing-4)]",
    pad: "p-[calc(var(--spacing-2)+var(--spacing-1))]",
    fontSize: "text-[var(--font-size-m)]",
    lineHeight: "leading-[var(--line-height-m)]",
  },
};

export function IncrementalCounter({
  className,
  size = "medium",
  value: valueProp,
  defaultValue = 0,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  onChange,
  disabled = false,
  readOnly = false,
  valueLabel = "Quantity",
  minusLabel = "Decrease",
  plusLabel = "Increase",
  ...rest
}: IncrementalCounterProps) {
  const fieldId = React.useId();
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : uncontrolled;

  const setValue = React.useCallback(
    (next: number) => {
      const clamped = Math.min(max, Math.max(min, next));
      if (!isControlled) setUncontrolled(clamped);
      onChange?.(clamped);
    },
    [isControlled, max, min, onChange],
  );

  const canDec = !disabled && !readOnly && value > min;
  const canInc = !disabled && !readOnly && value < max;

  const s = sizeStyles[size];
  const muted = disabled || readOnly;
  const interactive = !disabled && !readOnly;

  const segmentFocus =
    "focus-visible:z-[1] focus-visible:border-[var(--color-primary)] focus-visible:outline-none";
  const iconColor = muted ? "text-[var(--color-text-helper)]" : "text-[var(--color-primary)]";
  const textColor = muted ? "text-[var(--color-text-helper)]" : "text-[var(--color-text-primary)]";

  const cellBorder = "border-0 border-r border-solid border-[var(--color-border-subtle)] last:border-r-0";

  return (
    <div
      role="group"
      aria-label={valueLabel}
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-[var(--border-radius-sm)]",
        s.rootMinW,
        s.h,
        disabled && "bg-[var(--color-border-subtle)]",
        readOnly && !disabled && "border border-solid border-[var(--color-border-subtle)] bg-transparent",
        interactive && "border border-solid border-[var(--color-border-subtle)] bg-[var(--color-white)]",
        className,
      )}
      {...rest}
    >
      <button
        type="button"
        disabled={!canDec}
        aria-label={minusLabel}
        className={cn(
          "inline-flex shrink-0 items-center justify-center bg-[var(--color-white)]",
          s.segment,
          s.pad,
          cellBorder,
          segmentFocus,
          disabled && "cursor-not-allowed bg-transparent",
          readOnly && !disabled && "cursor-default bg-[var(--color-white)]",
          !canDec && "opacity-60",
        )}
        onClick={() => setValue(value - step)}
      >
        <MinusIcon className={cn(s.icon, iconColor)} />
      </button>

      <div
        className={cn(
          "flex min-w-0 flex-1 items-center justify-center bg-[var(--color-white)]",
          cellBorder,
          disabled && "border-transparent bg-transparent",
        )}
      >
        <label className="sr-only" htmlFor={fieldId}>
          {valueLabel}
        </label>
        <input
          id={fieldId}
          type="number"
          readOnly={readOnly}
          disabled={disabled}
          aria-readonly={readOnly || undefined}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const raw = e.target.valueAsNumber;
            if (Number.isNaN(raw)) return;
            setValue(raw);
          }}
          className={cn(
            "w-full min-w-0 border-0 bg-transparent text-center font-[var(--font-body)] font-[var(--font-weight-semibold)] [-moz-appearance:textfield] outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            s.fontSize,
            s.lineHeight,
            textColor,
            "focus-visible:z-[1] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-0",
            muted && "cursor-default",
          )}
        />
      </div>

      <button
        type="button"
        disabled={!canInc}
        aria-label={plusLabel}
        className={cn(
          "inline-flex shrink-0 items-center justify-center bg-[var(--color-white)]",
          s.segment,
          s.pad,
          cellBorder,
          segmentFocus,
          disabled && "cursor-not-allowed bg-transparent",
          readOnly && !disabled && "cursor-default bg-[var(--color-white)]",
          !canInc && "opacity-60",
        )}
        onClick={() => setValue(value + step)}
      >
        <PlusIcon className={cn(s.icon, iconColor)} />
      </button>
    </div>
  );
}
