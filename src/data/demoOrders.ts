export interface OrderItem {
  name: string;
  reference: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  date: string;
  supplier: string;
  total: number;
  status: string;
  items: OrderItem[];
  expectedDelivery: string;
  deliveryStep: number; // 0-3
}

export const orders: Order[] = [
  {
    id: "CMD-2026-0847",
    date: "2026-03-18",
    supplier: "Rexel France",
    total: 2847.6,
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
    id: "CMD-2026-0852",
    date: "2026-03-20",
    supplier: "Sonepar Électrique",
    total: 1523.4,
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
    id: "CMD-2026-0839",
    date: "2026-03-12",
    supplier: "Legrand Distribution",
    total: 4210.0,
    status: "delivered",
    deliveryStep: 3,
    expectedDelivery: "2026-03-22",
    items: [
      { name: "Coffret VDI Grade 3", reference: "VDI-G3-LGR", quantity: 5, unitPrice: 245.00 },
      { name: "Prise Céliane Blanc", reference: "CEL-PC-BLC", quantity: 120, unitPrice: 12.50 },
      { name: "Contacteur CT 25A", reference: "CT-25A-2NO", quantity: 6, unitPrice: 85.00 },
    ],
  },
  {
    id: "CMD-2026-0821",
    date: "2026-03-05",
    supplier: "Schneider Electric Pro",
    total: 876.3,
    status: "cancelled",
    deliveryStep: 0,
    expectedDelivery: "—",
    items: [
      { name: "Variateur Wiser", reference: "WIS-VAR-ZB", quantity: 10, unitPrice: 87.63 },
    ],
  },
  {
    id: "CMD-2026-0798",
    date: "2026-02-28",
    supplier: "Rexel France",
    total: 3190.0,
    status: "delivered",
    deliveryStep: 3,
    expectedDelivery: "2026-03-05",
    items: [
      { name: "Câble U1000 R2V 5G6mm²", reference: "CAB-U1000-5G6", quantity: 200, unitPrice: 5.50 },
      { name: "Coffret Kaedra 24 modules", reference: "KAE-24M-IP65", quantity: 4, unitPrice: 142.00 },
      { name: "Bornier de répartition", reference: "BOR-REP-125A", quantity: 10, unitPrice: 34.50 },
      { name: "Peigne d'alimentation", reference: "PEI-ALI-3P", quantity: 8, unitPrice: 18.75 },
      { name: "Parafoudre T2", reference: "PAR-T2-40KA", quantity: 6, unitPrice: 89.00 },
      { name: "Interrupteur sectionneur", reference: "IS-63A-4P", quantity: 4, unitPrice: 42.50 },
    ],
  },
  {
    id: "CMD-2026-0774",
    date: "2026-02-20",
    supplier: "Hager Distribution",
    total: 1654.8,
    status: "delivered",
    deliveryStep: 3,
    expectedDelivery: "2026-02-27",
    items: [
      { name: "Disjoncteur MCB 16A", reference: "MCB-16A-1P", quantity: 30, unitPrice: 12.80 },
      { name: "Platine de comptage", reference: "PLT-CPT-EDF", quantity: 2, unitPrice: 95.00 },
      { name: "Gaine ICTA 20mm", reference: "ICTA-20-100M", quantity: 15, unitPrice: 28.00 },
      { name: "Connecteur Wago 5 entrées", reference: "WAGO-221-5", quantity: 200, unitPrice: 1.20 },
      { name: "Spot LED encastrable 10W", reference: "LED-ENC-10W", quantity: 40, unitPrice: 14.50 },
    ],
  },
];

export const documents = {
  invoices: [
    { name: "Facture F-2026-0847", date: "2026-03-18", amount: 2847.60, orderId: "CMD-2026-0847" },
    { name: "Facture F-2026-0852", date: "2026-03-20", amount: 1523.40, orderId: "CMD-2026-0852" },
    { name: "Facture F-2026-0839", date: "2026-03-12", amount: 4210.00, orderId: "CMD-2026-0839" },
    { name: "Facture F-2026-0798", date: "2026-02-28", amount: 3190.00, orderId: "CMD-2026-0798" },
    { name: "Facture F-2026-0774", date: "2026-02-20", amount: 1654.80, orderId: "CMD-2026-0774" },
  ],
  deliverySlips: [
    { name: "BL-2026-0839", date: "2026-03-15", orderId: "CMD-2026-0839" },
    { name: "BL-2026-0798", date: "2026-03-02", orderId: "CMD-2026-0798" },
    { name: "BL-2026-0774", date: "2026-02-24", orderId: "CMD-2026-0774" },
  ],
};
