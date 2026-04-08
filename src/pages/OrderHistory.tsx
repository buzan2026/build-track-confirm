import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, X, AlertTriangle, XCircle, CheckCircle, Package,
  Truck, Copy, Download, CalendarIcon, LayoutGrid, List,
  ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Eye,
  FileText, RefreshCw, Phone, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrders, useLineItems, type OrderRow, type LineItemRow } from "@/hooks/useOrders";
import { toast } from "sonner";
import { format, subDays, subMonths, subYears, startOfDay, startOfYear } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

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

// --- Order Card (list view) ---
function OrderCard({
  order, lineItems, onClick, warning,
}: {
  order: OrderRow; lineItems: LineItemRow[]; onClick: () => void; warning?: boolean;
}) {
  const orderLineItems = lineItems.filter((li) => li.order_id === order.id);
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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)] mb-2">
        <span>{formatDate(order.order_date)}</span>
        <span className="font-medium text-[var(--color-text-primary)]">{formatCurrency(order.total_amount)}</span>
        {order.expected_delivery && <span>Exp. {formatDate(order.expected_delivery)}</span>}
        {order.items_remaining > 0 && <span>{order.items_remaining} items remaining</span>}
      </div>

      <div className="flex items-center gap-3 text-xs text-[var(--color-text-helper)] mb-3">
        {order.po_number && <span>PO: {order.po_number}</span>}
        <span>{order.order_type}</span>
      </div>

      <div className="flex items-center gap-2">
        {displayItems.map((li) => (
          <div key={li.id} className="flex h-8 items-center rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)] px-2 text-[10px] text-[var(--color-text-secondary)]" title={li.product_name}>
            {li.supplier.slice(0, 3).toUpperCase()}
          </div>
        ))}
        {moreCount > 0 && <span className="text-xs text-[var(--color-text-secondary)]">+{moreCount} more</span>}
      </div>

      {order.status === "delayed" && order.previous_expected_delivery && (
        <div className="mt-3 rounded border border-[var(--color-warning)] bg-[var(--color-alert-warning-bg)] p-2 text-xs text-[var(--color-alert-warning-text)]">
          <AlertTriangle className="inline h-3 w-3 mr-1" />
          New delivery date: {formatDate(order.expected_delivery)} instead of{" "}
          <span className="line-through">{formatDate(order.previous_expected_delivery)}</span>
          {" — Delayed by carrier"}
        </div>
      )}

      {order.status === "partially_delivered" && (
        <div className="mt-3 text-xs text-[var(--color-text-secondary)]">
          Items remaining: {order.items_remaining} | Next expected delivery: {formatDate(order.expected_delivery)}
        </div>
      )}
    </div>
  );
}

// --- Sort types for table ---
type SortKey = "order_number" | "po_number" | "order_date" | "status" | "total_amount" | "expected_delivery" | "items_remaining";

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
  const [viewMode, setViewMode] = useState<"list" | "table">("list");

  // Table state
  const [sortKey, setSortKey] = useState<SortKey>("order_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  const projects = useMemo(
    () => [...new Set(orders.map((o) => o.project_name).filter(Boolean))] as string[],
    [orders]
  );

  const ongoingCount = orders.filter((o) => isOngoing(o.status)).length;
  const backorderCount = orders.filter((o) => o.items_remaining > 0 && o.status !== "completed").length;
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
        const orderMatch = o.order_number.toLowerCase().includes(q) || (o.po_number?.toLowerCase().includes(q) ?? false);
        const itemMatch = lineItems.filter((li) => li.order_id === o.id).some(
          (li) => li.product_name.toLowerCase().includes(q) || li.product_reference.toLowerCase().includes(q) || li.supplier.toLowerCase().includes(q)
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

  // Table sorted data
  const tableSorted = useMemo(() => {
    const statusOrder: Record<string, number> = { delayed: 0, cancelled: 1, partially_delivered: 2, in_transit: 3, being_prepared: 4, on_track: 5, completed: 6 };
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "order_number": cmp = a.order_number.localeCompare(b.order_number); break;
        case "po_number": cmp = (a.po_number ?? "").localeCompare(b.po_number ?? ""); break;
        case "order_date": cmp = new Date(a.order_date).getTime() - new Date(b.order_date).getTime(); break;
        case "status": cmp = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99); break;
        case "total_amount": cmp = a.total_amount - b.total_amount; break;
        case "expected_delivery": cmp = new Date(a.expected_delivery ?? 0).getTime() - new Date(b.expected_delivery ?? 0).getTime(); break;
        case "items_remaining": cmp = a.items_remaining - b.items_remaining; break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.ceil(tableSorted.length / ROWS_PER_PAGE);
  const paginatedRows = tableSorted.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  // Split for list view
  const needsAttentionOrders = activeTab === "ongoing" ? filtered.filter((o) => needsAttention(o.status)) : [];
  const ongoingOrders = activeTab === "ongoing" ? filtered.filter((o) => !needsAttention(o.status)) : filtered;

  useEffect(() => { setVisibleCount(10); setCurrentPage(1); setSelectedIds(new Set()); }, [activeTab, searchQuery, dateFrom, dateTo, projectFilter]);

  const applyPreset = (label: string, getFrom: () => Date) => {
    if (activeDatePreset === label) {
      setActiveDatePreset(null); setDateFrom(undefined); setDateTo(undefined);
    } else {
      setActiveDatePreset(label);
      setDateFrom(startOfDay(getFrom()));
      setDateTo(label === "Last year" ? new Date(new Date().getFullYear() - 1, 11, 31) : undefined);
    }
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedRows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedRows.map((o) => o.id)));
    }
  };

  const exportCSV = (rows?: OrderRow[]) => {
    const data = rows ?? filtered;
    const csvRows = data.map((o) => ({
      order_number: o.order_number, po_number: o.po_number ?? "", status: o.status,
      order_date: o.order_date, expected_delivery: o.expected_delivery ?? "",
      total_amount: o.total_amount, items_remaining: o.items_remaining, project: o.project_name ?? "",
    }));
    const headers = Object.keys(csvRows[0] ?? {});
    const csv = [headers.join(","), ...csvRows.map((r) => headers.map((h) => `"${(r as any)[h]}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
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

  // --- Table header cell ---
  const SortableHeader = ({ colKey, label, align = "left" }: { colKey: SortKey; label: string; align?: "left" | "right" }) => {
    const active = sortKey === colKey;
    const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
    return (
      <th
        onClick={() => toggleSort(colKey)}
        className={cn(
          "cursor-pointer select-none px-4 py-3 text-xs font-medium uppercase tracking-wider transition-colors hover:text-[var(--color-primary)]",
          align === "right" ? "text-right" : "text-left",
          active ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)]",
        )}
      >
        <span className={cn("inline-flex items-center gap-1", align === "right" && "flex-row-reverse")}>
          {label}
          <Icon className={cn("h-3 w-3", active ? "opacity-100" : "opacity-40")} />
        </span>
      </th>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-[var(--font-heading)] text-[var(--font-size-xl)] font-bold text-[var(--color-text-primary)]">Order History</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Track and manage all your orders</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border-subtle)]">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn(
            "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
            activeTab === tab.key ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          )}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-placeholder)]" />
            <input
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
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
              {projects.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
            </SelectContent>
          </Select>

          <button onClick={() => exportCSV()} className="inline-flex h-10 items-center gap-1.5 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] px-4 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-layer-01)] transition-colors">
            <Download className="h-4 w-4" />
            Export CSV
          </button>

          {/* View toggle */}
          <div className="flex items-center rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={cn("flex h-10 w-10 items-center justify-center transition-colors",
                viewMode === "list" ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg-layer-02)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              )}
              title="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn("flex h-10 w-10 items-center justify-center transition-colors",
                viewMode === "table" ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg-layer-02)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              )}
              title="Table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Date chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {datePresets.map((p) => (
            <button key={p.label} onClick={() => applyPreset(p.label, p.getFrom)} className={cn(
              "h-8 rounded-full border px-3 text-xs font-medium transition-colors",
              activeDatePreset === p.label
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            )}>
              {p.label}
            </button>
          ))}
          <div className="h-4 w-px bg-[var(--color-border-subtle)] mx-1" />
          <Popover>
            <PopoverTrigger asChild>
              <button className={cn("inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors",
                dateFrom && !activeDatePreset ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
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
              <button className={cn("inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-medium transition-colors",
                dateTo ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
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

        {searchQuery && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-rexel-primary-10)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery("")}><X className="h-3 w-3" /></button>
            </span>
          </div>
        )}
      </div>

      {/* ===== TABLE VIEW ===== */}
      {viewMode === "table" && (
        <div className="space-y-0">
          {/* Bulk actions bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center justify-between rounded-t-[var(--border-radius-sm)] border border-b-0 border-[var(--color-primary)] bg-[var(--color-rexel-primary-10)] px-4 py-2.5">
              <span className="text-sm font-medium text-[var(--color-primary)]">
                {selectedIds.size} order{selectedIds.size > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const selected = filtered.filter((o) => selectedIds.has(o.id));
                    exportCSV(selected);
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[var(--border-radius-sm)] border border-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-rexel-primary-20)] transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export selection (CSV)
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="inline-flex h-8 items-center px-3 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  Clear selection
                </button>
              </div>
            </div>
          )}

          <div className={cn(
            "overflow-hidden border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] shadow-[var(--shadow-1)]",
            selectedIds.size > 0 ? "rounded-b-[var(--border-radius-sm)]" : "rounded-[var(--border-radius-sm)]"
          )}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)]">
                  <th className="px-4 py-3 w-10">
                    <Checkbox
                      checked={paginatedRows.length > 0 && selectedIds.size === paginatedRows.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <SortableHeader colKey="order_number" label="Order #" />
                  <SortableHeader colKey="po_number" label="PO #" />
                  <SortableHeader colKey="order_date" label="Date" />
                  <SortableHeader colKey="status" label="Status" />
                  <SortableHeader colKey="total_amount" label="Total" align="right" />
                  <SortableHeader colKey="expected_delivery" label="Exp. delivery" />
                  <SortableHeader colKey="items_remaining" label="Remaining" />
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {paginatedRows.map((order) => (
                  <tr
                    key={order.id}
                    className={cn(
                      "group transition-colors cursor-pointer",
                      selectedIds.has(order.id) ? "bg-[var(--color-rexel-primary-10)]" : "hover:bg-[var(--color-bg-layer-01)]"
                    )}
                    onClick={() => navigate(`/orders/${order.order_number}`)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={() => toggleSelect(order.id)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)]">{order.order_number}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{order.po_number ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{formatDate(order.order_date)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-[var(--color-text-primary)]">{formatCurrency(order.total_amount)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{formatDate(order.expected_delivery)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">{order.items_remaining}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-8 w-8 items-center justify-center rounded-[var(--border-radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-layer-01)] hover:text-[var(--color-text-primary)] transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/orders/${order.order_number}`)}>
                            <Eye className="h-4 w-4 mr-2" /> View details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" /> Download invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="h-4 w-4 mr-2" /> Reorder all
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Phone className="h-4 w-4 mr-2" /> Contact sales rep
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-[var(--color-text-secondary)]">
                Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, tableSorted.length)} of {tableSorted.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-layer-01)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-[var(--border-radius-sm)] text-xs font-medium transition-colors",
                      page === currentPage
                        ? "bg-[var(--color-primary)] text-white"
                        : "border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-layer-01)]"
                    )}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-layer-01)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== LIST VIEW ===== */}
      {viewMode === "list" && (
        <>
          {/* Needs Attention section */}
          {needsAttentionOrders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[var(--color-warning)]" />
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Needs attention ({needsAttentionOrders.length})</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {needsAttentionOrders.map((o) => (
                  <OrderCard key={o.id} order={o} lineItems={lineItems} onClick={() => navigate(`/orders/${o.order_number}`)} warning />
                ))}
              </div>
            </div>
          )}

          {activeTab === "ongoing" && ongoingOrders.length > 0 && (
            <div className="space-y-3">
              {needsAttentionOrders.length > 0 && (
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Ongoing ({ongoingOrders.length})</h2>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                {ongoingOrders.slice(0, visibleCount).map((o) => (
                  <OrderCard key={o.id} order={o} lineItems={lineItems} onClick={() => navigate(`/orders/${o.order_number}`)} />
                ))}
              </div>
            </div>
          )}

          {activeTab !== "ongoing" && ongoingOrders.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {ongoingOrders.slice(0, visibleCount).map((o) => (
                <OrderCard key={o.id} order={o} lineItems={lineItems} onClick={() => navigate(`/orders/${o.order_number}`)} />
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
        </>
      )}

      {/* Table empty state */}
      {viewMode === "table" && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-16 w-16 text-[var(--color-text-secondary)] mb-4" strokeWidth={1} />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">No orders match your search</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4 max-w-sm">Try a different reference, PO number, or clear your filters.</p>
          <button
            onClick={() => { setSearchQuery(""); setProjectFilter("all"); setDateFrom(undefined); setDateTo(undefined); setActiveDatePreset(null); }}
            className="inline-flex h-10 items-center gap-1.5 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] px-4 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-layer-01)] transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
