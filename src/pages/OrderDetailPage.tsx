import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, CheckCircle, Truck, Package, AlertTriangle, XCircle, ClipboardCheck, FileText, RotateCcw, Phone, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrderWithDetails, type ShipmentRow, type LineItemRow } from "@/hooks/useOrders";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

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

function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta[status] ?? statusMeta.on_track;
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium", meta.bgClass, meta.colorClass)}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

/* ── Shipment tracking steps ── */
const shipmentStepsMeta = [
  { key: "confirmed", label: "Confirmed", icon: ClipboardCheck },
  { key: "in_transit", label: "In transit", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Package },
];

function shipmentStepIndex(status: string) {
  if (status === "delivered") return 2;
  if (status === "in_transit") return 1;
  return 0; // confirmed, being_prepared
}

/* ── Helpers ── */
function fmtDate(d: string | null) {
  if (!d) return "—";
  return format(new Date(d), "dd/MM/yyyy");
}
function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(n);
}
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

/* ── Shipment Card ── */
function ShipmentCard({ shipment, lineItems }: { shipment: ShipmentRow; lineItems: LineItemRow[] }) {
  const currentStep = shipmentStepIndex(shipment.status);
  const shipmentItems = lineItems.filter((li) => li.shipment_id === shipment.id);

  return (
    <div className="rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[var(--font-heading)] font-semibold text-[var(--color-text-primary)]">
          Shipment {shipment.shipment_index}
        </h3>
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
          {shipment.carrier && <span>{shipment.carrier}</span>}
          {shipment.expected_delivery && <span>Exp. {fmtDate(shipment.expected_delivery)}</span>}
        </div>
      </div>

      {/* Tracking stepper */}
      <div className="flex items-start justify-between relative mb-5">
        <div className="absolute top-[18px] left-[36px] right-[36px] flex">
          {[0, 1].map((i) => (
            <div key={i} className={cn("h-0.5 flex-1", i < currentStep ? "bg-[var(--color-primary)]" : "bg-[var(--color-border-subtle)]")} />
          ))}
        </div>
        {shipmentStepsMeta.map((step, i) => {
          const done = i <= currentStep;
          const current = i === currentStep;
          return (
            <div key={i} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                done ? "bg-[var(--color-primary)] text-[var(--color-white)]" : "bg-[var(--color-bg-layer-01)] text-[var(--color-text-placeholder)]",
                current && "ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-bg-layer-02)]"
              )}>
                <step.icon className="h-4 w-4" />
              </div>
              <span className={cn("text-xs text-center", done ? "text-[var(--color-text-primary)] font-medium" : "text-[var(--color-text-placeholder)]")}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {shipment.delivered_at && (
        <p className="text-xs text-[var(--color-text-secondary)] mb-3">
          Delivered {fmtDate(shipment.delivered_at)}{shipment.delivered_signed_by && ` — Signed by ${shipment.delivered_signed_by}`}
        </p>
      )}

      {/* Items in this shipment */}
      {shipmentItems.length > 0 && (
        <div className="border-t border-[var(--color-border-subtle)] pt-3 mt-2">
          <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">{shipmentItems.length} item(s)</p>
          <div className="space-y-2">
            {shipmentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 shrink-0 rounded bg-[var(--color-bg-layer-01)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-secondary)]">
                    {item.supplier.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--color-text-primary)] truncate">{item.product_name}</p>
                    <p className="text-xs text-[var(--color-text-helper)] font-mono">{item.product_reference}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-[var(--color-text-primary)]">×{item.quantity}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{fmtCurrency(item.unit_price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useOrderWithDetails(orderNumber);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center py-16">
        <p className="text-[var(--color-text-secondary)] mb-4">Order not found</p>
        <button onClick={() => navigate("/")} className="text-[var(--color-text-link)] text-sm hover:underline">
          ← Back to orders
        </button>
      </div>
    );
  }

  const { order, shipments, lineItems } = data;
  const meta = statusMeta[order.status] ?? statusMeta.on_track;

  // Items not assigned to any shipment
  const unassignedItems = lineItems.filter((li) => !li.shipment_id);

  // Compute totals
  const computedTotal = lineItems.reduce((sum, li) => sum + li.quantity * li.unit_price, 0);
  const totalQty = lineItems.reduce((sum, li) => sum + li.quantity, 0);
  const totalDelivered = lineItems.reduce((sum, li) => sum + (li.quantity - li.remaining), 0);
  const deliveryPct = totalQty > 0 ? Math.round((totalDelivered / totalQty) * 100) : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-[var(--font-heading)] text-[var(--font-size-xl)] font-bold text-[var(--color-text-primary)]">
              {order.order_number}
            </h1>
            <button onClick={() => copyToClipboard(order.order_number)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
              <Copy className="h-4 w-4" />
            </button>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-secondary)]">
            <span>Ordered {fmtDate(order.order_date)}</span>
            {order.po_number && <span>PO: {order.po_number}</span>}
            <span>{order.order_type}</span>
            {order.project_name && (
              <span className="bg-[var(--color-bg-layer-01)] px-2 py-0.5 rounded text-xs">{order.project_name}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-[var(--font-heading)] text-[var(--font-size-xl)] font-bold text-[var(--color-text-primary)]">
            {fmtCurrency(order.total_amount)}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">excl. tax</p>
        </div>
      </div>

      {/* ── Delivery summary ── */}
      {order.status !== "cancelled" && (
        <div className="rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Delivery summary</h2>
            <span className="text-xs text-[var(--color-text-secondary)]">{deliveryPct}% delivered</span>
          </div>
          <Progress value={deliveryPct} className="h-2 mb-3" />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--color-text-secondary)]">
            <span>Expected: <strong className="text-[var(--color-text-primary)]">{fmtDate(order.expected_delivery)}</strong></span>
            {order.previous_expected_delivery && order.status === "delayed" && (
              <span>
                Originally: <span className="line-through">{fmtDate(order.previous_expected_delivery)}</span>
              </span>
            )}
            <span>{shipments.length} shipment(s)</span>
            <span>{order.items_remaining} item(s) remaining</span>
          </div>
        </div>
      )}

      {/* ── Shipments ── */}
      {shipments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Shipments ({shipments.length})</h2>
          {shipments.map((s) => (
            <ShipmentCard key={s.id} shipment={s} lineItems={lineItems} />
          ))}
        </div>
      )}

      {/* ── Unassigned items ── */}
      {unassignedItems.length > 0 && (
        <div className="rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--color-border-subtle)]">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Items awaiting shipment ({unassignedItems.length})
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)]">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Product</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Reference</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Supplier</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Qty</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Remaining</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Unit price</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {unassignedItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3 text-sm font-medium text-[var(--color-text-primary)]">{item.product_name}</td>
                  <td className="px-5 py-3 text-sm text-[var(--color-text-secondary)] font-mono">{item.product_reference}</td>
                  <td className="px-5 py-3 text-sm text-[var(--color-text-secondary)]">{item.supplier}</td>
                  <td className="px-5 py-3 text-sm text-right text-[var(--color-text-primary)]">{item.quantity}</td>
                  <td className="px-5 py-3 text-sm text-right">
                    {item.remaining > 0 ? (
                      <span className="text-[var(--color-warning)] font-medium">{item.remaining}</span>
                    ) : (
                      <span className="text-[var(--color-success)]">0</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-right text-[var(--color-text-secondary)]">{fmtCurrency(item.unit_price)}</td>
                  <td className="px-5 py-3 text-sm text-right font-semibold text-[var(--color-text-primary)]">{fmtCurrency(item.quantity * item.unit_price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[var(--color-border-subtle)]">
                <td colSpan={6} className="px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)] text-right">Total excl. tax</td>
                <td className="px-5 py-3 text-right font-[var(--font-heading)] text-lg font-bold text-[var(--color-text-primary)]">
                  {fmtCurrency(computedTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* ── All items summary ── */}
      <div className="rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--color-border-subtle)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">All items ({lineItems.length})</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)]">
              <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Product</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Reference</th>
              <th className="px-5 py-2.5 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Supplier</th>
              <th className="px-5 py-2.5 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Qty</th>
              <th className="px-5 py-2.5 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Delivered</th>
              <th className="px-5 py-2.5 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Unit price</th>
              <th className="px-5 py-2.5 text-right text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-subtle)]">
            {lineItems.map((item) => {
              const delivered = item.quantity - item.remaining;
              const pct = item.quantity > 0 ? Math.round((delivered / item.quantity) * 100) : 0;
              return (
                <tr key={item.id}>
                  <td className="px-5 py-3 text-sm font-medium text-[var(--color-text-primary)]">{item.product_name}</td>
                  <td className="px-5 py-3 text-sm text-[var(--color-text-secondary)] font-mono">{item.product_reference}</td>
                  <td className="px-5 py-3 text-sm text-[var(--color-text-secondary)]">{item.supplier}</td>
                  <td className="px-5 py-3 text-sm text-right text-[var(--color-text-primary)]">{item.quantity}</td>
                  <td className="px-5 py-3 text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Progress value={pct} className="h-1.5 w-16" />
                      <span className="text-xs text-[var(--color-text-secondary)]">{delivered}/{item.quantity}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-right text-[var(--color-text-secondary)]">{fmtCurrency(item.unit_price)}</td>
                  <td className="px-5 py-3 text-sm text-right font-semibold text-[var(--color-text-primary)]">{fmtCurrency(item.quantity * item.unit_price)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[var(--color-border-subtle)]">
              <td colSpan={6} className="px-5 py-3 text-sm font-semibold text-[var(--color-text-primary)] text-right">Total excl. tax</td>
              <td className="px-5 py-3 text-right font-[var(--font-heading)] text-lg font-bold text-[var(--color-text-primary)]">
                {fmtCurrency(computedTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Action bar ── */}
      <div className="sticky bottom-0 bg-[var(--color-bg-page)] border-t border-[var(--color-border-subtle)] -mx-6 px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/orders/${orderNumber}/reception`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--border-radius-sm)] bg-[var(--color-primary)] text-[var(--color-white)] text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            <CheckCircle className="h-4 w-4" /> Confirm reception
          </button>
          <button
            onClick={() => navigate(`/orders/${orderNumber}/documents`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--border-radius-sm)] border border-[var(--color-border-strong)] text-[var(--color-text-primary)] text-sm font-medium hover:bg-[var(--color-bg-layer-01)] transition-colors"
          >
            <FileText className="h-4 w-4" /> Documents
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.info("Return request feature coming soon")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] text-sm hover:bg-[var(--color-bg-layer-01)] transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Request a return
          </button>
          <button
            onClick={() => toast.info("Contact: Gisèle Michu — gisele.michu@rexel.fr")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] text-sm hover:bg-[var(--color-bg-layer-01)] transition-colors"
          >
            <Phone className="h-4 w-4" /> Contact rep
          </button>
        </div>
      </div>
    </div>
  );
}
