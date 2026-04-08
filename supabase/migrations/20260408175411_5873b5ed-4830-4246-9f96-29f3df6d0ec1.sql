
-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  po_number TEXT,
  order_type TEXT NOT NULL DEFAULT 'Web',
  status TEXT NOT NULL DEFAULT 'on_track',
  order_date DATE NOT NULL DEFAULT now(),
  expected_delivery DATE,
  previous_expected_delivery DATE,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  items_remaining INTEGER NOT NULL DEFAULT 0,
  delivery_address JSONB,
  customer_email TEXT,
  project_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);

-- Create shipments table
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shipment_index INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'confirmed',
  carrier TEXT,
  expected_delivery DATE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivered_signed_by TEXT,
  data_source TEXT NOT NULL DEFAULT 'warehouse',
  last_update TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read shipments" ON public.shipments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert shipments" ON public.shipments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update shipments" ON public.shipments FOR UPDATE USING (true);

-- Create line_items table
CREATE TABLE public.line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES public.shipments(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_reference TEXT NOT NULL,
  supplier TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  remaining INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read line_items" ON public.line_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert line_items" ON public.line_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update line_items" ON public.line_items FOR UPDATE USING (true);

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL UNIQUE,
  email BOOLEAN NOT NULL DEFAULT false,
  push BOOLEAN NOT NULL DEFAULT false,
  daily_digest BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read notification_preferences" ON public.notification_preferences FOR SELECT USING (true);
CREATE POLICY "Anyone can insert notification_preferences" ON public.notification_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update notification_preferences" ON public.notification_preferences FOR UPDATE USING (true);

-- Indexes for common queries
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_date ON public.orders(order_date DESC);
CREATE INDEX idx_orders_project_name ON public.orders(project_name);
CREATE INDEX idx_line_items_order_id ON public.line_items(order_id);
CREATE INDEX idx_line_items_shipment_id ON public.line_items(shipment_id);
CREATE INDEX idx_shipments_order_id ON public.shipments(order_id);
