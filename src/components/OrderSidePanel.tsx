import { useState } from "react";
import {
  CheckCircle, Truck, Package, AlertTriangle, XCircle,
  ClipboardCheck, FileText, ShoppingCart,
  Phone, Mail, X, Copy, Check, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { useOrderWithDetails, type ShipmentRow, type LineItemRow } from "@/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/* ── Product image helper ── */
function productImageUrl(ref: string) {
  const hash = Array.from(ref).reduce((a, c) => a + c.charCodeAt(0), 0);
  const id = (hash % 200) + 10;
  return `https://picsum.photos/seed/${id}/64/64`;
}

/* ── Status config ── */
const statusMeta: Record<string, { label: string; icon: typeof CheckCircle; colorClass: string; bgClass: string }> = {
  on_track: { label: "On track", icon: CheckCircle, colorClass: "text-[var(--color-success)]", bgClass: "bg-[var(--color-alert-success-bg)] border-[var(--color-success)]" },
  being_prepared: { label: "Being prepared", icon: Package, colorClass: "text-[var(--color-info)]", bgClass: "bg-[var(--color-alert-info-bg)] border-[var(--color-info)]" },
  in_transit: { label: "In transit", icon: Truck, colorClass: "text-[var(--color-info)]", bgClass: "bg-[var(--color-alert-info-bg)] border-[var(--color-info)]" },
  partially_delivered: { label: "Partially delivered", icon: Package, colorClass: "text-[var(--color-warning)]", bgClass: "bg-[var(--color-alert-warning-bg)] border-[var(--color-warning)]" },
  delayed: { label: "Delayed", icon: AlertTriangle, colorClass: "text-[var(--color-warning)]", bgClass: "bg-[var(--color-alert-warning-bg)] border-[var(--color-warning)]" },
  cancelled: { label: "Cancelled", icon: XCircle, colorClass: "text-[var(--color-error)]", bgClass: "bg-[var(--color-alert-error-bg)] border-[var(--color-error)]" },
  completed: { label: "Completed", icon: CheckCircle, colorClass: "text-[var(--color-success)]", bgClass: "bg-[var(--color-alert-success-bg)] border-[var(--color-success)]" },
};

/* ── Shipment tracking ── */
const trackingSteps = [
  { key: "confirmed", label: "Confirmed", icon: ClipboardCheck },
  { key: "in_transit", label: "In transit", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Package },
];

function stepIndex(status: string) {
  if (status === "delivered") return 2;
  if (status === "in_transit") return 1;
  return 0;
}

/* ── Helpers ── */
function fmtDate(d: string | null) {
  if (!d) return "—";
  return format(new Date(d), "dd/MM/yyyy");
}
function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(n);
}

/* ── Copy pill button ── */
function CopyPill({ text }: { text: string }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); toast.success("Copied"); }}
      className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border-subtle)] bg-white px-2.5 py-0.5 text-[12px] font-semibold text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors"
    >
      {text}
      <Copy className="h-3 w-3 text-[var(--color-primary)]" />
    </button>
  );
}

/* ── Shipment mini tracker ── */
function ShipmentMini({ shipment, lineItems }: { shipment: ShipmentRow; lineItems: LineItemRow[] }) {
  const current = stepIndex(shipment.status);
  const items = lineItems.filter((li) => li.shipment_id === shipment.id);

  return (
    <div className="rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">Shipment {shipment.shipment_index}</span>
        <span className="text-[12px] text-[var(--color-text-secondary)]">{shipment.carrier ?? ""}</span>
      </div>

      {/* Mini stepper */}
      <div className="flex items-center gap-1 mb-3">
        {trackingSteps.map((step, i) => {
          const done = i <= current;
          return (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full",
                done ? "bg-[var(--color-primary)] text-[var(--color-white)]" : "bg-[var(--color-bg-layer-01)] text-[var(--color-text-placeholder)]",
              )}>
                <step.icon className="h-3 w-3" />
              </div>
              {i < trackingSteps.length - 1 && (
                <div className={cn("h-0.5 flex-1", i < current ? "bg-[var(--color-primary)]" : "bg-[var(--color-border-subtle)]")} />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[12px] text-[var(--color-text-secondary)] mb-2">
        {shipment.status === "delivered"
          ? `Delivered ${fmtDate(shipment.delivered_at)}${shipment.delivered_signed_by ? ` — Signed by ${shipment.delivered_signed_by}` : ""}`
          : `Expected ${fmtDate(shipment.expected_delivery)}`}
      </p>

      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((item) => {
            const delivered = item.quantity - item.remaining;
            const pct = item.quantity > 0 ? Math.round((delivered / item.quantity) * 100) : 0;
            return (
              <div key={item.id} className="flex items-center gap-2 text-[12px]">
                <img src={productImageUrl(item.product_reference)} alt={item.product_name} className="h-6 w-6 rounded border border-[var(--color-border-subtle)] object-cover shrink-0" />
                <span className="truncate text-[var(--color-text-primary)]">{item.product_name}</span>
                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                  <Progress value={pct} className="h-1 w-10" />
                  <span className="text-[var(--color-text-secondary)]">{delivered}/{item.quantity}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Mock documents ── */
const MOCK_DOCUMENTS = [
  { name: "Invoice INV-2024-0847", type: "Invoice", date: "2024-12-15", icon: FileText },
  { name: "Delivery note BL-2024-1293", type: "Delivery note", date: "2024-12-14", icon: FileText },
  { name: "Order confirmation", type: "Confirmation", date: "2024-12-10", icon: ClipboardCheck },
  { name: "Pro-forma invoice", type: "Pro-forma", date: "2024-12-09", icon: FileText },
  { name: "Technical datasheet — Câble R2V", type: "Technical", date: "2024-12-08", icon: FileText },
  { name: "Certificate of conformity", type: "Certificate", date: "2024-12-08", icon: ClipboardCheck },
  { name: "Material Safety Data Sheet", type: "MSDS", date: "2024-12-07", icon: FileText },
  { name: "Warranty certificate", type: "Warranty", date: "2024-12-05", icon: ClipboardCheck },
];

/* ── Side Panel ── */
interface OrderSidePanelProps {
  orderNumber: string | null;
  onClose: () => void;
}

type TabKey = "detail" | "documents" | "reception";

export default function OrderSidePanel({ orderNumber, onClose }: OrderSidePanelProps) {
  const { data, isLoading, refetch } = useOrderWithDetails(orderNumber ?? undefined);
  const [returnOpen, setReturnOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("detail");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const open = !!orderNumber;

  const toggleItem = (id: string) => setCheckedItems((p) => ({ ...p, [id]: !p[id] }));
  const checkedCount = data ? Object.values(checkedItems).filter(Boolean).length : 0;
  const allChecked = data ? data.lineItems.length > 0 && checkedCount === data.lineItems.length : false;

  const checkAll = () => {
    if (!data) return;
    const all: Record<string, boolean> = {};
    data.lineItems.forEach((li) => { all[li.id] = true; });
    setCheckedItems(all);
  };

  const handleValidateReception = async () => {
    if (!data) return;
    // Update order status to completed
    await supabase.from("orders").update({ status: "completed", items_remaining: 0 }).eq("id", data.order.id);
    // Update all shipments to delivered
    for (const s of data.shipments) {
      await supabase.from("shipments").update({ status: "delivered", delivered_at: new Date().toISOString() }).eq("id", s.id);
    }
    // Update line items remaining to 0
    for (const li of data.lineItems) {
      await supabase.from("line_items").update({ remaining: 0 }).eq("id", li.id);
    }
    setCheckedItems({});
    refetch();
    toast.success("Reception confirmed", { description: `${data.lineItems.length} item(s) validated — order marked as completed` });
  };

  const handleReorderItem = (item: LineItemRow) => {
    toast.success(`${item.product_name} added to cart`, { description: `Qty: ${item.quantity}` });
  };

  const handleReorderAll = () => {
    if (!data) return;
    toast.success(`${data.lineItems.length} item(s) added to cart`, { description: `From order ${data.order.order_number}` });
  };

  // Reset tab when panel opens/closes
  const handleOpenChange = (v: boolean) => {
    if (!v) {
      onClose();
      setActiveTab("detail");
      setCheckedItems({});
    }
  };

  const tabs: { key: TabKey; label: string; icon: typeof FileText }[] = [
    { key: "detail", label: "Detail", icon: Package },
    { key: "documents", label: "Documents", icon: FileText },
    { key: "reception", label: "Reception", icon: ClipboardCheck },
  ];

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] p-0 flex flex-col [&>button]:hidden"
      >
        {isLoading ? (
          <div className="p-5 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !data ? (
          <div className="p-5 text-center text-[var(--color-text-secondary)]">Order not found</div>
        ) : (
          <>
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-[var(--color-bg-page)] border-b border-[var(--color-border-subtle)]">
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CopyPill text={data.order.order_number} />
                      {(() => {
                        const meta = statusMeta[data.order.status] ?? statusMeta.on_track;
                        const Icon = meta.icon;
                        return (
                          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-semibold", meta.bgClass, meta.colorClass)}>
                            <Icon className="h-3 w-3" />{meta.label}
                          </span>
                        );
                      })()}
                    </div>
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
                    Ordered <span className="font-semibold text-[var(--color-text-primary)]">{fmtDate(data.order.order_date)}</span>
                    {data.order.po_number && <> · PO: {data.order.po_number}</>}
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex px-5 border-t border-[var(--color-border-subtle)]">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold border-b-2 -mb-px transition-colors",
                        activeTab === tab.key
                          ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                          : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      )}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ===== Detail Tab ===== */}
              {activeTab === "detail" && (
                <div className="px-5 py-4 space-y-4">
                  {/* Summary row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-[var(--border-radius-sm)] bg-[var(--color-bg-layer-01)] p-3 text-center">
                      <p className="text-[16px] font-bold font-[var(--font-heading)] text-[var(--color-text-primary)]">{fmtCurrency(data.order.total_amount)}</p>
                      <p className="text-[12px] text-[var(--color-text-secondary)] uppercase">Total excl. tax</p>
                    </div>
                    <div className="rounded-[var(--border-radius-sm)] bg-[var(--color-bg-layer-01)] p-3 text-center">
                      <p className="text-[16px] font-bold font-[var(--font-heading)] text-[var(--color-text-primary)]">{data.lineItems.length}</p>
                      <p className="text-[12px] text-[var(--color-text-secondary)] uppercase">Items</p>
                    </div>
                    <div className="rounded-[var(--border-radius-sm)] bg-[var(--color-bg-layer-01)] p-3 text-center">
                      <p className="text-[16px] font-bold font-[var(--font-heading)] text-[var(--color-text-primary)]">{data.shipments.length}</p>
                      <p className="text-[12px] text-[var(--color-text-secondary)] uppercase">Shipments</p>
                    </div>
                  </div>

                  {/* Delivery info */}
                  {data.order.status !== "cancelled" && (
                    <div className="rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] p-3">
                      <p className="text-[12px] text-[var(--color-text-secondary)] mb-1">Expected delivery</p>
                      <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">{fmtDate(data.order.expected_delivery)}</p>
                      {data.order.previous_expected_delivery && data.order.status === "delayed" && (
                        <p className="text-[12px] text-[var(--color-warning)] mt-1">
                          <AlertTriangle className="inline h-3 w-3 mr-1" />
                          Originally <span className="line-through">{fmtDate(data.order.previous_expected_delivery)}</span>
                        </p>
                      )}
                      {data.order.items_remaining > 0 && (
                        <p className="text-[12px] text-[var(--color-text-secondary)] mt-1">{data.order.items_remaining} item(s) remaining</p>
                      )}
                    </div>
                  )}

                  {/* Shipments */}
                  {data.shipments.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Shipments</h3>
                      {data.shipments.map((s) => (
                        <ShipmentMini key={s.id} shipment={s} lineItems={data.lineItems} />
                      ))}
                    </div>
                  )}

                  {/* Items not in any shipment */}
                  {(() => {
                    const unassigned = data.lineItems.filter((li) => !li.shipment_id);
                    if (unassigned.length === 0) return null;
                    return (
                      <div className="space-y-2">
                        <h3 className="text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Awaiting shipment</h3>
                        {unassigned.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-[13px] rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] p-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={productImageUrl(item.product_reference)} alt={item.product_name} className="h-8 w-8 rounded border border-[var(--color-border-subtle)] object-cover shrink-0" />
                              <div className="min-w-0">
                                <p className="font-semibold text-[var(--color-text-primary)] truncate">{item.product_name}</p>
                                <CopyPill text={item.product_reference} />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              <div className="text-right">
                                <p className="text-[var(--color-text-primary)]">×{item.quantity}</p>
                                <p className="text-[12px] text-[var(--color-text-secondary)]">{fmtCurrency(item.unit_price)}</p>
                              </div>
                              <button
                                onClick={() => handleReorderItem(item)}
                                className="h-7 w-7 flex items-center justify-center rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] text-[var(--color-primary)] hover:bg-[var(--color-rexel-primary-10)] transition-colors"
                                title="Reorder this item"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* All line items with reorder */}
                  {data.lineItems.filter((li) => li.shipment_id).length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">All items</h3>
                      {data.lineItems.filter((li) => li.shipment_id).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-[13px] rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] p-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <img src={productImageUrl(item.product_reference)} alt={item.product_name} className="h-8 w-8 rounded border border-[var(--color-border-subtle)] object-cover shrink-0" />
                            <div className="min-w-0">
                              <p className="font-semibold text-[var(--color-text-primary)] truncate">{item.product_name}</p>
                              <CopyPill text={item.product_reference} />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <div className="text-right">
                              <p className="text-[var(--color-text-primary)]">×{item.quantity}</p>
                              <p className="text-[12px] text-[var(--color-text-secondary)]">{fmtCurrency(item.unit_price)}</p>
                            </div>
                            <button
                              onClick={() => handleReorderItem(item)}
                              className="h-7 w-7 flex items-center justify-center rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] text-[var(--color-primary)] hover:bg-[var(--color-rexel-primary-10)] transition-colors"
                              title="Reorder this item"
                            >
                              <ShoppingCart className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contact block */}
                  <div className="rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] p-3">
                    <p className="text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Your sales rep</p>
                    <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">Gisèle Michu — Agence Paris-Est</p>
                    <p className="text-[12px] text-[var(--color-text-secondary)] mt-1">
                      <Phone className="inline h-3 w-3 mr-1" />01 23 45 67 89
                      <span className="mx-1.5">·</span>
                      <Mail className="inline h-3 w-3 mr-1" />gisele.michu@rexel.fr
                    </p>
                  </div>
                </div>
              )}

              {/* ===== Documents Tab ===== */}
              {activeTab === "documents" && (
                <div className="px-5 py-4 space-y-3">
                  <p className="text-[12px] text-[var(--color-text-secondary)]">
                    {MOCK_DOCUMENTS.length} document(s) associated with this order
                  </p>
                  {MOCK_DOCUMENTS.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] p-3 hover:bg-[var(--color-bg-layer-01)] transition-colors cursor-pointer group">
                      <div className="flex h-9 w-9 items-center justify-center rounded-[var(--border-radius-sm)] bg-[var(--color-rexel-primary-10)] text-[var(--color-primary)] shrink-0">
                        <doc.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{doc.name}</p>
                        <p className="text-[12px] text-[var(--color-text-secondary)]">{doc.type} · {fmtDate(doc.date)}</p>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 h-8 w-8 flex items-center justify-center rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ===== Reception Tab ===== */}
              {activeTab === "reception" && (
                <div className="px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] text-[var(--color-text-secondary)]">
                      Check each item received, then validate.
                    </p>
                    <button onClick={checkAll} className="text-[12px] font-semibold text-[var(--color-primary)] hover:underline">
                      Check all
                    </button>
                  </div>

                  {data.lineItems.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 cursor-pointer rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] p-3 hover:bg-[var(--color-bg-layer-01)] transition-colors"
                    >
                      <Checkbox
                        checked={!!checkedItems[item.id]}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-0.5"
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img src={productImageUrl(item.product_reference)} alt={item.product_name} className="h-8 w-8 rounded border border-[var(--color-border-subtle)] object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className={cn(
                            "text-[13px] font-semibold text-[var(--color-text-primary)] truncate",
                            checkedItems[item.id] && "line-through text-[var(--color-text-secondary)]"
                          )}>
                            {item.product_name}
                          </p>
                          <p className="text-[12px] text-[var(--color-text-secondary)]">
                            <CopyPill text={item.product_reference} /> — Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}

                  <div className="pt-2 text-center text-[12px] text-[var(--color-text-secondary)]">
                    {checkedCount}/{data.lineItems.length} item(s) checked
                  </div>
                </div>
              )}
            </div>

            {/* Sticky footer */}
            <div className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] px-5 py-3 flex items-center gap-3">
              {activeTab === "reception" ? (
                <button
                  disabled={!allChecked}
                  onClick={handleValidateReception}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-[var(--border-radius-sm)] text-[13px] font-semibold transition-colors",
                    allChecked
                      ? "bg-[var(--color-success)] text-white hover:opacity-90"
                      : "bg-[var(--color-bg-layer-01)] text-[var(--color-text-placeholder)] cursor-not-allowed"
                  )}
                >
                  <Check className="h-4 w-4" /> Validate reception ({checkedCount}/{data.lineItems.length})
                </button>
              ) : (
                <button
                  onClick={handleReorderAll}
                  className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-[var(--border-radius-sm)] bg-[var(--color-primary)] text-[var(--color-white)] text-[13px] font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" /> Reorder all
                </button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
