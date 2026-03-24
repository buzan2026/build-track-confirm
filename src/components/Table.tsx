import * as React from "react";

import { cn } from "@/lib/utils";

type TableColumns = 1 | 2;

const TableContext = React.createContext<{ columns: TableColumns }>({ columns: 2 });

export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Section title above the key–value blocks (Figma headline extra large). */
  title?: string;
  /** `2` = two columns side by side; `1` = stacked full width. */
  columns?: TableColumns;
}

/**
 * Key–value “table display” from the design system (Figma `8230:702`).
 * Compose with `TableColumn` and `TableRow`.
 */
function Table({ title, columns = 2, className, children, ...props }: TableProps) {
  return (
    <TableContext.Provider value={{ columns }}>
      <div
        className={cn("flex w-full max-w-full flex-col gap-[var(--spacing-2)]", className)}
        {...props}
      >
        {title != null && title !== "" && (
          <h2
            className={cn(
              "m-0 w-full font-[var(--font-heading)] font-[var(--font-weight-semibold)] leading-[var(--line-height-l)]",
              "text-[var(--font-size-l)] tracking-normal text-[var(--color-text-primary)]",
            )}
          >
            {title}
          </h2>
        )}
        <div
          className={cn(
            "flex w-full items-start overflow-hidden",
            columns === 1
              ? "flex-col"
              : "flex-row flex-wrap gap-x-[var(--spacing-3)] gap-y-[var(--spacing-none)]",
          )}
        >
          {children}
        </div>
      </div>
    </TableContext.Provider>
  );
}

export interface TableColumnProps extends React.HTMLAttributes<HTMLDivElement> {}

function TableColumn({ className, children, ...props }: TableColumnProps) {
  const { columns } = React.useContext(TableContext);

  return (
    <div
      className={cn(
        "flex min-w-[min(100%,350px)] flex-col items-stretch",
        columns === 2 ? "min-h-0 flex-1 basis-[min(100%,350px)]" : "w-full shrink-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Renders the trailing checkbox slot (Figma asset row). */
  showCheckbox?: boolean;
  /** Custom checkbox control; default is an unchecked box matching the spec. */
  checkbox?: React.ReactNode;
}

function TableRow({ label, value, showCheckbox, checkbox, className, ...props }: TableRowProps) {
  return (
    <div
      className={cn(
        "flex w-full min-h-[calc(var(--spacing-6)+var(--spacing-2)+var(--size-2px))] items-stretch border-b border-solid border-[var(--color-border-subtle)]",
        className,
      )}
      {...props}
    >
      <div className="flex min-h-0 min-w-0 flex-1 items-center bg-[var(--color-bg-layer-01)] px-[var(--spacing-3)] py-[var(--spacing-2)]">
        <div
          className={cn(
            "max-h-[var(--spacing-6)] min-w-0 flex-1 overflow-hidden text-ellipsis font-[var(--font-body)]",
            "text-[var(--font-size-s)] font-[var(--font-weight-regular)] leading-[var(--line-height-s)] tracking-normal",
            "text-[var(--color-text-secondary)]",
          )}
        >
          {label}
        </div>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 items-center gap-[var(--spacing-2)] bg-[var(--color-white)] px-[var(--spacing-3)] py-[var(--spacing-2)]">
        <div
          className={cn(
            "max-h-[var(--spacing-6)] min-w-0 flex-1 overflow-hidden text-ellipsis font-[var(--font-body)]",
            "text-[var(--font-size-s)] font-[var(--font-weight-semibold)] leading-[var(--line-height-s)] tracking-normal",
            "text-[var(--color-text-secondary)]",
          )}
        >
          {value}
        </div>
        {showCheckbox ? (
          <div className="flex size-[var(--spacing-4)] shrink-0 items-center justify-center rounded-[var(--border-radius-sm)]">
            {checkbox ?? (
              <span
                className="box-border block size-[var(--font-size-l)] shrink-0 rounded-[var(--border-radius-sm)] border border-solid border-[var(--color-primary)] bg-[var(--color-white)]"
                aria-hidden
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

Table.displayName = "Table";
TableColumn.displayName = "TableColumn";
TableRow.displayName = "TableRow";

export { Table, TableColumn, TableRow };
