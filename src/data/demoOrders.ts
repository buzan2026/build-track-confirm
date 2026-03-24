export interface OrderItem {
  name: string;
  reference: string;
  quantity: number;
  unitPrice: number;
  deliveredQty?: number; // for partial deliveries
}

export interface Shipment {
  id: string;
  date: string; // ship date or delivery date
  status: "pending" | "in_transit" | "delivered";
  items: { reference: string; quantity: number }[];
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
  shipments?: Shipment[];
}

export const orders: Order[] = [
  {
    id: "CMD-2026-0852", date: "2026-03-20", supplier: "Sonepar Électrique", total: 1523.40, status: "confirmed", deliveryStep: 1, expectedDelivery: "2026-03-28",
    items: [
      { name: "Goulotte PVC 60x40mm", reference: "GOU-PVC-6040", quantity: 80, unitPrice: 4.20 },
      { name: "Interrupteur différentiel 30mA", reference: "ID-30MA-2P", quantity: 8, unitPrice: 65.00 },
      { name: "Boîte de dérivation IP55", reference: "BD-IP55-100", quantity: 50, unitPrice: 3.80 },
      { name: "Chemin de câble 300mm", reference: "CDC-300-GS", quantity: 20, unitPrice: 22.50 },
    ],
  },
  {
    id: "CMD-2026-0847", date: "2026-03-18", supplier: "Rexel France", total: 2847.60, status: "confirmed", deliveryStep: 2, expectedDelivery: "2026-03-25",
    items: [
      { name: "Câble R2V 3G2.5mm²", reference: "CAB-R2V-325", quantity: 500, unitPrice: 1.85 },
      { name: "Disjoncteur C60N 20A", reference: "DJ-C60N-20", quantity: 12, unitPrice: 28.50 },
      { name: "Tableau électrique 4 rangées", reference: "TAB-4R-LEGR", quantity: 3, unitPrice: 189.00 },
      { name: "Prise RJ45 Cat6 Mosaic", reference: "RJ45-CAT6-M", quantity: 40, unitPrice: 8.90 },
    ],
  },
  {
    id: "CMD-2026-0845", date: "2026-03-17", supplier: "Legrand Distribution", total: 965.00, status: "confirmed", deliveryStep: 1, expectedDelivery: "2026-03-26",
    items: [
      { name: "Prise Mosaic 2P+T", reference: "MOS-2PT-BLC", quantity: 50, unitPrice: 7.80 },
      { name: "Plaque Céliane Titane", reference: "CEL-PL-TIT", quantity: 50, unitPrice: 11.50 },
    ],
    shipments: [
      {
        id: "ENV-0841-1", date: "2026-03-16", status: "delivered",
        items: [
          { reference: "ARM-800-600", quantity: 2 },
          { reference: "H07VK-6-BL", quantity: 200 },
          { reference: "H07VK-6-VJ", quantity: 200 },
          { reference: "RAIL-DIN-2M", quantity: 20 },
        ],
      },
      {
        id: "ENV-0841-2", date: "2026-03-22", status: "pending",
        items: [
          { reference: "H07VK-6-BL", quantity: 100 },
          { reference: "H07VK-6-VJ", quantity: 100 },
          { reference: "EMB-6-ISOL", quantity: 500 },
        ],
      },
    ],
  },
  {
    id: "CMD-2026-0841", date: "2026-03-15", supplier: "Rexel France", total: 4780.00, status: "partial", deliveryStep: 2, expectedDelivery: "2026-03-22",
    items: [
      { name: "Armoire électrique 800x600", reference: "ARM-800-600", quantity: 2, unitPrice: 890.00, deliveredQty: 2 },
      { name: "Câble H07VK 6mm² Bleu", reference: "H07VK-6-BL", quantity: 300, unitPrice: 2.20, deliveredQty: 200 },
      { name: "Câble H07VK 6mm² Vert/Jaune", reference: "H07VK-6-VJ", quantity: 300, unitPrice: 2.20, deliveredQty: 200 },
      { name: "Rail DIN Omega", reference: "RAIL-DIN-2M", quantity: 20, unitPrice: 8.50, deliveredQty: 20 },
      { name: "Embout de câblage 6mm²", reference: "EMB-6-ISOL", quantity: 500, unitPrice: 0.12, deliveredQty: 0 },
    ],
  },
  {
    id: "CMD-2026-0839", date: "2026-03-12", supplier: "Legrand Distribution", total: 4210.00, status: "delivered", deliveryStep: 3, expectedDelivery: "2026-03-22",
    items: [
      { name: "Coffret VDI Grade 3", reference: "VDI-G3-LGR", quantity: 5, unitPrice: 245.00 },
      { name: "Prise Céliane Blanc", reference: "CEL-PC-BLC", quantity: 120, unitPrice: 12.50 },
      { name: "Contacteur CT 25A", reference: "CT-25A-2NO", quantity: 6, unitPrice: 85.00 },
    ],
  },
  {
    id: "CMD-2026-0835", date: "2026-03-10", supplier: "Schneider Electric Pro", total: 3245.80, status: "partial", deliveryStep: 2, expectedDelivery: "2026-03-18",
    items: [
      { name: "Disjoncteur iC60N 32A", reference: "IC60N-32A-3P", quantity: 6, unitPrice: 145.00, deliveredQty: 6 },
      { name: "Bloc Vigi iC60 30mA", reference: "VIGI-IC60-30", quantity: 6, unitPrice: 98.00, deliveredQty: 4 },
      { name: "Contacteur iCT 40A", reference: "ICT-40A-2NO", quantity: 4, unitPrice: 125.50, deliveredQty: 0 },
      { name: "Minuterie MINs", reference: "MINS-16A", quantity: 3, unitPrice: 67.00, deliveredQty: 3 },
    ],
  },
  {
    id: "CMD-2026-0830", date: "2026-03-08", supplier: "Hager Distribution", total: 1890.50, status: "confirmed", deliveryStep: 1, expectedDelivery: "2026-03-20",
    items: [
      { name: "Coffret Gamma 3 rangées", reference: "GAM-3R-13M", quantity: 4, unitPrice: 125.00 },
      { name: "Interrupteur horaire", reference: "IH-EGN103", quantity: 6, unitPrice: 78.50 },
      { name: "Télévariateur 500W", reference: "TV-EVN-500", quantity: 8, unitPrice: 95.00 },
    ],
  },
  {
    id: "CMD-2026-0825", date: "2026-03-06", supplier: "Rexel France", total: 567.20, status: "cancelled", deliveryStep: 0, expectedDelivery: "—",
    items: [
      { name: "Détecteur de fumée NF", reference: "DET-FUM-NF", quantity: 20, unitPrice: 18.50 },
      { name: "Bloc autonome BAES", reference: "BAES-STD-LED", quantity: 4, unitPrice: 45.80 },
    ],
  },
  {
    id: "CMD-2026-0821", date: "2026-03-05", supplier: "Schneider Electric Pro", total: 876.30, status: "cancelled", deliveryStep: 0, expectedDelivery: "—",
    items: [
      { name: "Variateur Wiser", reference: "WIS-VAR-ZB", quantity: 10, unitPrice: 87.63 },
    ],
  },
  {
    id: "CMD-2026-0815", date: "2026-03-03", supplier: "Sonepar Électrique", total: 2156.00, status: "delivered", deliveryStep: 3, expectedDelivery: "2026-03-10",
    items: [
      { name: "Câble FTP Cat6 305m", reference: "FTP-CAT6-305", quantity: 3, unitPrice: 285.00 },
      { name: "Panneau de brassage 24P", reference: "PDB-24P-CAT6", quantity: 2, unitPrice: 145.00 },
      { name: "Baie serveur 19\" 42U", reference: "BAIE-42U-800", quantity: 1, unitPrice: 890.00 },
    ],
  },
  {
    id: "CMD-2026-0810", date: "2026-03-01", supplier: "Legrand Distribution", total: 743.60, status: "delivered", deliveryStep: 3, expectedDelivery: "2026-03-08",
    items: [
      { name: "Interrupteur Plexo IP55", reference: "PLX-VA-IP55", quantity: 30, unitPrice: 14.20 },
      { name: "Boîte Plexo 2 postes", reference: "PLX-B2P-IP55", quantity: 30, unitPrice: 6.50 },
      { name: "Presse-étoupe PG21", reference: "PE-PG21-GRS", quantity: 50, unitPrice: 2.18 },
    ],
  },
  {
    id: "CMD-2026-0798", date: "2026-02-28", supplier: "Rexel France", total: 3190.00, status: "delivered", deliveryStep: 3, expectedDelivery: "2026-03-05",
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
    id: "CMD-2026-0790", date: "2026-02-25", supplier: "Schneider Electric Pro", total: 5420.00, status: "partial", deliveryStep: 2, expectedDelivery: "2026-03-04",
    items: [
      { name: "Onduleur APC 3000VA", reference: "APC-SMT3000", quantity: 2, unitPrice: 1850.00, deliveredQty: 1 },
      { name: "Batterie APC RBC", reference: "APC-RBC33", quantity: 4, unitPrice: 215.00, deliveredQty: 4 },
      { name: "PDU rackable 16A", reference: "PDU-16A-8P", quantity: 2, unitPrice: 145.00, deliveredQty: 0 },
    ],
  },
  {
    id: "CMD-2026-0785", date: "2026-02-22", supplier: "Hager Distribution", total: 1234.00, status: "cancelled", deliveryStep: 0, expectedDelivery: "—",
    items: [
      { name: "Compteur d'énergie tri", reference: "EC-3PH-MID", quantity: 2, unitPrice: 345.00 },
      { name: "Transformateur de courant", reference: "TC-200-5A", quantity: 6, unitPrice: 56.00 },
      { name: "Concentrateur Modbus", reference: "CONC-MOD-RS", quantity: 1, unitPrice: 208.00 },
    ],
  },
  {
    id: "CMD-2026-0774", date: "2026-02-20", supplier: "Hager Distribution", total: 1654.80, status: "delivered", deliveryStep: 3, expectedDelivery: "2026-02-27",
    items: [
      { name: "Disjoncteur MCB 16A", reference: "MCB-16A-1P", quantity: 30, unitPrice: 12.80 },
      { name: "Platine de comptage", reference: "PLT-CPT-EDF", quantity: 2, unitPrice: 95.00 },
      { name: "Gaine ICTA 20mm", reference: "ICTA-20-100M", quantity: 15, unitPrice: 28.00 },
      { name: "Connecteur Wago 5 entrées", reference: "WAGO-221-5", quantity: 200, unitPrice: 1.20 },
      { name: "Spot LED encastrable 10W", reference: "LED-ENC-10W", quantity: 40, unitPrice: 14.50 },
    ],
  },
  {
    id: "CMD-2026-0762", date: "2026-02-15", supplier: "Rexel France", total: 980.00, status: "delivered", deliveryStep: 3, expectedDelivery: "2026-02-22",
    items: [
      { name: "Projecteur LED 50W IP65", reference: "PROJ-LED-50W", quantity: 10, unitPrice: 68.00 },
      { name: "Détecteur de mouvement", reference: "DET-MVT-180", quantity: 10, unitPrice: 30.00 },
    ],
  },
  {
    id: "CMD-2026-0750", date: "2026-02-10", supplier: "Sonepar Électrique", total: 2890.00, status: "delivered", deliveryStep: 3, expectedDelivery: "2026-02-18",
    items: [
      { name: "Borne de recharge 7kW", reference: "BORNE-7KW-T2", quantity: 2, unitPrice: 1245.00 },
      { name: "Câble 3G6 souple", reference: "CAB-3G6-SOUP", quantity: 50, unitPrice: 8.00 },
    ],
  },
  {
    id: "CMD-2026-0738", date: "2026-02-05", supplier: "Legrand Distribution", total: 456.80, status: "cancelled", deliveryStep: 0, expectedDelivery: "—",
    items: [
      { name: "Sonnette sans fil", reference: "SON-SF-LEGR", quantity: 5, unitPrice: 42.00 },
      { name: "Carillon 230V", reference: "CAR-230-2T", quantity: 5, unitPrice: 49.36 },
    ],
  },
  {
    id: "CMD-2026-0725", date: "2026-01-30", supplier: "Rexel France", total: 6780.00, status: "delivered", deliveryStep: 3, expectedDelivery: "2026-02-08",
    items: [
      { name: "Chemin de câble 600mm galva", reference: "CDC-600-GV", quantity: 40, unitPrice: 45.00 },
      { name: "Console murale CDC", reference: "CONS-MUR-600", quantity: 20, unitPrice: 28.00 },
      { name: "Couvercle CDC 600mm", reference: "COUV-600-GV", quantity: 40, unitPrice: 22.00 },
      { name: "Éclisse de jonction", reference: "ECL-JONC-GV", quantity: 40, unitPrice: 4.50 },
      { name: "Câble H07RNF 3G4mm²", reference: "H07RNF-3G4", quantity: 500, unitPrice: 3.80 },
    ],
  },
  {
    id: "CMD-2026-0710", date: "2026-01-25", supplier: "Schneider Electric Pro", total: 3450.00, status: "delivered", deliveryStep: 3, expectedDelivery: "2026-02-03",
    items: [
      { name: "Automate M221 24E/S", reference: "TM221CE24R", quantity: 1, unitPrice: 890.00 },
      { name: "Module d'extension 8S", reference: "TM3DQ8R", quantity: 2, unitPrice: 320.00 },
      { name: "IHM Magelis 7\"", reference: "HMIGXU3512", quantity: 1, unitPrice: 1250.00 },
      { name: "Alimentation 24VDC 10A", reference: "ABL8REM24100", quantity: 2, unitPrice: 185.00 },
    ],
  },
  {
    id: "CMD-2025-0698", date: "2025-12-18", supplier: "Sonepar Électrique", total: 1120.00, status: "delivered", deliveryStep: 3, expectedDelivery: "2025-12-28",
    items: [
      { name: "Tube IRL 3321 20mm", reference: "IRL-20-3M", quantity: 100, unitPrice: 3.20 },
      { name: "Coude IRL 20mm", reference: "COU-IRL-20", quantity: 200, unitPrice: 0.80 },
      { name: "Manchon IRL 20mm", reference: "MAN-IRL-20", quantity: 200, unitPrice: 0.60 },
      { name: "Fixation Atlas 20mm", reference: "FIX-ATL-20", quantity: 500, unitPrice: 0.40 },
      { name: "Boîte encastrement BBC", reference: "BTE-BBC-D67", quantity: 200, unitPrice: 0.90 },
    ],
  },
];

export const documents = {
  invoices: [
    { name: "Facture F-2026-0852", date: "2026-03-20", amount: 1523.40, orderId: "CMD-2026-0852" },
    { name: "Facture F-2026-0847", date: "2026-03-18", amount: 2847.60, orderId: "CMD-2026-0847" },
    { name: "Facture F-2026-0845", date: "2026-03-17", amount: 965.00, orderId: "CMD-2026-0845" },
    { name: "Facture F-2026-0841", date: "2026-03-15", amount: 4780.00, orderId: "CMD-2026-0841" },
    { name: "Facture F-2026-0839", date: "2026-03-12", amount: 4210.00, orderId: "CMD-2026-0839" },
    { name: "Facture F-2026-0835", date: "2026-03-10", amount: 3245.80, orderId: "CMD-2026-0835" },
    { name: "Facture F-2026-0830", date: "2026-03-08", amount: 1890.50, orderId: "CMD-2026-0830" },
    { name: "Facture F-2026-0815", date: "2026-03-03", amount: 2156.00, orderId: "CMD-2026-0815" },
    { name: "Facture F-2026-0810", date: "2026-03-01", amount: 743.60, orderId: "CMD-2026-0810" },
    { name: "Facture F-2026-0798", date: "2026-02-28", amount: 3190.00, orderId: "CMD-2026-0798" },
    { name: "Facture F-2026-0790", date: "2026-02-25", amount: 5420.00, orderId: "CMD-2026-0790" },
    { name: "Facture F-2026-0774", date: "2026-02-20", amount: 1654.80, orderId: "CMD-2026-0774" },
    { name: "Facture F-2026-0762", date: "2026-02-15", amount: 980.00, orderId: "CMD-2026-0762" },
    { name: "Facture F-2026-0750", date: "2026-02-10", amount: 2890.00, orderId: "CMD-2026-0750" },
    { name: "Facture F-2026-0725", date: "2026-01-30", amount: 6780.00, orderId: "CMD-2026-0725" },
    { name: "Facture F-2026-0710", date: "2026-01-25", amount: 3450.00, orderId: "CMD-2026-0710" },
    { name: "Facture F-2025-0698", date: "2025-12-18", amount: 1120.00, orderId: "CMD-2025-0698" },
  ],
  deliverySlips: [
    { name: "BL-2026-0841", date: "2026-03-16", orderId: "CMD-2026-0841" },
    { name: "BL-2026-0839", date: "2026-03-15", orderId: "CMD-2026-0839" },
    { name: "BL-2026-0835", date: "2026-03-12", orderId: "CMD-2026-0835" },
    { name: "BL-2026-0815", date: "2026-03-05", orderId: "CMD-2026-0815" },
    { name: "BL-2026-0810", date: "2026-03-03", orderId: "CMD-2026-0810" },
    { name: "BL-2026-0798", date: "2026-03-02", orderId: "CMD-2026-0798" },
    { name: "BL-2026-0790", date: "2026-02-27", orderId: "CMD-2026-0790" },
    { name: "BL-2026-0774", date: "2026-02-24", orderId: "CMD-2026-0774" },
    { name: "BL-2026-0762", date: "2026-02-18", orderId: "CMD-2026-0762" },
    { name: "BL-2026-0750", date: "2026-02-14", orderId: "CMD-2026-0750" },
    { name: "BL-2026-0725", date: "2026-02-03", orderId: "CMD-2026-0725" },
    { name: "BL-2026-0710", date: "2026-01-30", orderId: "CMD-2026-0710" },
    { name: "BL-2025-0698", date: "2025-12-22", orderId: "CMD-2025-0698" },
  ],
};
