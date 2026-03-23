import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, ChevronRight, Truck, Check, Clock, XCircle, ClipboardCheck, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Order } from "@/data/demoOrders";
import { useOrderStore } from "@/stores/orderStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary"; icon: typeof Check }> = {
  delivered: { label: "Livrée", variant: "success", icon: Check },
  confirmed: { label: "Confirmée", variant: "default", icon: Truck },
  processing: { label: "En cours", variant: "warning", icon: Clock },
  cancelled: { label: "Annulée", variant: "destructive", icon: XCircle },
};

const steps = [
  { label: "Passée", icon: ClipboardCheck },
  { label: "Confirmée", icon: Check },
  { label: "En transit", icon: Truck },
  { label: "Livrée", icon: Package },
];

export default function OrderHistory() {
  const orders = useOrderStore((s) => s.orders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) ?? null;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour à la boutique
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Mes commandes</h1>
            <p className="text-sm text-muted-foreground mt-1">Historique et suivi de vos commandes matériaux</p>
          </div>
          <div className="flex gap-2">
            {["Toutes", "En cours", "Livrées"].map((f) => (
              <Button key={f} variant={f === "Toutes" ? "default" : "outline"} size="sm">
                {f}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-border bg-card shadow-elevation-1 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Commande</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Fournisseur</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Articles</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Livraison prévue</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Total HT</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => {
                const cfg = statusConfig[order.status];
                const StatusIcon = cfg.icon;
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={cn(
                      "transition-colors cursor-pointer",
                      isSelected ? "bg-primary/10" : "hover:bg-muted/30"
                    )}
                  >
                    <td className="px-5 py-4">
                      <span className="font-semibold text-sm text-card-foreground">{order.id}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-5 py-4 text-sm text-card-foreground">{order.supplier}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Package className="h-3.5 w-3.5" /> {order.items.length}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {order.expectedDelivery !== "—" ? new Date(order.expectedDelivery).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={cfg.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-semibold text-sm text-card-foreground">
                        {order.total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">Données de démonstration — {orders.length} commandes affichées</p>
      </div>
      <Footer />

      {/* Order Detail Side Panel */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <SheetContent side="right" className="w-[40vw] min-w-[420px] max-w-[600px] p-0 flex flex-col sm:max-w-none">
          {selectedOrder && (() => {
            const cfg = statusConfig[selectedOrder.status];
            return (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <SheetTitle className="text-lg font-bold">{selectedOrder.id}</SheetTitle>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                </div>
                <SheetDescription className="sr-only">Détail de la commande {selectedOrder.id}</SheetDescription>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                  {/* Supplier & date */}
                  <div>
                    <p className="text-sm font-medium text-foreground">{selectedOrder.supplier}</p>
                    <p className="text-xs text-muted-foreground">
                      Commandée le {new Date(selectedOrder.date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>

                  {/* Delivery tracker */}
                  <div className="rounded-xl border border-border bg-muted/30 p-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Suivi livraison</p>
                    <div className="flex items-start justify-between relative">
                      <div className="absolute top-[18px] left-[36px] right-[36px] flex">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className={cn("h-0.5 flex-1", i < selectedOrder.deliveryStep ? "bg-primary" : "bg-border")} />
                        ))}
                      </div>
                      {steps.map((step, i) => {
                        const done = i <= selectedOrder.deliveryStep;
                        const current = i === selectedOrder.deliveryStep;
                        return (
                          <div key={i} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                            <div className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                              done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                              current && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                            )}>
                              <step.icon className="h-4 w-4" />
                            </div>
                            <span className={cn(
                              "text-xs text-center",
                              done ? "text-foreground font-medium" : "text-muted-foreground"
                            )}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-5">
                      Livraison prévue : <span className="font-medium text-foreground">
                        {selectedOrder.expectedDelivery !== "—" ? new Date(selectedOrder.expectedDelivery).toLocaleDateString("fr-FR") : "—"}
                      </span>
                    </p>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Articles commandés ({selectedOrder.items.length})
                    </p>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b border-border">
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Article</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Réf.</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Qté</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">P.U.</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {selectedOrder.items.map((item, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2.5 font-medium text-card-foreground">{item.name}</td>
                              <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{item.reference}</td>
                              <td className="px-3 py-2.5 text-right text-card-foreground">{item.quantity}</td>
                              <td className="px-3 py-2.5 text-right text-muted-foreground">{item.unitPrice.toFixed(2)} €</td>
                              <td className="px-3 py-2.5 text-right font-semibold text-card-foreground">
                                {(item.quantity * item.unitPrice).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-between items-center mt-3 px-1">
                      <span className="text-sm font-semibold text-foreground">Total HT</span>
                      <span className="text-lg font-bold text-foreground">
                        {selectedOrder.total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sticky footer */}
                <div className="border-t border-border px-6 py-4 flex gap-3">
                  <Button className="flex-1" onClick={() => { setSelectedOrderId(null); navigate(`/orders/${selectedOrder.id}/reception`); }}>Confirmer la réception</Button>
                  <Button variant="outline" className="flex-1" onClick={() => { setSelectedOrderId(null); navigate(`/orders/${selectedOrder.id}/documents`); }}>Voir les documents</Button>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}
