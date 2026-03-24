import { Link } from "react-router-dom";
import { Badge, type BadgeType } from "@/components/Badge";
import { Button } from "@/components/Button";
import { SidePanel } from "@/components/SidePanel";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/Pagination";
import { Package, ChevronRight, Truck, Check, Clock, XCircle, ClipboardCheck } from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const statusConfig: Record<string, { label: string; badgeType: BadgeType; icon: typeof Check }> = {
  delivered: { label: "Livree", badgeType: "habituallyInStock", icon: Check },
  confirmed: { label: "Confirmee", badgeType: "alreadyBought", icon: Truck },
  processing: { label: "En cours", badgeType: "priceFlag", icon: Clock },
  cancelled: { label: "Annulee", badgeType: "offer", icon: XCircle },
};

const steps = [
  { label: "Passee", icon: ClipboardCheck },
  { label: "Confirmee", icon: Check },
  { label: "En transit", icon: Truck },
  { label: "Livree", icon: Package },
];

export default function OrderHistory() {
  const orders = useOrderStore((s) => s.orders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-[var(--font-body)]">
      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--color-text-primary)]">Mes commandes</h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Historique et suivi de vos commandes materiaux</p>
          </div>
          <div className="flex gap-2">
            {["Toutes", "En cours", "Livrees"].map((f) => (
              <Button key={f} variant={f === "Toutes" ? "primary" : "secondary"} size="sm">
                {f}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-sm border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] shadow-[var(--shadow-1)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)]">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Commande</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Fournisseur</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Articles</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Livraison prevue</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Statut</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Total HT</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {orders.map((order) => {
                const cfg = statusConfig[order.status];
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={cn("cursor-pointer transition-colors", isSelected ? "bg-[var(--color-alert-info-bg)]" : "hover:bg-[var(--color-bg-layer-01)]")}
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{order.id}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">{new Date(order.date).toLocaleDateString("fr-FR")}</td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-primary)]">{order.supplier}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                        <Package className="h-3.5 w-3.5" /> {order.items.length}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-secondary)]">
                      {order.expectedDelivery !== "—" ? new Date(order.expectedDelivery).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge type={cfg.badgeType} label={cfg.label} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {order.total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ChevronRight className="h-4 w-4 text-[var(--color-text-secondary)]" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-[var(--color-neutral-black)]/40" role="dialog" aria-modal="true">
          <div className="h-full w-full max-w-[var(--size-sheet-max)]">
            <SidePanel
              title={selectedOrder.id}
              onClose={() => setSelectedOrderId(null)}
              className="h-full"
              footer={
                <>
                  <Button className="flex-1" onClick={() => { setSelectedOrderId(null); navigate(`/orders/${selectedOrder.id}/reception`); }}>
                    Confirmer la reception
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => { setSelectedOrderId(null); navigate(`/orders/${selectedOrder.id}/documents`); }}>
                    Voir les documents
                  </Button>
                </>
              }
            >
              <div className="space-y-6 pb-[var(--spacing-3)]">
                <Badge type={statusConfig[selectedOrder.status].badgeType} label={statusConfig[selectedOrder.status].label} />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{selectedOrder.supplier}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Commandee le {new Date(selectedOrder.date).toLocaleDateString("fr-FR")}</p>
                </div>
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
              </div>
            </SidePanel>
          </div>
        </div>
      ) : null}
    </div>
  );
}
