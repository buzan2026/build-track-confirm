import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Eye, FileText, Truck, Check, Clock, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary"; icon: typeof Check }> = {
  delivered: { label: "Livrée", variant: "success", icon: Check },
  confirmed: { label: "Confirmée", variant: "default", icon: Truck },
  processing: { label: "En cours", variant: "warning", icon: Clock },
  cancelled: { label: "Annulée", variant: "destructive", icon: XCircle },
};

const orders = [
  {
    id: "CMD-2026-0847",
    date: "2026-03-18",
    supplier: "Rexel France",
    total: 2847.6,
    status: "confirmed",
    items: 4,
    expectedDelivery: "2026-03-25",
  },
  {
    id: "CMD-2026-0852",
    date: "2026-03-20",
    supplier: "Sonepar Électrique",
    total: 1523.4,
    status: "processing",
    items: 4,
    expectedDelivery: "2026-03-28",
  },
  {
    id: "CMD-2026-0839",
    date: "2026-03-12",
    supplier: "Legrand Distribution",
    total: 4210.0,
    status: "delivered",
    items: 3,
    expectedDelivery: "2026-03-22",
  },
  {
    id: "CMD-2026-0821",
    date: "2026-03-05",
    supplier: "Schneider Electric Pro",
    total: 876.3,
    status: "cancelled",
    items: 1,
    expectedDelivery: "—",
  },
  {
    id: "CMD-2026-0798",
    date: "2026-02-28",
    supplier: "Rexel France",
    total: 3190.0,
    status: "delivered",
    items: 6,
    expectedDelivery: "2026-03-05",
  },
  {
    id: "CMD-2026-0774",
    date: "2026-02-20",
    supplier: "Hager Distribution",
    total: 1654.8,
    status: "delivered",
    items: 5,
    expectedDelivery: "2026-02-27",
  },
];

export default function OrderHistory() {
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
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-sm text-card-foreground">{order.id}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-5 py-4 text-sm text-card-foreground">{order.supplier}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Package className="h-3.5 w-3.5" /> {order.items}
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
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Voir le détail">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Documents">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">Données de démonstration — 6 commandes affichées</p>
      </div>
      <Footer />
    </div>
  );
}
