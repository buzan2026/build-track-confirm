import { useNavigate } from "react-router-dom";
import { orders } from "@/data/orders";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
  confirmed: { label: "Confirmée", variant: "success" },
  processing: { label: "En cours", variant: "warning" },
  cancelled: { label: "Annulée", variant: "destructive" },
  delivered: { label: "Livrée", variant: "default" },
};

export default function OrderList() {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h1 className="mb-1 text-xl font-bold text-foreground">Commandes</h1>
      <p className="mb-4 text-sm text-muted-foreground">Suivi des commandes matériaux</p>

      <div className="space-y-3">
        {orders.map((order) => {
          const cfg = statusConfig[order.status];
          return (
            <button
              key={order.id}
              onClick={() => navigate(`/order/${order.id}`)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-card-foreground">{order.orderNumber}</span>
                  <Badge variant={cfg.variant} className="text-[length:var(--font-size-xs)] px-2 py-0">{cfg.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{order.supplier}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm text-card-foreground">{order.totalAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
