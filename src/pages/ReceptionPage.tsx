import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderStore } from "@/stores/orderStore";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ReceptionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const orders = useOrderStore((s) => s.orders);
  const markDelivered = useOrderStore((s) => s.markDelivered);
  const order = orders.find((o) => o.id === id);


  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [showSignPad, setShowSignPad] = useState(false);
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const toggleItem = (ref: string) =>
    setCheckedItems((prev) => ({ ...prev, [ref]: !prev[ref] }));

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const pos = "touches" in e ? e.touches[0] : e;
    ctx.beginPath();
    ctx.moveTo(pos.clientX - rect.left, pos.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const pos = "touches" in e ? e.touches[0] : e;
    ctx.strokeStyle = "hsl(var(--foreground))";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineTo(pos.clientX - rect.left, pos.clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = () => { drawing.current = false; };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12 text-center">
          <p className="text-muted-foreground">Commande introuvable.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/orders")}>Retour</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const allChecked = order.items.every((item) => checkedItems[item.reference]);

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

        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">Réception de livraison</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {order.id} — {order.supplier}
          </p>
        </div>

        {/* Checklist */}
        <div className="rounded-sm border border-border bg-card p-5 shadow-elevation-1 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Articles à réceptionner ({order.items.length})
          </p>
          <div className="space-y-3">
            {order.items.map((item) => (
              <label key={item.reference} className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  checked={!!checkedItems[item.reference]}
                  onCheckedChange={() => toggleItem(item.reference)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className={cn("text-sm font-medium text-card-foreground", checkedItems[item.reference] && "line-through text-muted-foreground")}>{item.name}</p>
                  <p className="text-xs text-muted-foreground">Réf: {item.reference} — Qté: {item.quantity}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
            Articles manquants ou endommagés
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Détaillez les éventuels problèmes…"
            className="bg-card"
            rows={3}
          />
        </div>

        {/* Signature */}
        {!signed && !showSignPad && (
          <Button variant="outline" className="w-full mb-6" onClick={() => setShowSignPad(true)}>
            Signer le bon de réception
          </Button>
        )}

        {showSignPad && (
          <div className="rounded-sm border border-border bg-card p-5 shadow-elevation-1 mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Signature</p>
            <canvas
              ref={canvasRef}
              width={500}
              height={180}
              className="w-full rounded-lg border border-border bg-background touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="ghost" className="flex-1" onClick={clearCanvas}>Effacer</Button>
              <Button size="sm" className="flex-1" onClick={() => { setSigned(true); setShowSignPad(false); }}>Signer</Button>
            </div>
          </div>
        )}

        {signed && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-primary/10 p-3">
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Signature enregistrée</span>
          </div>
        )}

        <Button className="w-full" disabled={!signed || !allChecked} onClick={() => {
          markDelivered(order.id);
          navigate("/orders");
          toast.success(`Réception confirmée — ${order.id}`, {
            duration: 4000,
            position: "top-right",
          });
        }}>
          Valider la réception
        </Button>
      </div>
      <Footer />
    </div>
  );
}
