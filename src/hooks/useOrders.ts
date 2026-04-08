import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrderRow {
  id: string;
  order_number: string;
  po_number: string | null;
  order_type: string;
  status: string;
  order_date: string;
  expected_delivery: string | null;
  previous_expected_delivery: string | null;
  total_amount: number;
  items_remaining: number;
  delivery_address: Record<string, string> | null;
  customer_email: string | null;
  project_name: string | null;
  created_at: string;
}

export interface LineItemRow {
  id: string;
  order_id: string;
  shipment_id: string | null;
  product_name: string;
  product_reference: string;
  supplier: string;
  quantity: number;
  unit_price: number;
  remaining: number;
}

export interface ShipmentRow {
  id: string;
  order_id: string;
  shipment_index: number;
  status: string;
  carrier: string | null;
  expected_delivery: string | null;
  delivered_at: string | null;
  delivered_signed_by: string | null;
  data_source: string;
  last_update: string;
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("order_date", { ascending: false });
      if (error) throw error;
      return data as OrderRow[];
    },
  });
}

export function useLineItems() {
  return useQuery({
    queryKey: ["line_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("line_items").select("*");
      if (error) throw error;
      return data as LineItemRow[];
    },
  });
}

export function useShipments() {
  return useQuery({
    queryKey: ["shipments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shipments").select("*");
      if (error) throw error;
      return data as ShipmentRow[];
    },
  });
}

export function useOrderWithDetails(orderNumber: string | undefined) {
  return useQuery({
    queryKey: ["order-detail", orderNumber],
    enabled: !!orderNumber,
    queryFn: async () => {
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber!)
        .single();
      if (orderErr) throw orderErr;

      const [{ data: shipments }, { data: lineItems }] = await Promise.all([
        supabase.from("shipments").select("*").eq("order_id", order.id).order("shipment_index"),
        supabase.from("line_items").select("*").eq("order_id", order.id),
      ]);

      return {
        order: order as OrderRow,
        shipments: (shipments ?? []) as ShipmentRow[],
        lineItems: (lineItems ?? []) as LineItemRow[],
      };
    },
  });
}
