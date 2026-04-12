import * as React from "react";

import { cn } from "@/lib/utils";

const recyclingIcon = "http://localhost:3845/assets/2fb1f17312989895edaa010015eeac823cbc4872.svg";

export type BadgeType =
  | "default"
  | "alreadyBought"
  | "refurbished"
  | "offer"
  | "priceFlag"
  | "loyalty"
  | "criteria"
  | "habituallyInStock"
  | "inStock"
  | "availableJX"
  | "notInStock";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: BadgeType;
  label?: string;
  value?: string;
}

const baseClass = [
  "inline-flex items-center",
  "rounded-[var(--border-radius-sm)] border",
  "px-[var(--spacing-2)] py-[var(--spacing-1)]",
  "text-[12px] leading-[var(--line-height-xs)]",
  "font-[var(--font-body)] font-[var(--font-weight-semibold)]",
].join(" ");

const stylesByType: Record<BadgeType, string> = {
  default: "bg-[var(--color-bg-layer-01)] border-transparent text-[var(--color-text-secondary)]",
  alreadyBought: "bg-[var(--color-alert-info-bg)] border-transparent text-[var(--color-info)]",
  refurbished: "bg-[var(--color-success)] border-transparent text-[var(--color-white)] gap-[var(--spacing-1)]",
  offer: "bg-[var(--color-error)] border-transparent text-[var(--color-white)]",
  priceFlag: "bg-[var(--color-orange)] border-transparent text-[var(--color-white)]",
  loyalty: "bg-[var(--color-alert-info-bg)] border-[var(--color-info)] text-[var(--color-info)] gap-[var(--spacing-1)]",
  criteria: "bg-[var(--color-bg-layer-01)] border-transparent text-[var(--color-text-secondary)] gap-[2px]",
  habituallyInStock: "bg-[var(--color-alert-success-bg)] border-[var(--color-success)] text-[var(--color-success)]",
  inStock: "bg-[var(--color-alert-success-bg)] border-[var(--color-success)] text-[var(--color-success)]",
  availableJX: "bg-[var(--color-alert-error-bg)] border-[var(--color-warning)] text-[var(--color-warning)]",
  notInStock: "bg-[var(--color-bg-layer-01)] border-[var(--color-text-secondary)] text-[var(--color-text-secondary)]",
};

function defaultLabel(type: BadgeType) {
  switch (type) {
    case "alreadyBought":
      return "Already bought";
    case "refurbished":
      return "Refurbished";
    case "offer":
      return "Promo";
    case "priceFlag":
      return "Hot price";
    case "loyalty":
      return "200";
    case "habituallyInStock":
      return "Usually in stock";
    case "inStock":
      return "0";
    case "availableJX":
      return "0";
    case "notInStock":
      return "0";
    case "criteria":
      return "Label";
    default:
      return "Label";
  }
}

export function Badge({ className, type = "default", label, value = "Value", ...props }: BadgeProps) {
  const text = label ?? defaultLabel(type);

  return (
    <div className={cn(baseClass, stylesByType[type], className)} {...props}>
      {type === "refurbished" && (
        <span aria-hidden="true" className="inline-flex h-[var(--spacing-3)] w-[var(--spacing-3)] items-center justify-center">
          <img src={recyclingIcon} alt="" className="h-[var(--spacing-3)] w-[var(--spacing-3)]" />
        </span>
      )}

      {type === "loyalty" && (
        <span
          aria-hidden="true"
          className="inline-flex h-[var(--spacing-3)] w-[var(--spacing-3)] items-center justify-center text-[var(--font-size-xs)]"
        >
          🎁
        </span>
      )}

      {type === "criteria" ? (
        <>
          <span className="font-[var(--font-weight-regular)]">{text}:</span>
          <span className="font-[var(--font-weight-semibold)]">{value}</span>
        </>
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
}
