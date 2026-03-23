import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, ChevronRight, Truck, Check, Clock, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { orders } from "@/data/demoOrders";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary"; icon: typeof Check }> = {
  delivered: { label: "Livrée", variant: "success", icon: Check },
  confirmed: { label: "Confirmée", variant: "default", icon: Truck },
  processing: { label: "En cours", variant: "warning", icon: Clock },
  cancelled: { label: "Annulée", variant: "destructive", icon: XCircle },
};

export default function OrderHistory() {
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

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
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
                return (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
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
    </div>
  );
}
