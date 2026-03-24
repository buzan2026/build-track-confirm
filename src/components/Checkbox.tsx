import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@/lib/utils";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.5 8L6.5 11L12.5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, "checked"> {
  /** Invalid / error styling (red border on unchecked). */
  error?: boolean;
  /** Controlled checked state; use `"indeterminate"` for the partial state. */
  checked?: boolean | "indeterminate";
  /** Uncontrolled default. */
  defaultChecked?: boolean | "indeterminate";
}

const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, error, disabled, checked, defaultChecked, ...props }, ref) => {
    return (
      <CheckboxPrimitive.Root
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        aria-invalid={error || undefined}
        className={cn(
          "group peer inline-flex shrink-0 items-center justify-center",
          "h-[var(--spacing-4)] w-[var(--spacing-4)] rounded-[var(--border-radius-sm)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-page)]",
          "disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "flex items-center justify-center",
            "h-[var(--font-size-l)] w-[var(--font-size-l)] rounded-[var(--border-radius-sm)] border border-solid",
            "transition-colors duration-150 ease-out",
            "group-data-[state=unchecked]:bg-[var(--color-white)] group-data-[state=unchecked]:border-[var(--color-primary)]",
            error && "group-data-[state=unchecked]:border-[var(--color-error)]",
            "group-data-[state=checked]:border-[var(--color-primary)] group-data-[state=checked]:bg-[var(--color-primary)]",
            "group-data-[state=indeterminate]:border-[var(--color-primary)] group-data-[state=indeterminate]:bg-[var(--color-white)]",
            "group-disabled:group-data-[state=unchecked]:border-[var(--color-border-subtle)] group-disabled:group-data-[state=unchecked]:bg-[var(--color-bg-layer-01)]",
            "group-disabled:group-data-[state=checked]:border-[var(--color-border-subtle)] group-disabled:group-data-[state=checked]:bg-[var(--color-bg-layer-01)]",
            "group-disabled:group-data-[state=indeterminate]:border-[var(--color-border-subtle)] group-disabled:group-data-[state=indeterminate]:bg-[var(--color-bg-layer-01)]",
          )}
        >
          <CheckboxPrimitive.Indicator className="flex items-center justify-center">
            <CheckIcon
              className={cn(
                "hidden h-[var(--spacing-3)] w-[var(--spacing-3)] text-[var(--color-white)]",
                "group-data-[state=checked]:block",
                "group-disabled:text-[var(--color-text-secondary)]",
              )}
            />
            <MinusIcon
              className={cn(
                "hidden h-[var(--spacing-3)] w-[var(--spacing-3)] text-[var(--color-primary)]",
                "group-data-[state=indeterminate]:block",
                "group-disabled:text-[var(--color-text-secondary)]",
              )}
            />
          </CheckboxPrimitive.Indicator>
        </span>
      </CheckboxPrimitive.Root>
    );
  },
);

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
