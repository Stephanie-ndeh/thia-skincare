-- order_number_seq: sequential counter for human-readable order numbers
CREATE SEQUENCE public.order_number_seq START 1;

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,              -- Human-readable: THIA-000001
  user_id UUID REFERENCES public.profiles(id),   -- Nullable for guest checkout
  guest_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed')),
  payment_channel TEXT,
  payment_phone TEXT,
  payment_reference TEXT,
  notchpay_reference TEXT,
  subtotal INT NOT NULL CHECK (subtotal >= 0),
  shipping_cost INT NOT NULL DEFAULT 0,
  discount_amount INT NOT NULL DEFAULT 0,
  total INT NOT NULL CHECK (total >= 0),
  -- discount_code_id FK added in 00008 after discount_codes is created
  discount_code_id UUID,
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_region TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_address_line TEXT NOT NULL,
  shipping_notes TEXT,
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_number ON public.orders(order_number);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_payment_ref ON public.orders(payment_reference);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'THIA-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- order_items: snapshot of purchased items (denormalized for historical accuracy)
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id),
  product_name TEXT NOT NULL,    -- Snapshot at purchase time
  variant_label TEXT NOT NULL,   -- Snapshot: "50ml / Rose"
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price INT NOT NULL CHECK (unit_price > 0),  -- Snapshot at purchase time
  line_total INT NOT NULL CHECK (line_total > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);
