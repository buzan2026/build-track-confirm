import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { orders } from "@/data/orders";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DeliveryReception() {
  const navigate = useNavigate();
  const activeOrders = orders.filter((o) => o.status !== "cancelled" && o.status !== "delivered");
  const [selectedOrderId, setSelectedOrderId] = useState(activeOrders[0]?.id ?? "");
  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [showSignPad, setShowSignPad] = useState(false);
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const toggleItem = (ref: string) => {
    setCheckedItems((prev) => ({ ...prev, [ref]: !prev[ref] }));
  };

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
    ctx.strokeStyle = "hsl(215, 25%, 15%)";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineTo(pos.clientX - rect.left, pos.clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = () => {
    drawing.current = false;
  };

  const confirmSign = () => {
    setSigned(true);
    setShowSignPad(false);
  };

  const handleConfirm = () => {
    if (!selectedOrder) return;
    navigate("/success", {
      state: {
        orderNumber: selectedOrder.orderNumber,
        receptionDate: new Date().toLocaleDateString("fr-FR"),
        signedBy: "Technicien terrain",
      },
    });
  };

  return (
    <div className="p-4">
      <h1 className="mb-1 text-xl font-bold text-foreground">Réception livraison</h1>
      <p className="mb-4 text-sm text-muted-foreground">Confirmez la réception du matériel</p>

      <div className="mb-4">
        <Label className="text-xs text-muted-foreground mb-1.5 block">Commande</Label>
        <Select value={selectedOrderId} onValueChange={(v) => { setSelectedOrderId(v); setCheckedItems({}); setSigned(false); }}>
          <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            {activeOrders.map((o) => (
              <SelectItem key={o.id} value={o.id}>{o.orderNumber} — {o.supplier}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedOrder && (
        <>
          <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Articles à réceptionner</p>
            <div className="space-y-3">
              {selectedOrder.items.map((item) => (
                <label key={item.reference} className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={!!checkedItems[item.reference]}
                    onCheckedChange={() => toggleItem(item.reference)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Réf: {item.reference} — Qté: {item.quantity}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <Label className="text-xs text-muted-foreground mb-1.5 block">Articles manquants ou endommagés</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détaillez les éventuels problèmes…"
              className="bg-card"
              rows={3}
            />
          </div>

          {!showSignPad && !signed && (
            <Button variant="outline" className="w-full mb-3" onClick={() => setShowSignPad(true)}>
              Signer le bon de livraison
            </Button>
          )}

          {showSignPad && (
            <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Signez ci-dessous</p>
              <canvas
                ref={canvasRef}
                width={320}
                height={150}
                className="w-full rounded-lg border border-border bg-background touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="ghost" className="flex-1" onClick={() => {
                  const ctx = canvasRef.current?.getContext("2d");
                  if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }}>Effacer</Button>
                <Button size="sm" className="flex-1" onClick={confirmSign}>Valider signature</Button>
              </div>
            </div>
          )}

          {signed && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-accent p-3">
              <div className="h-5 w-5 rounded-full bg-success flex items-center justify-center">
                <svg className="h-3 w-3 text-success-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-sm font-medium text-accent-foreground">Signature enregistrée</span>
            </div>
          )}

          <Button className="w-full" disabled={!signed} onClick={handleConfirm}>
            Confirmer la réception
          </Button>
        </>
      )}
    </div>
  );
}
