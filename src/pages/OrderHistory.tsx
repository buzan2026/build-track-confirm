import { Badge, type BadgeType } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Sidepanel as SidePanel } from "@/components/Sidepanel";
import { Package, ChevronRight, Truck, Check, XCircle, ClipboardCheck, Download, ArrowUpDown, ArrowUp, ArrowDown, Search, X, CalendarIcon, RefreshCw, Phone, Mail, User, AlertTriangle, PackageCheck, Clock } from "lucide-react";
import { documents, type Shipment } from "@/data/demoOrders";
import { useOrderStore } from "@/stores/orderStore";
import { cn } from "@/lib/utils";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { subDays, subMonths, subYears, isAfter, startOfDay } from "date-fns";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const statusConfig: Record<string, { label: string; badgeType: BadgeType; badgeClassName: string; icon: typeof Check }> = {
  delivered: {
    label: "Livrée",
    badgeType: "inStock",
    badgeClassName: "bg-[var(--color-success)] border-transparent text-[var(--color-white)] text-[12px] leading-[16px]",
    icon: Check,
  },
  confirmed: {
    label: "Confirmée",
    badgeType: "alreadyBought",
    badgeClassName: "bg-transparent border-[var(--color-primary)] text-[var(--color-primary)] text-[12px] leading-[16px]",
    icon: Truck,
  },
  partial: {
    label: "Partielle",
    badgeType: "priceFlag",
    badgeClassName: "bg-[var(--color-orange)] border-transparent text-[var(--color-white)] text-[12px] leading-[16px]",
    icon: AlertTriangle,
  },
  cancelled: {
    label: "Annulée",
    badgeType: "offer",
    badgeClassName: "bg-[var(--color-error)] border-transparent text-[var(--color-white)] text-[12px] leading-[16px]",
    icon: XCircle,
  },
};

const steps = [
  { label: "Passée", icon: ClipboardCheck },
  { label: "Confirmée", icon: Check },
  { label: "En transit", icon: Truck },
  { label: "Livrée", icon: Package },
];

export default function OrderHistory() {
  const orders = useOrderStore((s) => s.orders);
  const markDelivered = useOrderStore((s) => s.markDelivered);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"Toutes" | "En cours" | "Livrées">("En cours");
  const [panelSection, setPanelSection] = useState<"detail" | "documents" | "reception">("detail");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const closePanel = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedOrderId(null);
      setPanelSection("detail");
      setCheckedItems({});
      setIsClosing(false);
    }, 250);
  }, []);
  const [sortKey, setSortKey] = useState<"id" | "date" | "items" | "delivery" | "status" | "total">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [activeDatePreset, setActiveDatePreset] = useState<string | null>(null);

  const datePresets = [
    { label: "30 jours", getValue: () => subDays(new Date(), 30) },
    { label: "3 mois", getValue: () => subMonths(new Date(), 3) },
    { label: "6 mois", getValue: () => subMonths(new Date(), 6) },
    { label: "1 an", getValue: () => subYears(new Date(), 1) },
  ];

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const applyPreset = (label: string, from: Date) => {
    if (activeDatePreset === label) {
      setActiveDatePreset(null);
      setDateFrom(undefined);
      setDateTo(undefined);
    } else {
      setActiveDatePreset(label);
      setDateFrom(startOfDay(from));
      setDateTo(undefined);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setActiveDatePreset(null);
  };

  const BATCH = 10;
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(BATCH);
  }, [activeFilter, searchQuery, dateFrom, dateTo]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleCount((v) => v + BATCH); },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  });

  const hasActiveFilters = searchQuery || dateFrom || dateTo;

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;

  const statusOrder: Record<string, number> = { confirmed: 0, partial: 1, delivered: 2, cancelled: 3 };

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return orders
      .filter((order) => {
        if (activeFilter === "En cours") return order.status === "confirmed" || order.status === "partial";
        if (activeFilter === "Livrées") return order.status === "delivered";
        return true;
      })
      .filter((order) => {
        if (!q) return true;
        return (
          order.id.toLowerCase().includes(q) ||
          order.supplier.toLowerCase().includes(q) ||
          order.items.some((item) => item.name.toLowerCase().includes(q) || item.reference.toLowerCase().includes(q))
        );
      })
      .filter((order) => {
        const d = new Date(order.date);
        if (dateFrom && d < startOfDay(dateFrom)) return false;
        if (dateTo && d > new Date(dateTo.getTime() + 86400000)) return false;
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        switch (sortKey) {
          case "id": cmp = a.id.localeCompare(b.id); break;
          case "date": cmp = new Date(a.date).getTime() - new Date(b.date).getTime(); break;
          case "items": cmp = a.items.length - b.items.length; break;
          case "delivery": cmp = (a.expectedDelivery === "—" ? 0 : new Date(a.expectedDelivery).getTime()) - (b.expectedDelivery === "—" ? 0 : new Date(b.expectedDelivery).getTime()); break;
          case "status": cmp = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0); break;
          case "total": cmp = a.total - b.total; break;
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [orders, activeFilter, searchQuery, dateFrom, dateTo, sortKey, sortDir]);

  const orderInvoices = selectedOrder ? documents.invoices.filter((d) => d.orderId === selectedOrder.id) : [];
  const orderSlips = selectedOrder ? documents.deliverySlips.filter((d) => d.orderId === selectedOrder.id) : [];
  const panelTabs = [
    { key: "detail", label: "Détail" },
    { key: "documents", label: "Documents" },
    { key: "reception", label: "Réception" },
  ] as const;

  return (
    <div className="min-h-screen bg-background font-[var(--font-body)]">
      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text-primary)]">Mes commandes</h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Historique et suivi de vos commandes materiaux</p>
          </div>
          <div
            className="inline-flex overflow-hidden rounded-[var(--border-radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-bg-layer-02)]"
            role="tablist"
            aria-label="Filtre des commandes"
          >
            {(["En cours", "Livrées", "Toutes"] as const).map((f, idx, arr) => (
              <Button
                key={f}
                variant={f === activeFilter ? "primary" : "secondary"}
                size="small"
                className={cn(
                  "min-w-[120px] rounded-none border-0",
                  idx < arr.length - 1 && "border-r border-[var(--color-border-strong)]",
                  f === activeFilter
                    ? "bg-[var(--color-primary)] text-[var(--color-white)]"
                    : "bg-[var(--color-bg-layer-02)] text-[var(--color-primary)]",
                )}
                role="tab"
                aria-selected={f === activeFilter}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Search bar + date presets + datepicker — justified row */}
        <div className="mb-4 flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par n° commande, fournisseur, article…"
              className="h-10 w-full rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] pl-9 pr-9 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-[var(--color-border-subtle)] shrink-0" />

          {/* Date presets */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => { setActiveDatePreset(null); setDateFrom(undefined); setDateTo(undefined); }}
              className={cn(
                "h-10 rounded-[var(--border-radius-sm)] border px-3 text-xs font-medium transition-colors",
                !activeDatePreset && !dateFrom && !dateTo
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-white)]"
                  : "border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
              )}
            >
              All
            </button>
            {datePresets.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.label, p.getValue())}
                className={cn(
                  "h-10 rounded-[var(--border-radius-sm)] border px-3 text-xs font-medium transition-colors",
                  activeDatePreset === p.label
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-white)]"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-[var(--color-border-subtle)] shrink-0" />

          {/* Date pickers */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Popover>
              <PopoverTrigger asChild>
                <button className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-[var(--border-radius-sm)] border px-3 text-xs font-medium transition-colors",
                  dateFrom && !activeDatePreset
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-white)]"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
                )}>
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {dateFrom && !activeDatePreset ? format(dateFrom, "dd/MM/yy", { locale: fr }) : "Du"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(d) => { setDateFrom(d); setActiveDatePreset(null); }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-[var(--border-radius-sm)] border px-3 text-xs font-medium transition-colors",
                  dateTo
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-white)]"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
                )}>
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {dateTo ? format(dateTo, "dd/MM/yy", { locale: fr }) : "Au"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={(d) => { setDateTo(d); setActiveDatePreset(null); }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {(dateFrom || dateTo) && !activeDatePreset && (
              <button
                onClick={() => { setDateFrom(undefined); setDateTo(undefined); setActiveDatePreset(null); }}
                className="inline-flex h-10 items-center gap-1 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] px-2 text-xs text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                title="Effacer les dates"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-sm border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] shadow-[var(--shadow-1)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)]">
                {([
                  { key: "id" as const, label: "Commande", align: "left" },
                  { key: "date" as const, label: "Date", align: "left" },
                  { key: "items" as const, label: "Articles", align: "left" },
                  { key: "delivery" as const, label: "Livraison prévue", align: "left" },
                  { key: "status" as const, label: "Statut", align: "left" },
                  { key: "total" as const, label: "Total HT", align: "right" },
                ]).map((col) => {
                  const active = sortKey === col.key;
                  const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
                  return (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "cursor-pointer select-none px-5 py-3 text-xs font-medium uppercase tracking-wider transition-colors hover:text-[var(--color-primary)]",
                        col.align === "right" ? "text-right" : "text-left",
                        active ? "text-[var(--color-primary)]" : "text-[var(--color-text-secondary)]",
                      )}
                    >
                      <span className={cn("inline-flex items-center gap-1", col.align === "right" && "flex-row-reverse")}>
                        {col.label}
                        <Icon className={cn("h-3 w-3", active ? "opacity-100" : "opacity-40")} />
                      </span>
                    </th>
                  );
                })}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {filteredOrders.slice(0, visibleCount).map((order) => {
                const cfg = statusConfig[order.status];
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <tr
                    key={order.id}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setPanelSection("detail");
                    }}
                    className={cn("group cursor-pointer transition-colors", isSelected ? "bg-[var(--color-alert-info-bg)]" : "hover:bg-[var(--color-bg-layer-01)]")}
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{order.id}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{new Date(order.date).toLocaleDateString("fr-FR")}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                        <Package className="h-3.5 w-3.5" /> {order.items.length}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">
                      {order.expectedDelivery !== "—" ? new Date(order.expectedDelivery).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge type={cfg.badgeType} label={cfg.label} className={cfg.badgeClassName} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {order.total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(order.status === "delivered" || order.status === "partial") && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="rounded-[var(--border-radius-sm)] p-1.5 text-[var(--color-text-secondary)] opacity-0 transition-all hover:bg-[var(--color-bg-layer-02)] hover:text-[var(--color-primary)] group-hover:opacity-100"
                                title="Recommander"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3" align="end" onClick={(e) => e.stopPropagation()}>
                              <p className="mb-2 text-sm text-[var(--color-text-primary)]">
                                Ajouter les {order.items.length} articles au panier ?
                              </p>
                              <div className="flex gap-2">
                                <Button variant="secondary" size="small" onClick={(e) => { e.stopPropagation(); }}>
                                  Annuler
                                </Button>
                                <Button variant="primary" size="small" className="text-[var(--color-white)]" onClick={(e) => {
                                  e.stopPropagation();
                                  toast.success(`${order.items.length} articles ajoutés au panier`);
                                }}>
                                  Confirmer
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                        <ChevronRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length > visibleCount && (
          <div ref={sentinelRef} className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border-subtle)] border-t-[var(--color-primary)]" />
          </div>
        )}
      </div>

      {selectedOrder ? (
        <div
          className={cn("fixed inset-0 z-50 flex justify-end transition-opacity duration-250", isClosing ? "bg-black/0" : "bg-black/40 animate-fade-in")}
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePanel();
          }}
        >
          <div className={cn("h-full w-full max-w-[var(--size-sheet-max)] shadow-[var(--shadow-5)]", isClosing ? "animate-slide-out-right" : "animate-slide-in-right")}>
            <SidePanel
              title=""
              onClose={closePanel}
              className="h-full"
              footer={
                panelSection === "detail" ? (
                  <>
                    <Button
                      variant="secondary"
                      className="flex-1 h-[48px] px-[40px] py-0"
                      onClick={() => toast.success(`Demande de retour initiée pour ${selectedOrder.id}`)}
                    >
                      Demander un retour
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1 h-[48px] px-[40px] py-0 text-[var(--color-white)]"
                      onClick={() => toast.success(`Nouvelle commande initiée depuis ${selectedOrder.id}`)}
                    >
                      Recommander
                    </Button>
                  </>
                ) : panelSection === "documents" ? (
                  <Button
                    variant="primary"
                    className="flex-1 h-[48px] px-[40px] py-0 text-[var(--color-white)]"
                    onClick={() => toast.success("Téléchargement groupé lancé")}
                  >
                    Download all
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      className="flex-1 h-[48px] px-[40px] py-0"
                      onClick={() => toast.success(`Demande de retour initiée pour ${selectedOrder.id}`)}
                    >
                      Demander un retour
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1 h-[48px] px-[40px] py-0 text-[var(--color-white)]"
                      disabled={!selectedOrder.items.some(it => checkedItems[it.reference])}
                      onClick={() => {
                        const allChecked = selectedOrder.items.every(it => checkedItems[it.reference]);
                        if (allChecked) {
                          markDelivered(selectedOrder.id);
                          toast.success(`Réception complète validée pour ${selectedOrder.id}`);
                        } else {
                          toast.success(`Réception partielle validée pour ${selectedOrder.id}`);
                        }
                        setCheckedItems({});
                        setPanelSection("detail");
                      }}
                    >
                      Valider la réception ({selectedOrder.items.filter(it => checkedItems[it.reference]).length}/{selectedOrder.items.length})
                    </Button>
                  </>
                )
              }
            >
              <div className="space-y-6 pb-[var(--spacing-3)]">
                <div className="space-y-[var(--spacing-3)]">
                  {/* Order title + status badge */}
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-[var(--font-heading)] text-[var(--font-size-l)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)]">
                      {selectedOrder.id}
                    </h2>
                    <Badge type={statusConfig[selectedOrder.status].badgeType} label={statusConfig[selectedOrder.status].label} className={statusConfig[selectedOrder.status].badgeClassName} />
                  </div>
                  <div
                    className="flex w-full overflow-hidden rounded-[var(--border-radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-bg-layer-02)]"
                    role="tablist"
                    aria-label="Sections du panneau"
                  >
                    {panelTabs.map((tab, idx) => (
                      <Button
                        key={tab.key}
                        size="small"
                        variant={panelSection === tab.key ? "primary" : "secondary"}
                        className={cn(
                          "flex-1 rounded-none border-0",
                          idx < panelTabs.length - 1 && "border-r border-[var(--color-border-strong)]",
                          panelSection === tab.key
                            ? "bg-[var(--color-primary)] text-[var(--color-white)]"
                            : "bg-[var(--color-bg-layer-02)] text-[var(--color-primary)]",
                        )}
                        role="tab"
                        aria-selected={panelSection === tab.key}
                        onClick={() => setPanelSection(tab.key)}
                      >
                        {tab.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">Commandée le {new Date(selectedOrder.date).toLocaleDateString("fr-FR")}</p>
                </div>
                {panelSection === "detail" ? (() => {
                  const isPartial = selectedOrder.status === "partial";
                  return (
                  <>
                    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)] p-5">
                      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Suivi livraison</p>
                      <div className="relative flex items-start justify-between">
                        <div className="absolute left-[calc(var(--spacing-4)+var(--spacing-2)+var(--spacing-1))] right-[calc(var(--spacing-4)+var(--spacing-2)+var(--spacing-1))] top-[var(--spacing-2-25)] flex">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className={cn("h-0.5 flex-1", i < selectedOrder.deliveryStep ? "bg-[var(--color-primary)]" : "bg-[var(--color-border-subtle)]")} />
                          ))}
                        </div>
                        {steps.map((step, i) => {
                          const done = i <= selectedOrder.deliveryStep;
                          return (
                            <div key={i} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                              <div className={cn("flex h-9 w-9 items-center justify-center rounded-full transition-colors", done ? "bg-[var(--color-primary)] text-[var(--color-white)]" : "bg-[var(--color-bg-layer-02)] text-[var(--color-text-secondary)]")}>
                                <step.icon className="h-4 w-4" />
                              </div>
                              <span className={cn("text-center text-xs", done ? "font-medium text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]")}>{step.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Articles grouped by shipment for partial orders, flat list otherwise */}
                    {(() => {
                      const shipments = selectedOrder.shipments;
                      const itemsByRef = Object.fromEntries(selectedOrder.items.map(it => [it.reference, it]));

                      const shipmentStatusConfig: Record<string, { label: string; icon: typeof Check; color: string }> = {
                        delivered: { label: "Livré", icon: PackageCheck, color: "text-[var(--color-success)]" },
                        in_transit: { label: "En transit", icon: Truck, color: "text-[var(--color-primary)]" },
                        pending: { label: "En attente", icon: Clock, color: "text-[var(--color-orange)]" },
                      };

                      const renderItem = (item: typeof selectedOrder.items[0], qty: number) => (
                        <div className="flex items-center justify-between gap-2 py-2 px-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{item.name}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">{item.reference}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-semibold text-[var(--color-text-primary)]">×{qty}</span>
                            <span className="text-xs text-[var(--color-text-secondary)] w-16 text-right">
                              {(qty * item.unitPrice).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                            </span>
                          </div>
                        </div>
                      );

                      if (isPartial && shipments && shipments.length > 0) {
                        return (
                          <div className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                              Envois ({shipments.length})
                            </p>
                            {shipments.map((shipment) => {
                              const sc = shipmentStatusConfig[shipment.status] || shipmentStatusConfig.pending;
                              const ShipIcon = sc.icon;
                              return (
                                <div key={shipment.id} className="overflow-hidden rounded-lg border border-[var(--color-border-subtle)]">
                                  <div className="flex items-center gap-2 bg-[var(--color-bg-layer-01)] px-3 py-2.5 border-b border-[var(--color-border-subtle)]">
                                    <ShipIcon size={14} className={sc.color} />
                                    <span className={cn("text-xs font-semibold", sc.color)}>{sc.label}</span>
                                    <span className="text-xs text-[var(--color-text-secondary)]">— {shipment.id}</span>
                                    <span className="ml-auto text-xs text-[var(--color-text-secondary)]">
                                      {format(new Date(shipment.date), "d MMM yyyy", { locale: fr })}
                                    </span>
                                  </div>
                                  <div className="divide-y divide-[var(--color-border-subtle)]">
                                    {shipment.items.map((si_item, ii) => {
                                      const fullItem = itemsByRef[si_item.reference];
                                      if (!fullItem) return null;
                                      return <div key={ii}>{renderItem(fullItem, si_item.quantity)}</div>;
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                            <div className="flex items-center justify-between px-1 pt-1">
                              <span className="text-sm font-semibold text-[var(--color-text-primary)]">Total HT</span>
                              <span className="text-lg font-bold text-[var(--color-text-primary)]">
                                {selectedOrder.total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                              </span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                            Articles commandés ({selectedOrder.items.length})
                          </p>
                          <div className="overflow-hidden rounded-lg border border-[var(--color-border-subtle)] divide-y divide-[var(--color-border-subtle)]">
                            {selectedOrder.items.map((item, i) => (
                              <div key={i}>
                                {renderItem(item, item.quantity)}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center justify-between px-1">
                            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Total HT</span>
                            <span className="text-lg font-bold text-[var(--color-text-primary)]">
                              {selectedOrder.total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                  );
                })() : null}

                {panelSection === "documents" ? (
                  <div className="space-y-5">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Factures</p>
                      <div className="space-y-2">
                        {orderInvoices.length === 0 ? (
                          <p className="text-sm text-[var(--color-text-secondary)]">Aucune facture disponible.</p>
                        ) : (
                          orderInvoices.map((doc) => (
                            <div key={doc.name} className="flex items-center justify-between rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] p-3">
                              <div>
                                <p className="text-sm font-medium text-[var(--color-text-primary)]">{doc.name}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">
                                  {new Date(doc.date).toLocaleDateString("fr-FR")} — {doc.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                                </p>
                              </div>
                              <Button
                                variant="tertiary"
                                size="icon"
                                className="text-[var(--color-primary)]"
                                onClick={() => toast.success(`Téléchargement de ${doc.name}`)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Bons de livraison</p>
                      <div className="space-y-2">
                        {orderSlips.length === 0 ? (
                          <p className="text-sm text-[var(--color-text-secondary)]">Aucun bon de livraison disponible.</p>
                        ) : (
                          orderSlips.map((doc) => (
                            <div key={doc.name} className="flex items-center justify-between rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] p-3">
                              <div>
                                <p className="text-sm font-medium text-[var(--color-text-primary)]">{doc.name}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">{new Date(doc.date).toLocaleDateString("fr-FR")}</p>
                              </div>
                              <Button
                                variant="tertiary"
                                size="icon"
                                className="text-[var(--color-primary)]"
                                onClick={() => toast.success(`Téléchargement de ${doc.name}`)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {panelSection === "reception" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                        Vérification des articles ({selectedOrder.items.filter(it => checkedItems[it.reference]).length}/{selectedOrder.items.length})
                      </p>
                      <button
                        type="button"
                        className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                        onClick={() => {
                          const allChecked = selectedOrder.items.every(it => checkedItems[it.reference]);
                          const next: Record<string, boolean> = {};
                          selectedOrder.items.forEach(it => { next[it.reference] = !allChecked; });
                          setCheckedItems(next);
                        }}
                      >
                        {selectedOrder.items.every(it => checkedItems[it.reference]) ? "Tout décocher" : "Tout confirmer"}
                      </button>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-[var(--color-border-subtle)] divide-y divide-[var(--color-border-subtle)]">
                      {selectedOrder.items.map((item) => (
                        <label
                          key={item.reference}
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-[var(--color-bg-layer-01)] transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={!!checkedItems[item.reference]}
                            onChange={() => setCheckedItems(prev => ({ ...prev, [item.reference]: !prev[item.reference] }))}
                            className="h-4 w-4 rounded border-[var(--color-border-strong)] text-[var(--color-primary)] accent-[var(--color-primary)]"
                          />
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-sm font-medium text-[var(--color-text-primary)]", checkedItems[item.reference] && "line-through text-[var(--color-text-secondary)]")}>
                              {item.name}
                            </p>
                            <p className="text-xs text-[var(--color-text-secondary)]">Réf : {item.reference} — Qté : {item.quantity}</p>
                          </div>
                          {checkedItems[item.reference] && (
                            <Check className="h-4 w-4 shrink-0 text-[var(--color-success)]" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Contact Rexel — hidden on documents tab */}
                {panelSection !== "documents" && (
                <div className="mt-auto sticky bottom-0 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-2">Votre contact Rexel</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-white)]">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">Gisèle Michu — Agence Paris-Est</p>
                      <div className="flex items-center gap-3">
                        <a href="tel:0123456789" className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline">
                          <Phone className="h-3 w-3" /> 01 23 45 67 89
                        </a>
                        <span className="text-[var(--color-border-subtle)]">·</span>
                        <a href="mailto:m.lefebvre@rexel.fr" className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline">
                          <Mail className="h-3 w-3" /> m.lefebvre@rexel.fr
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </SidePanel>
          </div>
        </div>
      ) : null}
    </div>
  );
}
