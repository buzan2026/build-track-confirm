import * as React from "react";

import { cn } from "@/lib/utils";

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <path
        d="M10 4.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zm0 1.5a4 4 0 110 8 4 4 0 010-8zM10 7.25a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0V8a.75.75 0 01.75-.75zm0 6a.9.9 0 100 1.8.9.9 0 000-1.8z"
        fill="currentColor"
      />
    </svg>
  );
}

function SuccessIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <path
        d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.53 5.47l.7.7-5.5 5.5-2.83-2.83.7-.7 2.13 2.12 4.8-4.79z"
        fill="currentColor"
      />
    </svg>
  );
}

export interface InputProps extends React.ComponentProps<"input"> {
  /** Shows error border, icon, and `aria-invalid`. */
  error?: boolean;
  /** Error text below the field (Figma `.Error Message`). */
  errorMessage?: string;
  /** Shows success border and check icon. */
  success?: boolean;
}

const inputBase = [
  "box-border w-full min-w-[18rem] min-h-[var(--spacing-6)] rounded-[var(--border-radius-sm)]",
  "px-[var(--spacing-2)] py-[calc(var(--spacing-2)+var(--size-2px))]",
  "font-[var(--font-body)] text-[var(--font-size-s)] font-[var(--font-weight-regular)] leading-[var(--line-height-s)] tracking-normal",
  "text-[var(--color-text-primary)]",
  "placeholder:text-[var(--color-text-placeholder)] placeholder:opacity-100",
  "read-only:min-w-0 read-only:placeholder:text-[var(--color-text-helper)]",
  "transition-[color,background-color,border-color,box-shadow] duration-150 ease-out",
  "outline-none",
  "selection:bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]",
  "[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  "file:border-0 file:bg-transparent file:font-[var(--font-weight-regular)] file:text-[var(--font-size-s)] file:text-[var(--color-text-primary)]",
].join(" ");

const iconSlot = "pr-[calc(var(--spacing-2)+var(--font-size-l))]";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, errorMessage, disabled, readOnly, ...props }, ref) => {
    const showTrailing = Boolean(error || success);
    const showErrorLine = Boolean(error && errorMessage);

    const inputClassName = cn(
      inputBase,
      "border border-solid bg-[var(--color-white)]",
      "border-[var(--color-border-subtle)]",
      "hover:border-[var(--color-primary)]",
      "focus-visible:border-2 focus-visible:border-[var(--color-primary)]",
      "disabled:cursor-not-allowed disabled:border-[var(--color-border-subtle)] disabled:bg-[var(--color-bg-layer-01)] disabled:text-[var(--color-text-placeholder)] disabled:hover:border-[var(--color-border-subtle)]",
      "read-only:border-0 read-only:bg-transparent read-only:px-[var(--spacing-2)] read-only:py-[calc(var(--spacing-2)+var(--size-2px))] read-only:hover:border-0 read-only:focus-visible:border-0 read-only:focus-visible:ring-0",
      "read-only:text-[var(--color-text-primary)]",
      showTrailing && iconSlot,
      error &&
        "border-2 border-[var(--color-error)] hover:border-[var(--color-error)] focus-visible:border-2 focus-visible:border-[var(--color-error)]",
      success &&
        !error &&
        "border-2 border-[var(--color-success)] hover:border-[var(--color-success)] focus-visible:border-2 focus-visible:border-[var(--color-success)]",
      className,
    );

    const inputEl = (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={error || undefined}
        className={inputClassName}
        {...props}
      />
    );

    if (!showTrailing && !showErrorLine) {
      return inputEl;
    }

    return (
      <div
        className={cn(
          "flex w-full min-w-[18rem] flex-col gap-[var(--spacing-1)]",
          readOnly && "min-w-0",
        )}
      >
        <div className="relative flex w-full items-center">
          {inputEl}
          {error && (
            <span className="pointer-events-none absolute right-[var(--spacing-2)] top-1/2 flex h-[var(--font-size-l)] w-[var(--font-size-l)] -translate-y-1/2 items-center justify-center text-[var(--color-error)]">
              <ErrorIcon className="h-full w-full" />
            </span>
          )}
          {success && !error && (
            <span className="pointer-events-none absolute right-[var(--spacing-2)] top-1/2 flex h-[var(--font-size-l)] w-[var(--font-size-l)] -translate-y-1/2 items-center justify-center text-[var(--color-success)]">
              <SuccessIcon className="h-full w-full" />
            </span>
          )}
        </div>
        {showErrorLine && (
          <p
            className={cn(
              "m-0 w-full overflow-hidden text-ellipsis font-[var(--font-body)] text-[var(--font-size-xs)] font-[var(--font-weight-regular)] leading-[var(--line-height-xs)] tracking-normal text-[var(--color-error)]",
            )}
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
