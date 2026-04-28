-- =============================================================================
-- Thia Skincare — Seed Data
-- Run after all migrations with: supabase db push --seed-file supabase/seed.sql
-- =============================================================================

-- ========================
-- Categories (9)
-- ========================

INSERT INTO public.categories (name, slug, description, display_order) VALUES
  ('Cleansers',     'cleansers',     'Gentle face and body cleansers for all skin types',          1),
  ('Moisturizers',  'moisturizers',  'Hydrating creams and lotions for face and body',             2),
  ('Serums',        'serums',        'Concentrated treatments targeting specific skin concerns',   3),
  ('Sunscreens',    'sunscreens',    'Daily sun protection for face and body',                     4),
  ('Body Lotions',  'body-lotions',  'Nourishing full-body hydration',                             5),
  ('Body Scrubs',   'body-scrubs',   'Exfoliating scrubs for smooth, radiant skin',               6),
  ('Shower Gels',   'shower-gels',   'Refreshing and moisturising shower gels',                   7),
  ('Bar Soaps',     'bar-soaps',     'Natural and enriched bar soaps',                             8),
  ('Scents',        'scents',        'Fragrances and body mists inspired by Cameroonian nature',  9);

-- ========================
-- Shipping Zones — Cameroon 10 regions (XAF)
-- NULL city = default cost for the whole region
-- ========================

INSERT INTO public.shipping_zones (region, city, cost) VALUES
  -- Central region (Yaoundé hub)
  ('Centre',     NULL,        2000),
  ('Centre',     'Yaoundé',   1500),

  -- Littoral region (Douala hub)
  ('Littoral',   NULL,        2000),
  ('Littoral',   'Douala',    1500),

  -- West region
  ('West',       NULL,        3000),
  ('West',       'Bafoussam', 2500),

  -- Northwest region
  ('Northwest',  NULL,        3500),
  ('Northwest',  'Bamenda',   3000),

  -- Southwest region
  ('Southwest',  NULL,        3500),
  ('Southwest',  'Buea',      3000),

  -- Adamawa region
  ('Adamawa',    NULL,        4000),
  ('Adamawa',    'Ngaoundéré', 3500),

  -- East region
  ('East',       NULL,        4000),
  ('East',       'Bertoua',   3500),

  -- Far North region
  ('Far North',  NULL,        5000),
  ('Far North',  'Maroua',    4500),

  -- North region
  ('North',      NULL,        4500),
  ('North',      'Garoua',    4000),

  -- South region
  ('South',      NULL,        3500),
  ('South',      'Ebolowa',   3000);

-- ========================
-- Site Settings defaults
-- (also inserted in 00010 migration; this seed re-inserts if not present)
-- ========================

INSERT INTO public.site_settings (key, value)
VALUES
  ('homepage_hero',          '{"image_url": "", "cta_link": "/categories", "cta_text": "Shop Now"}'),
  ('featured_product_ids',   '[]'),
  ('featured_testimonial_ids', '[]'),
  ('default_shipping_cost',  '2000')
ON CONFLICT (key) DO NOTHING;

-- ========================
-- Admin User
-- Create via Supabase Dashboard or CLI, then promote:
--   UPDATE public.profiles SET role = 'admin' WHERE id = '<your-user-uuid>';
-- ========================
