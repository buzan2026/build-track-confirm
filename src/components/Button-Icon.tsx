import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonIconVariants = cva(
  [
    "inline-flex items-center justify-center border transition-colors duration-150 ease-out",
    "focus-visible:outline-none disabled:cursor-not-allowed",
  ].join(" "),
  {
    variants: {
      visualType: {
        primary: "border-transparent text-[var(--color-white)]",
        secondary: "border-[var(--color-primary)] text-[var(--color-primary)]",
        tertiary: "border-transparent text-[var(--color-primary)]",
        onSurface: "border-transparent text-[var(--color-primary)]",
      },
      size: {
        large: "h-[var(--spacing-7)] w-[var(--spacing-7)]",
        medium: "h-[var(--spacing-6)] w-[var(--spacing-6)]",
        small: "h-[var(--spacing-5)] w-[var(--spacing-5)]",
      },
      form: {
        square: "rounded-[var(--border-radius-sm)]",
        circle: "rounded-full",
      },
      state: {
        default: "",
        hover: "",
        active: "",
      },
      disabled: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      visualType: "primary",
      size: "large",
      form: "square",
      state: "default",
      disabled: false,
    },
  },
);

type ButtonIconVisualType = "primary" | "secondary" | "tertiary" | "onSurface";
type ButtonIconSize = "large" | "medium" | "small";
type ButtonIconForm = "square" | "circle";
type ButtonIconState = "default" | "hover" | "active";

export interface ButtonIconProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type" | "disabled">,
    VariantProps<typeof buttonIconVariants> {
  visualType?: ButtonIconVisualType;
  size?: ButtonIconSize;
  form?: ButtonIconForm;
  state?: ButtonIconState;
  disabled?: boolean;
  icon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

function getBackgroundClass(visualType: ButtonIconVisualType, state: ButtonIconState, disabled: boolean) {
  if (disabled) {
    if (visualType === "onSurface") return "bg-[var(--color-white)]";
    if (visualType === "tertiary") return "bg-transparent";
    return "bg-[var(--color-border-subtle)]";
  }

  if (visualType === "primary") {
    if (state === "default") return "bg-[var(--color-primary)]";
    return "bg-[var(--color-primary-hover)]";
  }

  if (visualType === "secondary") {
    if (state === "default") return "bg-[var(--color-white)]";
    if (state === "hover") return "bg-[var(--color-bg-layer-01)]";
    return "bg-[var(--color-bg-layer-03)]";
  }

  if (visualType === "tertiary") {
    if (state === "default") return "bg-transparent";
    if (state === "hover") return "bg-[var(--color-bg-layer-01)]";
    return "bg-[var(--color-bg-layer-03)]";
  }

  if (state === "default") return "bg-[var(--color-white)]";
  if (state === "hover") return "bg-[var(--color-bg-layer-01)]";
  return "bg-[var(--color-bg-layer-03)]";
}

function getForegroundClass(visualType: ButtonIconVisualType, disabled: boolean) {
  if (disabled) return "text-[var(--color-text-secondary)]";
  return visualType === "primary" ? "text-[var(--color-white)]" : "text-[var(--color-primary)]";
}

function getBorderClass(visualType: ButtonIconVisualType, disabled: boolean) {
  if (visualType === "secondary" && !disabled) return "border-[var(--color-primary)]";
  return "border-transparent";
}

function getIconSizeClass(size: ButtonIconSize) {
  if (size === "large") return "h-[var(--spacing-4)] w-[var(--spacing-4)]";
  if (size === "medium") return "h-[var(--font-size-l)] w-[var(--font-size-l)]";
  return "h-[var(--spacing-3)] w-[var(--spacing-3)]";
}

function TextureIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export const ButtonIcon = React.forwardRef<HTMLButtonElement, ButtonIconProps>(
  (
    {
      className,
      visualType = "primary",
      size = "large",
      form = "square",
      state = "default",
      disabled = false,
      icon,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          buttonIconVariants({ visualType, size, form, state, disabled }),
          getBackgroundClass(visualType, state, disabled),
          getForegroundClass(visualType, disabled),
          getBorderClass(visualType, disabled),
          className,
        )}
        {...props}
      >
        {icon ?? <TextureIcon className={getIconSizeClass(size)} />}
      </button>
    );
  },
);

ButtonIcon.displayName = "ButtonIcon";

