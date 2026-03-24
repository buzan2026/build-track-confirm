import { Badge, type BadgeType } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Sidepanel as SidePanel } from "@/components/Sidepanel";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/Pagination";
import { Package, ChevronRight, Truck, Check, Clock, XCircle, ClipboardCheck, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { documents } from "@/data/demoOrders";
import { useOrderStore } from "@/stores/orderStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; badgeType: BadgeType; badgeClassName: string; icon: typeof Check }> = {
  delivered: {
    label: "Livrée",
    badgeType: "inStock",
    badgeClassName: "bg-transparent border-[var(--color-success)] text-[var(--color-success)] text-[12px] leading-[16px]",
    icon: Check,
  },
  confirmed: {
    label: "Confirmée",
    badgeType: "alreadyBought",
    badgeClassName: "bg-[var(--color-primary)] border-transparent text-[var(--color-white)] text-[12px] leading-[16px]",
    icon: Truck,
  },
  processing: {
    label: "En cours",
    badgeType: "priceFlag",
    badgeClassName: "bg-[var(--color-orange)] border-transparent text-[var(--color-white)] text-[12px] leading-[16px]",
    icon: Clock,
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
  const [activeFilter, setActiveFilter] = useState<"Toutes" | "En cours" | "Livrées">("Toutes");
  const [panelSection, setPanelSection] = useState<"detail" | "documents" | "reception">("detail");
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;
  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "En cours") return order.status === "processing" || order.status === "confirmed";
    if (activeFilter === "Livrées") return order.status === "delivered";
    return true;
  });
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
            {(["Toutes", "En cours", "Livrées"] as const).map((f, idx, arr) => (
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

        <div className="overflow-hidden rounded-sm border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-02)] shadow-[var(--shadow-1)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)]">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Commande</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Articles</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Livraison prevue</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Statut</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">Total HT</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {filteredOrders.map((order) => {
                const cfg = statusConfig[order.status];
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <tr
                    key={order.id}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setPanelSection("detail");
                    }}
                    className={cn("cursor-pointer transition-colors", isSelected ? "bg-[var(--color-alert-info-bg)]" : "hover:bg-[var(--color-bg-layer-01)]")}
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
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedOrderId(null);
              setPanelSection("detail");
            }
          }}
        >
          <div className="h-full w-full max-w-[var(--size-sheet-max)] animate-slide-in-right shadow-[var(--shadow-5)]">
            <SidePanel
              title={selectedOrder.id}
              onClose={() => {
                setSelectedOrderId(null);
                setPanelSection("detail");
              }}
              className="h-full"
              footer={
                panelSection === "detail" ? (
                  <>
                    <Button
                      variant="secondary"
                      className="flex-1 h-[48px] px-[40px] py-0"
                      onClick={() => toast.message("Un conseiller va vous contacter.")}
                    >
                      Need help?
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
                      onClick={() => toast.message("Signalement envoyé à l'équipe support.")}
                    >
                      Signaler un problème
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1 h-[48px] px-[40px] py-0 text-[var(--color-white)]"
                      onClick={() => {
                        markDelivered(selectedOrder.id);
                        toast.success(`Réception validée pour ${selectedOrder.id}`);
                      }}
                    >
                      Valider la réception
                    </Button>
                  </>
                )
              }
            >
              <div className="space-y-6 pb-[var(--spacing-3)]">
                <div className="space-y-[var(--spacing-3)]">
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
                  <div>
                    <Badge
                      type={statusConfig[selectedOrder.status].badgeType}
                      label={statusConfig[selectedOrder.status].label}
                      className={statusConfig[selectedOrder.status].badgeClassName}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{selectedOrder.supplier}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">Commandée le {new Date(selectedOrder.date).toLocaleDateString("fr-FR")}</p>
                </div>
                {panelSection === "detail" ? (
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

                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                        Articles commandés ({selectedOrder.items.length})
                      </p>
                      <div className="overflow-hidden rounded-lg border border-[var(--color-border-subtle)]">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)]">
                              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-secondary)]">Article</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-secondary)]">Référence</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-[var(--color-text-secondary)]">Qté</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-[var(--color-text-secondary)]">Prix unit.</th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-[var(--color-text-secondary)]">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--color-border-subtle)]">
                            {selectedOrder.items.map((item, i) => (
                              <tr key={i}>
                                <td className="px-3 py-2.5 font-medium text-[var(--color-text-primary)]">{item.name}</td>
                                <td className="px-3 py-2.5 text-xs text-[var(--color-text-secondary)]">{item.reference}</td>
                                <td className="px-3 py-2.5 text-right text-[var(--color-text-primary)]">{item.quantity}</td>
                                <td className="px-3 py-2.5 text-right text-[var(--color-text-secondary)]">{item.unitPrice.toFixed(2)} €</td>
                                <td className="px-3 py-2.5 text-right font-semibold text-[var(--color-text-primary)]">
                                  {(item.quantity * item.unitPrice).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-3 flex items-center justify-between px-1">
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">Total HT</span>
                        <span className="text-lg font-bold text-[var(--color-text-primary)]">
                          {selectedOrder.total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}

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
                  <div className="rounded-[var(--border-radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-bg-layer-01)] p-4">
                    <p className="text-sm text-[var(--color-text-primary)]">
                      Confirmez la réception pour marquer la commande comme livrée, sans quitter cette page.
                    </p>
                    <div className="mt-3 text-xs text-[var(--color-text-secondary)]">
                      Statut actuel : {statusConfig[selectedOrder.status].label}
                    </div>
                  </div>
                ) : null}
              </div>
            </SidePanel>
          </div>
        </div>
      ) : null}
    </div>
  );
}
