export interface OrderItem {
  name: string;
  reference: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  supplier: string;
  totalAmount: number;
  status: "confirmed" | "cancelled" | "delivered";
  deliveryStep: number; // 0-3
  expectedDelivery: string;
  items: OrderItem[];
}

export const orders: Order[] = [
  {
    id: "1",
    orderNumber: "CMD-2026-0847",
    date: "2026-03-18",
    supplier: "Rexel France",
    totalAmount: 2847.60,
    status: "confirmed",
    deliveryStep: 2,
    expectedDelivery: "2026-03-25",
    items: [
      { name: "Câble R2V 3G2.5mm²", reference: "CAB-R2V-325", quantity: 500, unitPrice: 1.85 },
      { name: "Disjoncteur C60N 20A", reference: "DJ-C60N-20", quantity: 12, unitPrice: 28.50 },
      { name: "Tableau électrique 4 rangées", reference: "TAB-4R-LEGR", quantity: 3, unitPrice: 189.00 },
      { name: "Prise RJ45 Cat6 Mosaic", reference: "RJ45-CAT6-M", quantity: 40, unitPrice: 8.90 },
    ],
  },
  {
    id: "2",
    orderNumber: "CMD-2026-0852",
    date: "2026-03-20",
    supplier: "Sonepar Électrique",
    totalAmount: 1523.40,
    status: "confirmed",
    deliveryStep: 1,
    expectedDelivery: "2026-03-28",
    items: [
      { name: "Goulotte PVC 60x40mm", reference: "GOU-PVC-6040", quantity: 80, unitPrice: 4.20 },
      { name: "Interrupteur différentiel 30mA", reference: "ID-30MA-2P", quantity: 8, unitPrice: 65.00 },
      { name: "Boîte de dérivation IP55", reference: "BD-IP55-100", quantity: 50, unitPrice: 3.80 },
      { name: "Chemin de câble 300mm", reference: "CDC-300-GS", quantity: 20, unitPrice: 22.50 },
    ],
  },
  {
    id: "3",
    orderNumber: "CMD-2026-0839",
    date: "2026-03-12",
    supplier: "Legrand Distribution",
    totalAmount: 4210.00,
    status: "confirmed",
    deliveryStep: 3,
    expectedDelivery: "2026-03-22",
    items: [
      { name: "Coffret VDI Grade 3", reference: "VDI-G3-LGR", quantity: 5, unitPrice: 245.00 },
      { name: "Prise Céliane Blanc", reference: "CEL-PC-BLC", quantity: 120, unitPrice: 12.50 },
      { name: "Contacteur CT 25A", reference: "CT-25A-2NO", quantity: 6, unitPrice: 85.00 },
    ],
  },
  {
    id: "4",
    orderNumber: "CMD-2026-0821",
    date: "2026-03-05",
    supplier: "Schneider Electric Pro",
    totalAmount: 876.30,
    status: "cancelled",
    deliveryStep: 0,
    expectedDelivery: "—",
    items: [
      { name: "Variateur Wiser", reference: "WIS-VAR-ZB", quantity: 10, unitPrice: 87.63 },
    ],
  },
];

export const documents = {
  invoices: [
    { name: "Facture F-2026-0847", date: "2026-03-18", amount: 2847.60, orderId: "1" },
    { name: "Facture F-2026-0839", date: "2026-03-12", amount: 4210.00, orderId: "3" },
    { name: "Facture F-2026-0821", date: "2026-03-05", amount: 876.30, orderId: "4" },
  ],
  deliverySlips: [
    { name: "BL-2026-0847", date: "2026-03-20", orderId: "1" },
    { name: "BL-2026-0839", date: "2026-03-15", orderId: "3" },
  ],
};
