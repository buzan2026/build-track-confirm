import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, X, AlertTriangle, XCircle, CheckCircle, Package, Clock,
  Truck, Copy, Download, CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrders, useLineItems, type OrderRow, type LineItemRow } from "@/hooks/useOrders";
import { toast } from "sonner";
import { format, subDays, subMonths, subYears, startOfDay, startOfYear, isAfter, isBefore } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Status config ---
const statusMeta: Record<string, { label: string; icon: typeof CheckCircle; colorClass: string; bgClass: string }> = {
  on_track: { label: "On track", icon: CheckCircle, colorClass: "text-[var(--color-success)]", bgClass: "bg-[var(--color-alert-success-bg)] border-[var(--color-success)]" },
  being_prepared: { label: "Being prepared", icon: Package, colorClass: "text-[var(--color-info)]", bgClass: "bg-[var(--color-alert-info-bg)] border-[var(--color-info)]" },
  in_transit: { label: "In transit", icon: Truck, colorClass: "text-[var(--color-info)]", bgClass: "bg-[var(--color-alert-info-bg)] border-[var(--color-info)]" },
  partially_delivered: { label: "Partially delivered", icon: Package, colorClass: "text-[var(--color-warning)]", bgClass: "bg-[var(--color-alert-warning-bg)] border-[var(--color-warning)]" },
  delayed: { label: "Delayed", icon: AlertTriangle, colorClass: "text-[var(--color-error)]", bgClass: "bg-[var(--color-alert-error-bg)] border-[var(--color-error)]" },
  cancelled: { label: "Cancelled", icon: XCircle, colorClass: "text-[var(--color-error)]", bgClass: "bg-[var(--color-alert-error-bg)] border-[var(--color-error)]" },
  completed: { label: "Completed", icon: CheckCircle, colorClass: "text-[var(--color-success)]", bgClass: "bg-[var(--color-alert-success-bg)] border-[var(--color-success)]" },
};

function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta[status] ?? statusMeta.on_track;
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", meta.bgClass, meta.colorClass)}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

// --- Date presets ---
type DatePreset = { label: string; getFrom: () => Date };
const datePresets: DatePreset[] = [
  { label: "30 days", getFrom: () => subDays(new Date(), 30) },
  { label: "3 months", getFrom: () => subMonths(new Date(), 3) },
  { label: "6 months", getFrom: () => subMonths(new Date(), 6) },
  { label: "This year", getFrom: () => startOfYear(new Date()) },
  { label: "Last year", getFrom: () => startOfYear(subYears(new Date(), 1)) },
];

// --- Helpers ---
const ONGOING_STATUSES = ["on_track", "being_prepared", "in_transit", "partially_delivered", "delayed"];
const NEEDS_ATTENTION_STATUSES = ["delayed", "cancelled"];

function isOngoing(s: string) { return ONGOING_STATUSES.includes(s); }
function isCompleted(s: string) { return s === "completed"; }
function needsAttention(s: string) { return NEEDS_ATTENTION_STATUSES.includes(s); }

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return format(new Date(d), "dd/MM/yyyy");
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(n);
}

// --- Order Card ---
function OrderCard({
  order,
  lineItems,
  onClick,
  warning,
}: {
  order: OrderRow;
  lineItems: LineItemRow[];
  onClick: () => void;
  warning?: boolean;
}) {
  const orderLineItems = lineItems.filter((li) => li.order_id === order.id);
  const suppliers = [...new Set(orderLineItems.map((li) => li.supplier))];
  const displayItems = orderLineItems.slice(0, 3);
  const moreCount = orderLineItems.length - 3;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-[var(--border-radius-sm)] border p-4 transition-all hover:shadow-[var(--shadow-2)]",
        warning
          ? "border-[var(--color-warning)] bg-[rgba(232,163,61,0.08)]"
          : "border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)]"
      )}
    >
      {/* Top row: order number + status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--color-text-primary)]">{order.order_number}</span>
          <button
            onClick={(e) => { e.stopPropagation(); copyToClipboard(order.order_number); }}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            title="Copy order number"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Info row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)] mb-2">
        <span>{formatDate(order.order_date)}</span>
        <span className="font-medium text-[var(--color-text-primary)]">{formatCurrency(order.total_amount)}</span>
        {order.expected_delivery && <span>Exp. {formatDate(order.expected_delivery)}</span>}
        {order.items_remaining > 0 && <span>{order.items_remaining} items remaining</span>}
      </div>

      {/* PO + order type */}
      <div className="flex items-center gap-3 text-xs text-[var(--color-text-helper)] mb-3">
        {order.po_number && <span>PO: {order.po_number}</span>}
        <span>{order.order_type}</span>
      </div>

      {/* Product thumbnails */}
      <div className="flex items-center gap-2">
        {displayItems.map((li) => (
          <div
            key={li.id}
            className="flex h-8 items-center rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)] px-2 text-[10px] text-[var(--color-text-secondary)]"
            title={li.product_name}
          >
            {li.supplier.slice(0, 3).toUpperCase()}
          </div>
        ))}
        {moreCount > 0 && (
          <span className="text-xs text-[var(--color-text-secondary)]">+{moreCount} more</span>
        )}
      </div>

      {/* Delayed alert */}
      {order.status === "delayed" && order.previous_expected_delivery && (
        <div className="mt-3 rounded border border-[var(--color-warning)] bg-[var(--color-alert-warning-bg)] p-2 text-xs text-[var(--color-alert-warning-text)]">
          <AlertTriangle className="inline h-3 w-3 mr-1" />
          New delivery date: {formatDate(order.expected_delivery)} instead of{" "}
          <span className="line-through">{formatDate(order.previous_expected_delivery)}</span>
          {" — Delayed by carrier"}
        </div>
      )}

      {/* Partially delivered note */}
      {order.status === "partially_delivered" && (
        <div className="mt-3 text-xs text-[var(--color-text-secondary)]">
          Items remaining: {order.items_remaining} | Next expected delivery: {formatDate(order.expected_delivery)}
        </div>
      )}
    </div>
  );
}

// --- Main component ---
export default function OrderHistory() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: lineItems = [], isLoading: itemsLoading } = useLineItems();
  const isLoading = ordersLoading || itemsLoading;

  const [activeTab, setActiveTab] = useState<"ongoing" | "backorders" | "completed">("ongoing");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDatePreset, setActiveDatePreset] = useState<string | null>("3 months");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(subMonths(new Date(), 3));
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(10);

  // Distinct projects
  const projects = useMemo(
    () => [...new Set(orders.map((o) => o.project_name).filter(Boolean))] as string[],
    [orders]
  );

  // Tab counts
  const ongoingCount = orders.filter((o) => isOngoing(o.status)).length;
  const backorderCount = orders.filter(
    (o) => o.items_remaining > 0 && o.status !== "completed"
  ).length;
  const completedCount = orders.filter((o) => isCompleted(o.status)).length;

  // Filtering
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return orders
      .filter((o) => {
        if (activeTab === "ongoing") return isOngoing(o.status);
        if (activeTab === "completed") return isCompleted(o.status);
        if (activeTab === "backorders") return o.items_remaining > 0 && o.status !== "completed";
        return true;
      })
      .filter((o) => {
        if (!q) return true;
        const orderMatch =
          o.order_number.toLowerCase().includes(q) ||
          (o.po_number?.toLowerCase().includes(q) ?? false);
        const itemMatch = lineItems
          .filter((li) => li.order_id === o.id)
          .some(
            (li) =>
              li.product_name.toLowerCase().includes(q) ||
              li.product_reference.toLowerCase().includes(q) ||
              li.supplier.toLowerCase().includes(q)
          );
        return orderMatch || itemMatch;
      })
      .filter((o) => {
        const d = new Date(o.order_date);
        if (dateFrom && d < startOfDay(dateFrom)) return false;
        if (dateTo && d > new Date(dateTo.getTime() + 86400000)) return false;
        return true;
      })
      .filter((o) => {
        if (projectFilter === "all") return true;
        return o.project_name === projectFilter;
      });
  }, [orders, lineItems, activeTab, searchQuery, dateFrom, dateTo, projectFilter]);

  // Split: needs attention vs ongoing
  const needsAttentionOrders = activeTab === "ongoing" ? filtered.filter((o) => needsAttention(o.status)) : [];
  const ongoingOrders = activeTab === "ongoing" ? filtered.filter((o) => !needsAttention(o.status)) : filtered;

  // Reset visible count on filter change
  useEffect(() => { setVisibleCount(10); }, [activeTab, searchQuery, dateFrom, dateTo, projectFilter]);

  const applyPreset = (label: string, getFrom: () => Date) => {
    if (activeDatePreset === label) {
      setActiveDatePreset(null);
      setDateFrom(undefined);
      setDateTo(undefined);
    } else {
      setActiveDatePreset(label);
      setDateFrom(startOfDay(getFrom()));
      setDateTo(label === "Last year" ? new Date(new Date().getFullYear() - 1, 11, 31) : undefined);
    }
  };

  // CSV export
  const exportCSV = () => {
    const rows = filtered.map((o) => ({
      order_number: o.order_number,
      po_number: o.po_number ?? "",
      status: o.status,
      order_date: o.order_date,
      expected_delivery: o.expected_delivery ?? "",
      total_amount: o.total_amount,
      items_remaining: o.items_remaining,
      project: o.project_name ?? "",
    }));
    const headers = Object.keys(rows[0] ?? {});
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${(r as any)[h]}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const tabs = [
    { key: "ongoing" as const, label: `Ongoing (${ongoingCount})` },
    { key: "backorders" as const, label: `Backorders (${backorderCount})` },
    { key: "completed" as const, label: `Completed (${completedCount})` },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[var(--font-heading)] text-[var(--font-size-xl)] font-bold text-[var(--color-text-primary)]">
          Order History
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Track and manage all your orders
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border-subtle)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="space-y-3">
        {/* Search + Project + Export */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-placeholder)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number, reference, PO number, or supplier"
              className="h-10 w-full rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] pl-9 pr-9 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[220px] h-10 border-[var(--color-border-subtle)]">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            onClick={exportCSV}
            className="inline-flex h-10 items-center gap-1.5 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] px-4 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-layer-01)] transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Date chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {datePresets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.label, p.getFrom)}
              className={cn(
                "h-8 rounded-full border px-3 text-xs font-medium transition-colors",
                activeDatePreset === p.label
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              )}
            >
              {p.label}
            </button>
          ))}

          <div className="h-4 w-px bg-[var(--color-border-subtle)] mx-1" />

          {/* Custom date pickers */}
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn(
                "inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors",
                dateFrom && !activeDatePreset
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
              )}>
                <CalendarIcon className="h-3 w-3" />
                {dateFrom && !activeDatePreset ? format(dateFrom, "dd/MM/yy") : "From"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFrom} onSelect={(d) => { setDateFrom(d ?? undefined); setActiveDatePreset(null); }} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button className={cn(
                "inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors",
                dateTo
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
              )}>
                <CalendarIcon className="h-3 w-3" />
                {dateTo ? format(dateTo, "dd/MM/yy") : "To"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateTo} onSelect={(d) => { setDateTo(d ?? undefined); setActiveDatePreset(null); }} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>

        {/* Active search chip */}
        {searchQuery && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-rexel-primary-10)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery("")}><X className="h-3 w-3" /></button>
            </span>
          </div>
        )}
      </div>

      {/* Needs Attention section */}
      {needsAttentionOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Needs attention ({needsAttentionOrders.length})
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {needsAttentionOrders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                lineItems={lineItems}
                onClick={() => navigate(`/orders/${o.order_number}`)}
                warning
              />
            ))}
          </div>
        </div>
      )}

      {/* Main list */}
      {activeTab === "ongoing" && ongoingOrders.length > 0 && (
        <div className="space-y-3">
          {needsAttentionOrders.length > 0 && (
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Ongoing ({ongoingOrders.length})
            </h2>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            {ongoingOrders.slice(0, visibleCount).map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                lineItems={lineItems}
                onClick={() => navigate(`/orders/${o.order_number}`)}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab !== "ongoing" && ongoingOrders.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {ongoingOrders.slice(0, visibleCount).map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              lineItems={lineItems}
              onClick={() => navigate(`/orders/${o.order_number}`)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-16 w-16 text-[var(--color-text-secondary)] mb-4" strokeWidth={1} />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
            {searchQuery || projectFilter !== "all" ? "No orders match your search" : "No orders yet"}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4 max-w-sm">
            {searchQuery || projectFilter !== "all"
              ? "Try a different reference, PO number, or clear your filters."
              : "Your orders will appear here once you place your first one."}
          </p>
          {(searchQuery || projectFilter !== "all" || dateFrom || dateTo) && (
            <button
              onClick={() => { setSearchQuery(""); setProjectFilter("all"); setDateFrom(undefined); setDateTo(undefined); setActiveDatePreset(null); }}
              className="inline-flex h-10 items-center gap-1.5 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] px-4 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-layer-01)] transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Load more */}
      {(activeTab === "ongoing" ? ongoingOrders : filtered).length > visibleCount && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((v) => v + 10)}
            className="inline-flex h-10 items-center gap-1.5 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] px-6 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-layer-01)] transition-colors"
          >
            Load more ({(activeTab === "ongoing" ? ongoingOrders : filtered).length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
