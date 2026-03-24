import { useParams, useNavigate } from "react-router-dom";
import { documents } from "@/data/demoOrders";
import { Button } from "@/components/Button";
import { ArrowLeft, Download, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

const tabs = ["Factures", "Bons de livraison"] as const;

export default function DocumentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [active, setActive] = useState<typeof tabs[number]>("Factures");

  const invoices = id ? documents.invoices.filter((d) => d.orderId === id) : documents.invoices;
  const slips = id ? documents.deliverySlips.filter((d) => d.orderId === id) : documents.deliverySlips;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-2xl py-8">
        <button
          onClick={() => navigate("/orders")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux commandes
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">Factures et bons de livraison</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success("Téléchargement groupé lancé")}>
            <Download className="h-4 w-4 mr-1" /> Tout télécharger
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-lg bg-muted p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                active === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {active === "Factures" && (
          <div className="space-y-3">
            {invoices.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucune facture disponible.</p>}
            {invoices.map((doc, i) => (
              <div key={i} className="flex items-center gap-4 rounded-sm border border-border bg-card p-4 shadow-elevation-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(doc.date).toLocaleDateString("fr-FR")} — {doc.amount.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </p>
                </div>
                <button onClick={() => toast.success(`Téléchargement de ${doc.name}`)} className="shrink-0 text-primary hover:text-primary/80">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {active === "Bons de livraison" && (
          <div className="space-y-3">
            {slips.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucun bon de livraison disponible.</p>}
            {slips.map((doc, i) => (
              <div key={i} className="flex items-center gap-4 rounded-sm border border-border bg-card p-4 shadow-elevation-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(doc.date).toLocaleDateString("fr-FR")}</p>
                </div>
                <button onClick={() => toast.success(`Téléchargement de ${doc.name}`)} className="shrink-0 text-primary hover:text-primary/80">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
