import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

function TextureIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M4 20L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 20L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const linkVariants = cva(
  [
    "inline-flex items-center gap-[var(--spacing-1)] font-[var(--font-body)] font-[var(--font-weight-regular)]",
    "underline-offset-[var(--spacing-1)] transition-[color,text-decoration-color,box-shadow] duration-150 ease-out",
    "focus-visible:outline-none rounded-[var(--border-radius-sm)]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "text-[var(--color-primary)]",
          "hover:underline hover:text-[var(--color-primary)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-page)]",
        ].join(" "),
        secondary: [
          "text-[var(--color-text-primary)]",
          "hover:underline hover:text-[var(--color-primary)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-page)]",
        ].join(" "),
        onColor: [
          "text-[var(--color-white)]",
          "hover:underline hover:text-[var(--color-white)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-white)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        ].join(" "),
      },
      size: {
        large: "text-[var(--font-size-m)] leading-[var(--line-height-m)]",
        medium: "text-[var(--font-size-s)] leading-[var(--line-height-s)]",
        small: "text-[var(--font-size-xs)] leading-[var(--line-height-xs)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "large",
    },
  },
);

const iconVariants = cva("shrink-0 text-current", {
  variants: {
    size: {
      large: "h-[var(--spacing-4)] w-[var(--spacing-4)]",
      medium: "h-[var(--font-size-l)] w-[var(--font-size-l)]",
      small: "h-[var(--spacing-3)] w-[var(--spacing-3)]",
    },
  },
  defaultVariants: { size: "large" },
});

export type LinkVariant = NonNullable<VariantProps<typeof linkVariants>["variant"]>;
export type LinkSize = NonNullable<VariantProps<typeof linkVariants>["size"]>;

export interface LinkProps extends React.ComponentPropsWithoutRef<"a"> {
  /** When set, renders as the child element (e.g. React Router `Link`) and merges styles. */
  asChild?: boolean;
  variant?: LinkVariant;
  size?: LinkSize;
  /** `true` = default texture icon; `ReactNode` = custom; omit/false = none. */
  iconLeft?: boolean | React.ReactNode;
  iconRight?: boolean | React.ReactNode;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      className,
      variant = "primary",
      size = "large",
      iconLeft,
      iconRight,
      asChild = false,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "a";

    const left =
      iconLeft === true ? (
        <TextureIcon className={iconVariants({ size })} />
      ) : iconLeft ? (
        iconLeft
      ) : null;

    const right =
      iconRight === true ? (
        <TextureIcon className={iconVariants({ size })} />
      ) : iconRight ? (
        iconRight
      ) : null;

    return (
      <Comp ref={ref} className={cn(linkVariants({ variant, size }), className)} {...props}>
        {left}
        {children}
        {right}
      </Comp>
    );
  },
);

Link.displayName = "Link";

export { Link, linkVariants };
