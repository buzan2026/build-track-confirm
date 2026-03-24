import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ReceptionSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const data = state as { orderNumber: string; receptionDate: string; signedBy: string } | null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Réception confirmée</h1>
        <p className="mb-6 text-sm text-muted-foreground">La livraison a été enregistrée avec succès.</p>

        <div className="mb-8 w-full max-w-sm rounded-sm border border-border bg-card p-5 shadow-elevation-1 text-left space-y-3">
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

        <Button className="w-full max-w-sm" onClick={() => navigate("/orders")}>
          Retour aux commandes
        </Button>
      </div>
      <Footer />
    </div>
  );
}
