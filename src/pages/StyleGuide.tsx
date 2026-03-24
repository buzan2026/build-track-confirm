import * as React from "react";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { ButtonIcon } from "@/components/Button-Icon";
import { Checkbox } from "@/components/Checkbox";
import { Icon } from "@/components/Icon";
import { IncrementalCounter } from "@/components/Incremental-Counter";
import { Input } from "@/components/Input";
import { Link } from "@/components/Link";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/Pagination";
import { Sidepanel } from "@/components/Sidepanel";
import { Table, TableColumn, TableRow } from "@/components/Table";
import { Textarea } from "@/components/Textarea";
import { cn } from "@/lib/utils";

type ColorToken = {
  name: string;
  rawValue: string;
  resolvedValue: string;
};

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\(([^)]+)\)/);
  if (!match) return rgb;
  const parts = match[1].split(",").map((p) => p.trim());
  const r = Number(parts[0]);
  const g = Number(parts[1]);
  const b = Number(parts[2]);
  const a = parts[3] !== undefined ? Number(parts[3]) : 1;
  if ([r, g, b].some((n) => Number.isNaN(n))) return rgb;
  const hex = `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  if (a < 1) return `${hex}${Math.round(a * 255).toString(16).padStart(2, "0")}`;
  return hex;
}

function resolveColorVariable(varName: string): string {
  const probe = document.createElement("span");
  probe.style.display = "none";
  probe.style.backgroundColor = `var(${varName})`;
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).backgroundColor;
  document.body.removeChild(probe);
  return rgbToHex(computed);
}

export default function StyleGuide() {
  const [colors, setColors] = React.useState<ColorToken[]>([]);

  React.useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    const tokenNames = Array.from(root)
      .filter((key) => key.startsWith("--color-"))
      .sort((a, b) => a.localeCompare(b));

    const mapped = tokenNames.map((name) => ({
      name,
      rawValue: root.getPropertyValue(name).trim(),
      resolvedValue: resolveColorVariable(name),
    }));
    setColors(mapped);
  }, []);

  const spacingTokens = React.useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const idx = i + 1;
        return `--spacing-${idx}`;
      }),
    [],
  );

  const typographySections = [
    {
      title: "HEADING",
      rows: [
        { label: "H1", font: "var(--font-heading)", weight: "600 semibold", size: "28", lh: "38", lp: "0" },
        { label: "H2", font: "var(--font-heading)", weight: "600 semibold", size: "20", lh: "27", lp: "0" },
        { label: "H3", font: "var(--font-body)", weight: "600 semibold", size: "16", lh: "24", lp: "0" },
        { label: "H4", font: "var(--font-body)", weight: "600 semibold", size: "14", lh: "20", lp: "0" },
      ],
    },
    {
      title: "HEADLINE",
      rows: [
        { label: "Extra Large", font: "var(--font-body)", weight: "600 semibold", size: "18", lh: "26", lp: "0" },
        { label: "Large", font: "var(--font-body)", weight: "600 semibold", size: "16", lh: "24", lp: "0" },
        { label: "Medium", font: "var(--font-body)", weight: "600 semibold", size: "14", lh: "20", lp: "0" },
      ],
    },
    {
      title: "BODY",
      rows: [
        { label: "Large", font: "var(--font-body)", weight: "600 semibold / 400 regular", size: "16", lh: "24", lp: "0" },
        { label: "Medium", font: "var(--font-body)", weight: "600 semibold / 400 regular", size: "14", lh: "20", lp: "0" },
        { label: "Small", font: "var(--font-body)", weight: "600 semibold / 400 regular", size: "12", lh: "16", lp: "0" },
      ],
    },
  ] as const;

  const typographyPreviewClass: Record<string, string> = {
    "HEADING-H1":
      "font-[var(--font-heading)] text-[28px] leading-[38px] font-[var(--font-weight-semibold)]",
    "HEADING-H2":
      "font-[var(--font-heading)] text-[20px] leading-[27px] font-[var(--font-weight-semibold)]",
    "HEADING-H3":
      "font-[var(--font-body)] text-[16px] leading-[24px] font-[var(--font-weight-semibold)]",
    "HEADING-H4":
      "font-[var(--font-body)] text-[14px] leading-[20px] font-[var(--font-weight-semibold)]",
    "HEADLINE-Extra Large":
      "font-[var(--font-body)] text-[18px] leading-[26px] font-[var(--font-weight-semibold)]",
    "HEADLINE-Large":
      "font-[var(--font-body)] text-[16px] leading-[24px] font-[var(--font-weight-semibold)]",
    "HEADLINE-Medium":
      "font-[var(--font-body)] text-[14px] leading-[20px] font-[var(--font-weight-semibold)]",
    "BODY-Large":
      "font-[var(--font-body)] text-[16px] leading-[24px] font-[var(--font-weight-regular)]",
    "BODY-Medium":
      "font-[var(--font-body)] text-[14px] leading-[20px] font-[var(--font-weight-regular)]",
    "BODY-Small":
      "font-[var(--font-body)] text-[12px] leading-[16px] font-[var(--font-weight-regular)]",
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] px-[var(--spacing-4)] py-[var(--spacing-4)] text-[var(--color-text-primary)]">
      <div className="mx-auto flex w-full max-w-[var(--size-sheet-max)] flex-col gap-[var(--spacing-5)]">
        <header className="flex flex-col gap-[var(--spacing-2)]">
          <h1 className="font-[var(--font-heading)] text-[var(--font-size-xxl)] leading-[var(--line-height-xxl)] font-[var(--font-weight-bold)]">Style Guide</h1>
          <p className="font-[var(--font-body)] text-[var(--font-size-s)] leading-[var(--line-height-s)] text-[var(--color-text-secondary)]">
            All design tokens and components in one place.
          </p>
        </header>

        <section className="space-y-[var(--spacing-3)]">
          <h2 className="font-[var(--font-heading)] text-[var(--font-size-l)] leading-[var(--line-height-l)] font-[var(--font-weight-bold)]">1. COLORS</h2>
          <div className="grid grid-cols-1 gap-[var(--spacing-2)] md:grid-cols-2">
            {colors.map((color) => (
              <div
                key={color.name}
                className="flex items-center gap-[var(--spacing-2)] rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] p-[var(--spacing-2)]"
              >
                <span
                  className="h-[var(--spacing-4)] w-[var(--spacing-4)] shrink-0 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)]"
                  style={{ backgroundColor: `var(${color.name})` }}
                />
                <div className="min-w-0">
                  <p className="truncate font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] font-[var(--font-weight-semibold)]">{color.name}</p>
                  <p className="truncate font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] text-[var(--color-text-secondary)]">
                    {color.resolvedValue} <span className="text-[var(--color-text-helper)]">({color.rawValue})</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-[var(--spacing-3)]">
          <h2 className="font-[var(--font-heading)] text-[var(--font-size-l)] leading-[var(--line-height-l)] font-[var(--font-weight-bold)]">2. TYPOGRAPHY</h2>
          <div className="space-y-[var(--spacing-4)]">
            <div className="space-y-[var(--spacing-2)] rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] p-[var(--spacing-3)]">
              <p className="font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] font-[var(--font-weight-semibold)] uppercase text-[var(--color-text-secondary)]">
                Exemples de titrailles
              </p>
              <div className="space-y-[var(--spacing-2)]">
                {[
                  { label: "H1", text: "Installation électrique bâtiment tertiaire" },
                  { label: "H2", text: "Tableau général basse tension" },
                  { label: "H3", text: "Circuit prises et éclairage" },
                  { label: "H4", text: "Détail des appareillages par zone" },
                ].map((item) => {
                  const key = `HEADING-${item.label}`;
                  const spec = typographySections[0].rows.find((row) => row.label === item.label);
                  return (
                    <div key={item.label} className="border-b border-[var(--color-border-subtle)] pb-[var(--spacing-2)] last:border-b-0">
                      <p className={cn("m-0 text-[var(--color-text-primary)]", typographyPreviewClass[key])}>
                        {item.label} — {item.text}
                      </p>
                      {spec ? (
                        <p className="m-0 mt-[var(--spacing-1)] font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] text-[var(--color-text-helper)]">
                          FONT {spec.font} · WEIGHT {spec.weight} · SIZE {spec.size} · LH {spec.lh} · LP {spec.lp}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {typographySections.map((section) => (
              <div key={section.title} className="space-y-[var(--spacing-2)]">
                <div className="grid grid-cols-[2fr_1fr_1fr_0.5fr_0.5fr_0.5fr] items-center gap-[var(--spacing-2)] px-[var(--spacing-2)]">
                  <span className="font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] font-[var(--font-weight-semibold)] uppercase text-[var(--color-text-secondary)]">
                    {section.title}
                  </span>
                  <span className="font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] font-[var(--font-weight-semibold)] uppercase text-[var(--color-text-secondary)]">FONT</span>
                  <span className="font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] font-[var(--font-weight-semibold)] uppercase text-[var(--color-text-secondary)]">WEIGHT</span>
                  <span className="font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] font-[var(--font-weight-semibold)] uppercase text-[var(--color-text-secondary)]">SIZE</span>
                  <span className="font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] font-[var(--font-weight-semibold)] uppercase text-[var(--color-text-secondary)]">LH</span>
                  <span className="font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] font-[var(--font-weight-semibold)] uppercase text-[var(--color-text-secondary)]">LP</span>
                </div>

                <div className="overflow-hidden rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)]">
                  {section.rows.map((row) => (
                    <div
                      key={`${section.title}-${row.label}`}
                      className="grid grid-cols-[2fr_1fr_1fr_0.5fr_0.5fr_0.5fr] items-center gap-[var(--spacing-2)] border-b border-[var(--color-border-subtle)] px-[var(--spacing-2)] py-[var(--spacing-2)] last:border-b-0"
                    >
                      <span
                        className={cn(
                          "text-[var(--color-text-primary)]",
                          typographyPreviewClass[`${section.title}-${row.label}`],
                        )}
                      >
                        {row.label}
                      </span>
                      <span className="font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] text-[var(--color-text-secondary)]">
                        {row.font}
                      </span>
                      <span className="font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] text-[var(--color-text-secondary)]">
                        {row.weight}
                      </span>
                      <span className="font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] text-[var(--color-text-secondary)]">
                        {row.size}
                      </span>
                      <span className="font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] text-[var(--color-text-secondary)]">
                        {row.lh}
                      </span>
                      <span className="font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] text-[var(--color-text-secondary)]">
                        {row.lp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-[var(--spacing-3)]">
          <h2 className="font-[var(--font-heading)] text-[var(--font-size-l)] leading-[var(--line-height-l)] font-[var(--font-weight-bold)]">3. BUTTONS</h2>
          <div className="space-y-[var(--spacing-3)] rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] p-[var(--spacing-3)]">
            {(["primary", "secondary", "tertiary", "danger"] as const).map((variant) => (
              <div key={variant} className="space-y-[var(--spacing-2)]">
                <p className="font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] font-[var(--font-weight-semibold)] uppercase text-[var(--color-text-secondary)]">{variant}</p>
                <div className="flex flex-wrap gap-[var(--spacing-2)]">
                  <Button variant={variant} size="large" className={variant === "primary" || variant === "danger" ? "text-[var(--color-white)]" : ""}>Large</Button>
                  <Button variant={variant} size="medium" className={variant === "primary" || variant === "danger" ? "text-[var(--color-white)]" : ""}>Medium</Button>
                  <Button variant={variant} size="small" className={variant === "primary" || variant === "danger" ? "text-[var(--color-white)]" : ""}>Small</Button>
                  <Button variant={variant} size="medium" loading>Loading</Button>
                  <Button variant={variant} size="medium" disabled>Disabled</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-[var(--spacing-3)]">
          <h2 className="font-[var(--font-heading)] text-[var(--font-size-l)] leading-[var(--line-height-l)] font-[var(--font-weight-bold)]">4. BADGES</h2>
          <div className="flex flex-wrap gap-[var(--spacing-2)] rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] p-[var(--spacing-3)]">
            <Badge type="alreadyBought" label="Confirmée" className="bg-[var(--color-primary)] border-transparent text-[var(--color-white)]" />
            <Badge type="priceFlag" label="En cours" className="bg-[var(--color-orange)] border-transparent text-[var(--color-white)]" />
            <Badge type="inStock" label="Livrée" className="bg-transparent border-[var(--color-success)] text-[var(--color-success)]" />
            <Badge type="offer" label="Annulée" className="bg-[var(--color-error)] border-transparent text-[var(--color-white)]" />
          </div>
        </section>

        <section className="space-y-[var(--spacing-3)]">
          <h2 className="font-[var(--font-heading)] text-[var(--font-size-l)] leading-[var(--line-height-l)] font-[var(--font-weight-bold)]">5. SPACING</h2>
          <div className="space-y-[var(--spacing-2)] rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] p-[var(--spacing-3)]">
            {spacingTokens.map((token) => (
              <div key={token} className="grid grid-cols-[var(--spacing-10)_1fr] items-center gap-[var(--spacing-2)]">
                <span className="font-[var(--font-body)] text-[var(--font-size-xs)] leading-[var(--line-height-xs)] text-[var(--color-text-secondary)]">{token}</span>
                <div className="h-[var(--spacing-2)] rounded-[var(--border-radius-sm)] bg-[var(--color-alert-info-bg)]" style={{ width: `var(${token})` }} />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-[var(--spacing-3)]">
          <h2 className="font-[var(--font-heading)] text-[var(--font-size-l)] leading-[var(--line-height-l)] font-[var(--font-weight-bold)]">6. ELEVATION</h2>
          <div className="grid grid-cols-1 gap-[var(--spacing-3)] md:grid-cols-2">
            {(["--shadow-1", "--shadow-2", "--shadow-3", "--shadow-4", "--shadow-5"] as const).map((shadow) => (
              <div
                key={shadow}
                className="rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-white)] p-[var(--spacing-3)]"
                style={{ boxShadow: `var(${shadow})` }}
              >
                <p className="font-[var(--font-body)] text-[var(--font-size-s)] leading-[var(--line-height-s)] font-[var(--font-weight-semibold)]">{shadow}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-[var(--spacing-3)]">
          <h2 className="font-[var(--font-heading)] text-[var(--font-size-l)] leading-[var(--line-height-l)] font-[var(--font-weight-bold)]">7. COMPONENTS</h2>
          <div className="space-y-[var(--spacing-3)] rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] p-[var(--spacing-3)]">
            <div className="flex flex-wrap items-center gap-[var(--spacing-2)]">
              <ButtonIcon visualType="primary" />
              <ButtonIcon visualType="secondary" />
              <Icon size="20" />
              <Link href="#" variant="primary" size="medium">Sample link</Link>
              <Checkbox defaultChecked />
            </div>

            <div className="grid grid-cols-1 gap-[var(--spacing-3)] md:grid-cols-2">
              <Input placeholder="Input sample" />
              <Textarea placeholder="Textarea sample" />
            </div>

            <IncrementalCounter defaultValue={2} size="medium" />

            <Table title="Table Component" columns={2}>
              <TableColumn>
                <TableRow label="Reference" value="CMD-2026-0847" />
                <TableRow label="Status" value="Confirmée" />
              </TableColumn>
              <TableColumn>
                <TableRow label="Supplier" value="Rexel France" />
                <TableRow label="Total HT" value="2 847,60 €" />
              </TableColumn>
            </Table>

            <Pagination>
              <PaginationContent>
                <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                <PaginationItem><PaginationNext href="#" /></PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="overflow-hidden rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)]">
              <Sidepanel
                title="Sidepanel"
                showClose={false}
                className="min-h-0 h-auto max-w-none border-0 shadow-none"
                footer={
                  <>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="primary" className="text-[var(--color-white)]">Primary</Button>
                  </>
                }
              >
                <div className="py-[var(--spacing-2)]">
                  <p className="text-[var(--font-size-s)] leading-[var(--line-height-s)] text-[var(--color-text-secondary)]">
                    Sidepanel body sample content.
                  </p>
                </div>
              </Sidepanel>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

