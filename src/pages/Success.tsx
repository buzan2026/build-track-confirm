import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function Success() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const data = state as { orderNumber: string; receptionDate: string; signedBy: string } | null;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
        <CheckCircle2 className="h-10 w-10 text-success" />
      </div>
      <h1 className="mb-2 text-xl font-bold text-foreground">Réception confirmée</h1>
      <p className="mb-6 text-sm text-muted-foreground">La livraison a été enregistrée avec succès.</p>

      <div className="mb-8 w-full max-w-xs rounded-xl border border-border bg-card p-4 shadow-sm text-left space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Commande</span>
          <span className="font-medium text-card-foreground">{data?.orderNumber ?? "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Date de réception</span>
          <span className="font-medium text-card-foreground">{data?.receptionDate ?? "—"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Signé par</span>
          <span className="font-medium text-card-foreground">{data?.signedBy ?? "—"}</span>
        </div>
      </div>

      <Button className="w-full max-w-xs" onClick={() => navigate("/")}>
        Retour aux commandes
      </Button>
    </div>
  );
}
