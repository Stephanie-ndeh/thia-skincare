CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (key, value) VALUES
  ('homepage_hero', '{"image_url": "", "cta_link": "/categories", "cta_text": "Shop Now"}'),
  ('featured_product_ids', '[]'),
  ('featured_testimonial_ids', '[]'),
  ('default_shipping_cost', '2000');
