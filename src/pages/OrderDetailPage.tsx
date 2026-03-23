import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ClipboardCheck, Check, Truck as TruckIcon, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { orders } from "@/data/demoOrders";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
  delivered: { label: "Livrée", variant: "success" },
  confirmed: { label: "Confirmée", variant: "default" },
  processing: { label: "En cours", variant: "warning" },
  cancelled: { label: "Annulée", variant: "destructive" },
};

const steps = [
  { label: "Passée", icon: ClipboardCheck },
  { label: "Confirmée", icon: Check },
  { label: "En transit", icon: TruckIcon },
  { label: "Livrée", icon: Package },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Commande introuvable</p>
          <Link to="/orders" className="text-primary mt-4 inline-block">Retour aux commandes</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const cfg = statusConfig[order.status];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8 max-w-4xl">
        <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Retour aux commandes
        </Link>

        {/* Order header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold text-foreground">{order.id}</h1>
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {order.supplier} — Commandée le {new Date(order.date).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-bold text-foreground">
              {order.total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
            </p>
            <p className="text-xs text-muted-foreground">Total HT</p>
          </div>
        </div>

        {/* Delivery tracker */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-5">Suivi de livraison</h2>
          <div className="flex items-start justify-between relative">
            {/* Connector lines behind icons */}
            <div className="absolute top-[var(--spacing-2-25)] left-[calc(var(--spacing-4)+var(--spacing-2)+var(--spacing-1))] right-[calc(var(--spacing-4)+var(--spacing-2)+var(--spacing-1))] flex">
              {[0, 1, 2].map((i) => (
                <div key={i} className={cn("h-0.5 flex-1", i < order.deliveryStep ? "bg-primary" : "bg-muted")} />
              ))}
            </div>
            {steps.map((step, i) => {
              const done = i <= order.deliveryStep;
              const current = i === order.deliveryStep;
              return (
                <div key={i} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                    done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    current && "ring-2 ring-primary ring-offset-2 ring-offset-card"
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
          <p className="text-sm text-muted-foreground mt-6">
            Livraison prévue : <span className="font-medium text-foreground">
              {order.expectedDelivery !== "—" ? new Date(order.expectedDelivery).toLocaleDateString("fr-FR") : "—"}
            </span>
          </p>
        </div>

        {/* Items table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Articles commandés ({order.items.length})</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Article</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Référence</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Qté</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Prix unit.</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 text-sm font-medium text-card-foreground">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{item.reference}</td>
                  <td className="px-6 py-4 text-sm text-right text-card-foreground">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm text-right text-muted-foreground">{item.unitPrice.toFixed(2)} €</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-card-foreground">
                    {(item.quantity * item.unitPrice).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border">
                <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-card-foreground text-right">Total HT</td>
                <td className="px-6 py-4 text-right font-display text-lg font-bold text-foreground">
                  {order.total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}
