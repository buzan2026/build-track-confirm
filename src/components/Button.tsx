import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-[var(--spacing-2)]",
    "rounded-[var(--border-radius-sm)] font-[var(--font-body)]",
    "font-[var(--font-weight-semibold)] tracking-normal",
    "transition-colors duration-150 ease-out",
    "focus-visible:outline-none",
    "disabled:cursor-not-allowed",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--color-primary)] text-[var(--color-white)] border border-transparent",
          "hover:bg-[var(--color-primary-hover)] focus-visible:bg-[var(--color-primary-hover)]",
          "disabled:bg-[var(--color-border-subtle)] disabled:text-[var(--color-text-primary)]",
        ].join(" "),
        primary: [
          "bg-[var(--color-primary)] text-[var(--color-white)] border border-transparent",
          "hover:bg-[var(--color-primary-hover)] focus-visible:bg-[var(--color-primary-hover)]",
          "disabled:bg-[var(--color-border-subtle)] disabled:text-[var(--color-text-primary)]",
        ].join(" "),
        outline: [
          "bg-[var(--color-bg-layer-01)] text-[var(--color-primary)]",
          "border border-[var(--color-primary)]",
          "hover:bg-[var(--color-bg-layer-02)] focus-visible:bg-[var(--color-bg-layer-02)]",
          "disabled:border-[var(--color-border-subtle)] disabled:text-[var(--color-text-secondary)]",
        ].join(" "),
        secondary: [
          "bg-[var(--color-white)] !text-[var(--color-primary)]",
          "border border-[var(--color-primary)]",
          "hover:bg-[var(--color-bg-layer-02)] focus-visible:bg-[var(--color-bg-layer-02)]",
          "disabled:border-[var(--color-border-subtle)] disabled:text-[var(--color-text-primary)]",
        ].join(" "),
        ghost: [
          "bg-transparent text-[var(--color-primary)] border border-transparent",
          "hover:bg-[var(--color-bg-layer-01)] focus-visible:bg-[var(--color-bg-layer-01)]",
          "disabled:text-[var(--color-text-primary)]",
        ].join(" "),
        link: [
          "bg-transparent border border-transparent text-[var(--color-text-link)]",
          "underline-offset-[var(--spacing-1)] hover:underline focus-visible:underline",
          "px-0 min-w-0 h-auto",
        ].join(" "),
        tertiary: [
          "bg-[var(--color-white)] !text-[var(--color-primary)] border border-transparent",
          "hover:bg-[var(--color-bg-layer-02)] focus-visible:bg-[var(--color-bg-layer-02)]",
          "disabled:text-[var(--color-text-primary)]",
        ].join(" "),
        onSurface: [
          "bg-[var(--color-bg-layer-01)] text-[var(--color-primary)] border border-transparent",
          "hover:bg-[var(--color-bg-layer-02)] focus-visible:bg-[var(--color-bg-layer-02)]",
          "disabled:text-[var(--color-text-primary)]",
        ].join(" "),
        danger: [
          "bg-[var(--color-error)] text-[var(--color-white)] border border-transparent",
          "hover:bg-[var(--color-error)] focus-visible:bg-[var(--color-error)]",
          "disabled:bg-[var(--color-border-subtle)] disabled:text-[var(--color-text-primary)]",
        ].join(" "),
        destructive: [
          "bg-[var(--color-error)] text-[var(--color-white)] border border-transparent",
          "hover:bg-[var(--color-error)] focus-visible:bg-[var(--color-error)]",
          "disabled:bg-[var(--color-border-subtle)] disabled:text-[var(--color-text-primary)]",
        ].join(" "),
      },
      size: {
        default: [
          "h-[var(--spacing-6)] min-w-[var(--spacing-6)]",
          "px-[var(--spacing-5)] text-[var(--font-size-s)] leading-[var(--line-height-s)]",
        ].join(" "),
        sm: [
          "h-[var(--spacing-5)] min-w-[var(--spacing-5)]",
          "px-[var(--spacing-4)] text-[var(--font-size-s)] leading-[var(--line-height-s)]",
        ].join(" "),
        lg: [
          "h-[var(--spacing-7)] min-w-[var(--spacing-7)]",
          "px-[var(--spacing-6)] text-[var(--font-size-m)] leading-[var(--line-height-m)]",
        ].join(" "),
        icon: [
          "h-[var(--spacing-6)] w-[var(--spacing-6)] min-w-[var(--spacing-6)] px-0",
          "text-[var(--font-size-s)] leading-[var(--line-height-s)]",
        ].join(" "),
        large: [
          "h-[var(--spacing-7)] min-w-[var(--spacing-7)]",
          "px-[var(--spacing-6)] text-[var(--font-size-m)] leading-[var(--line-height-m)]",
        ].join(" "),
        medium: [
          "h-[var(--spacing-6)] min-w-[var(--spacing-6)]",
          "px-[var(--spacing-5)] text-[14px] leading-[var(--line-height-s)]",
        ].join(" "),
        small: [
          "h-[var(--spacing-5)] min-w-[var(--spacing-5)]",
          "px-[var(--spacing-4)] text-[14px] leading-[var(--line-height-s)]",
        ].join(" "),
      },
      state: {
        default: "",
        hover: "bg-[var(--color-primary-hover)]",
        focus: "bg-[var(--color-primary-hover)]",
        loading: "",
        success: [
          "bg-[var(--color-alert-success-bg)] text-[var(--color-alert-success-text)]",
          "border border-transparent",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
    compoundVariants: [
      {
        variant: ["secondary", "tertiary", "onSurface"],
        state: "hover",
        className: "bg-[var(--color-bg-layer-02)]",
      },
      {
        variant: ["secondary", "tertiary", "onSurface"],
        state: "focus",
        className: "bg-[var(--color-bg-layer-02)]",
      },
      {
        variant: "danger",
        state: ["hover", "focus"],
        className: "bg-[var(--color-error)]",
      },
      {
        variant: ["default", "primary", "outline", "secondary", "ghost", "link", "tertiary", "onSurface", "danger", "destructive"],
        state: "loading",
        className: "text-[var(--color-text-primary)]",
      },
    ],
  },
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type">,
    VariantProps<typeof buttonVariants> {
  type?: "button" | "submit" | "reset";
  asChild?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "leading" | "trailing";
  loading?: boolean;
  success?: boolean;
}

function LoadingIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[var(--spacing-3)] w-[var(--spacing-3)] shrink-0 animate-spin text-current"
      fill="none"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M12 3a9 9 0 019 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex h-[var(--spacing-3)] w-[var(--spacing-3)] items-center justify-center",
        "text-[var(--color-alert-success-text)]",
      ].join(" ")}
    >
      ✓
    </span>
  );
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "default",
      size = "default",
      state = "default",
      icon,
      iconPosition = "leading",
      asChild = false,
      loading = false,
      success = false,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const computedState = success ? "success" : loading ? "loading" : state;
    const isDisabled = disabled || loading;
    const leading = success ? <SuccessIcon /> : loading ? <LoadingIcon /> : icon;
    const trailing = !success && !loading ? icon : null;
    const forceLeadingState = success || loading;
    const Comp = asChild ? Slot : "button";

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={cn(buttonVariants({ variant, size, state: computedState }), className)}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant, size, state: computedState }), className)}
        {...props}
      >
        {leading && (forceLeadingState || iconPosition === "leading") ? leading : null}
        <span>{children}</span>
        {trailing && !forceLeadingState && iconPosition === "trailing" ? trailing : null}
      </button>
    );
  },
);

Button.displayName = "Button";

