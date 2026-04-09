import { useState } from "react";
import {
  CheckCircle, Truck, Package, AlertTriangle, XCircle,
  ClipboardCheck, FileText, RotateCcw, ShoppingCart,
  Phone, Mail, X, Copy, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { useOrderWithDetails, type ShipmentRow, type LineItemRow } from "@/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
/* ── Product image helper ── */
function productImageUrl(ref: string) {
  const hash = Array.from(ref).reduce((a, c) => a + c.charCodeAt(0), 0);
  const id = (hash % 50) + 100;
  return `https://images.unsplash.com/photo-${1550009158 + id}-cac3dad205e4?w=64&h=64&fit=crop&auto=format`;
}

/* ── Status config ── */
const statusMeta: Record<string, { label: string; icon: typeof CheckCircle; colorClass: string; bgClass: string }> = {
  on_track: { label: "On track", icon: CheckCircle, colorClass: "text-[var(--color-success)]", bgClass: "bg-[var(--color-alert-success-bg)] border-[var(--color-success)]" },
  being_prepared: { label: "Being prepared", icon: Package, colorClass: "text-[var(--color-info)]", bgClass: "bg-[var(--color-alert-info-bg)] border-[var(--color-info)]" },
  in_transit: { label: "In transit", icon: Truck, colorClass: "text-[var(--color-info)]", bgClass: "bg-[var(--color-alert-info-bg)] border-[var(--color-info)]" },
  partially_delivered: { label: "Partially delivered", icon: Package, colorClass: "text-[var(--color-warning)]", bgClass: "bg-[var(--color-alert-warning-bg)] border-[var(--color-warning)]" },
  delayed: { label: "Delayed", icon: AlertTriangle, colorClass: "text-[var(--color-error)]", bgClass: "bg-[var(--color-alert-error-bg)] border-[var(--color-error)]" },
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
function CopyPill({ text, label }: { text: string; label?: string }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); toast.success("Copied"); }}
      className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)] px-2 py-0.5 text-[12px] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
    >
      <Copy className="h-3 w-3" />
      {label ?? text}
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

/* ── Reception Dialog ── */
function ReceptionDialog({ open, onOpenChange, lineItems }: { open: boolean; onOpenChange: (v: boolean) => void; lineItems: LineItemRow[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const allChecked = lineItems.length > 0 && checkedCount === lineItems.length;
  const confirmAll = () => {
    const all: Record<string, boolean> = {};
    lineItems.forEach((li) => { all[li.id] = true; });
    setChecked(all);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-[16px] font-bold text-[var(--color-text-primary)]">Confirm reception</DialogTitle>
          <DialogDescription className="text-[13px] text-[var(--color-text-secondary)]">
            Check each item received, then validate.
          </DialogDescription>
        </DialogHeader>
        <div className="px-5 pb-2 max-h-[50vh] overflow-y-auto space-y-2">
          <div className="flex justify-end">
            <button onClick={confirmAll} className="text-[12px] font-semibold text-[var(--color-primary)] hover:underline">
              Check all
            </button>
          </div>
          {lineItems.map((item) => (
            <label key={item.id} className="flex items-start gap-3 cursor-pointer rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] p-3 hover:bg-[var(--color-bg-layer-01)] transition-colors">
              <Checkbox checked={!!checked[item.id]} onCheckedChange={() => toggle(item.id)} className="mt-0.5" />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img src={productImageUrl(item.product_reference)} alt={item.product_name} className="h-8 w-8 rounded border border-[var(--color-border-subtle)] object-cover shrink-0" />
                <div className="min-w-0">
                  <p className={cn("text-[13px] font-semibold text-[var(--color-text-primary)] truncate", checked[item.id] && "line-through text-[var(--color-text-secondary)]")}>{item.product_name}</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">Ref: {item.product_reference} — Qty: {item.quantity}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
        <DialogFooter className="px-5 py-4 border-t border-[var(--color-border-subtle)] flex-row gap-3">
          <button onClick={() => onOpenChange(false)} className="flex-1 h-10 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] text-[13px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-layer-01)] transition-colors">
            Cancel
          </button>
          <button
            disabled={!allChecked}
            onClick={() => {
              onOpenChange(false);
              setChecked({});
              toast.success("Reception confirmed", { description: `${lineItems.length} item(s) validated`, duration: 4000 });
            }}
            className={cn(
              "flex-1 h-10 rounded-[var(--border-radius-sm)] text-[13px] font-semibold transition-colors",
              allChecked
                ? "bg-[var(--color-primary)] text-[var(--color-white)] hover:bg-[var(--color-primary-hover)]"
                : "bg-[var(--color-bg-layer-01)] text-[var(--color-text-placeholder)] cursor-not-allowed"
            )}
          >
            Validate ({checkedCount}/{lineItems.length})
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Return Request Dialog ── */
function ReturnDialog({ open, onOpenChange, lineItems }: { open: boolean; onOpenChange: (v: boolean) => void; lineItems: LineItemRow[] }) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState("");
  const toggle = (id: string) => setSelected((p) => ({ ...p, [id]: !p[id] }));
  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-[16px] font-bold text-[var(--color-text-primary)]">Request a return</DialogTitle>
          <DialogDescription className="text-[13px] text-[var(--color-text-secondary)]">
            Select the items to return and describe the reason.
          </DialogDescription>
        </DialogHeader>
        <div className="px-5 pb-2 max-h-[40vh] overflow-y-auto space-y-2">
          {lineItems.map((item) => (
            <label key={item.id} className="flex items-start gap-3 cursor-pointer rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] p-3 hover:bg-[var(--color-bg-layer-01)] transition-colors">
              <Checkbox checked={!!selected[item.id]} onCheckedChange={() => toggle(item.id)} className="mt-0.5" />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img src={productImageUrl(item.product_reference)} alt={item.product_name} className="h-8 w-8 rounded border border-[var(--color-border-subtle)] object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">{item.product_name}</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">Ref: {item.product_reference} — Qty: {item.quantity}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="px-5 py-3">
          <label className="text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5 block">Reason</label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the issue (damaged, wrong product, etc.)…"
            className="bg-[var(--color-bg-layer-01)] text-[13px]"
            rows={3}
          />
        </div>
        <DialogFooter className="px-5 py-4 border-t border-[var(--color-border-subtle)] flex-row gap-3">
          <button onClick={() => onOpenChange(false)} className="flex-1 h-10 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] text-[13px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-layer-01)] transition-colors">
            Cancel
          </button>
          <button
            disabled={selectedCount === 0 || reason.trim().length === 0}
            onClick={() => {
              onOpenChange(false);
              setSelected({});
              setReason("");
              toast.success("Return request submitted", { description: `${selectedCount} item(s) — our team will contact you`, duration: 5000 });
            }}
            className={cn(
              "flex-1 h-10 rounded-[var(--border-radius-sm)] text-[13px] font-semibold transition-colors",
              selectedCount > 0 && reason.trim().length > 0
                ? "bg-[var(--color-error)] text-[var(--color-white)] hover:opacity-90"
                : "bg-[var(--color-bg-layer-01)] text-[var(--color-text-placeholder)] cursor-not-allowed"
            )}
          >
            Submit return ({selectedCount})
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Side Panel ── */
interface OrderSidePanelProps {
  orderNumber: string | null;
  onClose: () => void;
}

export default function OrderSidePanel({ orderNumber, onClose }: OrderSidePanelProps) {
  const { data, isLoading } = useOrderWithDetails(orderNumber ?? undefined);
  const [receptionOpen, setReceptionOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  const open = !!orderNumber;

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
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
              <div className="sticky top-0 z-10 bg-[var(--color-bg-page)] border-b border-[var(--color-border-subtle)] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-[var(--font-heading)] text-[16px] font-bold text-[var(--color-text-primary)]">
                      {data.order.order_number}
                    </h2>
                    <CopyPill text={data.order.order_number} label="Copy" />
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
                      <p className="text-[12px] text-[var(--color-error)] mt-1">
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
                          <div className="text-right shrink-0 ml-3">
                            <p className="text-[var(--color-text-primary)]">×{item.quantity}</p>
                            <p className="text-[12px] text-[var(--color-text-secondary)]">{fmtCurrency(item.unit_price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

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
            </div>

            {/* Sticky footer */}
            <div className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] px-5 py-3 flex items-center gap-3">
              <button
                onClick={() => toast.info("Confirm reception feature coming soon")}
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] text-[13px] font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-layer-01)] transition-colors"
              >
                <CheckCircle className="h-4 w-4" /> Confirm reception
              </button>
              <button
                onClick={() => toast.info("Documents feature coming soon")}
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] text-[13px] font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-layer-01)] transition-colors"
              >
                <FileText className="h-4 w-4" /> Documents
              </button>
            </div>
            <div className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] px-5 py-3 flex items-center gap-3">
              <button
                onClick={() => toast.info("Return request feature coming soon")}
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] text-[13px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-layer-01)] transition-colors"
              >
                <RotateCcw className="h-4 w-4" /> Request a return
              </button>
              <button
                onClick={() => toast.info("Reorder feature coming soon")}
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-[var(--border-radius-sm)] bg-[var(--color-primary)] text-[var(--color-white)] text-[13px] font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                <ShoppingCart className="h-4 w-4" /> Reorder
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
