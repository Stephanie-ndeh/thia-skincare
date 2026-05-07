CREATE TABLE public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value INT NOT NULL CHECK (value > 0),          -- Percentage (1-100) or fixed XAF
  minimum_order INT DEFAULT 0,                   -- Minimum order amount in XAF
  usage_limit INT,                               -- NULL = unlimited
  usage_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive lookup index
CREATE UNIQUE INDEX idx_discount_code ON public.discount_codes(upper(code));

-- Now that discount_codes exists, add the FK from orders
ALTER TABLE public.orders
  ADD CONSTRAINT fk_orders_discount_code
  FOREIGN KEY (discount_code_id) REFERENCES public.discount_codes(id);
