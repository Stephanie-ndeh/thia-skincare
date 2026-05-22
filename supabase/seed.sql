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
-- Demo Products (9 products, 6 featured)
-- ========================

INSERT INTO public.products (name, slug, description, ingredients, usage_instructions, category_id, is_featured, is_published)
SELECT
  'Glow Face Cleanser',
  'glow-face-cleanser',
  'A gentle foaming cleanser enriched with African botanicals that removes impurities while preserving your skin''s natural moisture barrier. Suitable for all skin types, including sensitive skin.',
  'Aqua, Glycerin, Cocamidopropyl Betaine, Aloe Barbadensis Leaf Extract, Hibiscus Sabdariffa Flower Extract, Shea Butter, Vitamin E, Allantoin',
  'Apply a small amount to damp skin, massage in circular motions for 30 seconds, then rinse thoroughly with lukewarm water. Use morning and night.',
  id, true, true
FROM public.categories WHERE slug = 'cleansers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, ingredients, usage_instructions, category_id, is_featured, is_published)
SELECT
  'African Shea Moisturizing Cream',
  'african-shea-moisturizing-cream',
  'A rich, deeply nourishing moisturizer crafted from raw Cameroonian shea butter blended with lightweight plant oils. Leaves skin visibly soft, supple, and radiant all day long.',
  'Butyrospermum Parkii (Shea) Butter, Jojoba Oil, Argan Oil, Vitamin C, Niacinamide, Hyaluronic Acid, Aloe Vera Extract',
  'Apply to clean face and neck morning and evening. Gently massage until fully absorbed. For best results, use after toning.',
  id, true, true
FROM public.categories WHERE slug = 'moisturizers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, ingredients, usage_instructions, category_id, is_featured, is_published)
SELECT
  'Vitamin C Brightening Serum',
  'vitamin-c-brightening-serum',
  'A potent brightening serum with 15% stabilised Vitamin C, African turmeric extract, and ferulic acid. Visibly reduces dark spots and evens skin tone in as little as 4 weeks.',
  'Ascorbic Acid 15%, Ferulic Acid, Curcuma Longa (Turmeric) Root Extract, Vitamin E, Hyaluronic Acid, Aqua, Glycerin',
  'Apply 3–4 drops to clean, dry skin before moisturizer. Use in the morning for best results. Follow with SPF during the day.',
  id, true, true
FROM public.categories WHERE slug = 'serums'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, ingredients, usage_instructions, category_id, is_featured, is_published)
SELECT
  'Coffee & Coconut Body Scrub',
  'coffee-coconut-body-scrub',
  'An invigorating exfoliating scrub made with finely ground Cameroonian robusta coffee and coconut oil. Buffs away dead skin cells to reveal smooth, glowing skin — and smells incredible.',
  'Coffea Canephora (Coffee) Grounds, Cocos Nucifera (Coconut) Oil, Brown Sugar, Shea Butter, Vitamin E, Coffee Essential Oil',
  'In the shower, apply to damp skin and massage in circular motions. Focus on dry areas like elbows and knees. Rinse well. Use 2–3 times a week.',
  id, true, true
FROM public.categories WHERE slug = 'body-scrubs'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, ingredients, usage_instructions, category_id, is_featured, is_published)
SELECT
  'Shea & Mango Body Lotion',
  'shea-mango-body-lotion',
  'A lightweight yet deeply moisturizing body lotion blending raw shea butter and mango seed oil. Absorbs quickly, leaving skin feeling silky smooth with a subtle natural fragrance.',
  'Aqua, Butyrospermum Parkii Butter, Mangifera Indica Seed Butter, Glycerin, Aloe Vera, Vitamin E, Panthenol',
  'Apply generously to clean skin after bathing. Massage gently until fully absorbed. For extra dry skin, apply twice daily.',
  id, true, true
FROM public.categories WHERE slug = 'body-lotions'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, ingredients, usage_instructions, category_id, is_featured, is_published)
SELECT
  'Hibiscus & Ylang-Ylang Body Mist',
  'hibiscus-ylang-ylang-body-mist',
  'A light, refreshing body mist inspired by Cameroonian flower gardens. Notes of hibiscus, ylang-ylang, and warm amber create a feminine, long-lasting scent that''s not overpowering.',
  'Aqua, Alcohol Denat., Hibiscus Sabdariffa Extract, Cananga Odorata (Ylang Ylang) Flower Oil, Amber Fragrance, Glycerin',
  'Hold 20–30 cm from skin and mist lightly over body. Can be reapplied throughout the day. Avoid contact with eyes.',
  id, true, true
FROM public.categories WHERE slug = 'scents'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, ingredients, usage_instructions, category_id, is_featured, is_published)
SELECT
  'SPF 50 Daily Sunscreen',
  'spf-50-daily-sunscreen',
  'A lightweight, non-greasy SPF 50 sunscreen formulated for African skin tones — no white cast. Provides broad-spectrum UVA/UVB protection while moisturizing with African botanicals.',
  'Zinc Oxide, Titanium Dioxide, Glycerin, Niacinamide, Aloe Vera Extract, Shea Butter, Vitamin E, Aqua',
  'Apply as the last step in your morning routine, 15 minutes before sun exposure. Reapply every 2–3 hours when outdoors.',
  id, false, true
FROM public.categories WHERE slug = 'sunscreens'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, ingredients, usage_instructions, category_id, is_featured, is_published)
SELECT
  'Aloe Vera Shower Gel',
  'aloe-vera-shower-gel',
  'A soothing, sulphate-free shower gel enriched with cold-pressed aloe vera and green tea extract. Gently cleanses while leaving skin calm, hydrated, and lightly fragranced.',
  'Aqua, Aloe Barbadensis Leaf Juice, Cocamidopropyl Betaine, Sodium Lauryl Sulfoacetate, Green Tea Extract, Glycerin, Provitamin B5',
  'Apply to wet skin using hands or a loofah, lather, then rinse thoroughly. Suitable for daily use.',
  id, false, true
FROM public.categories WHERE slug = 'shower-gels'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, ingredients, usage_instructions, category_id, is_featured, is_published)
SELECT
  'African Black Soap Bar',
  'african-black-soap-bar',
  'Handcrafted from traditional West African plantain ash and raw shea butter, our black soap is celebrated for its gentle yet effective cleansing for face and body. Ideal for acne-prone and sensitive skin.',
  'Plantain Peel Ash, Shea Butter, Coconut Oil, Palm Kernel Oil, Cocoa Pod Ash, Water',
  'Lather with hands or washcloth, apply to face or body, massage gently, then rinse. For the face, use at night. Can be used daily.',
  id, false, true
FROM public.categories WHERE slug = 'bar-soaps'
ON CONFLICT (slug) DO NOTHING;

-- ========================
-- Product Variants
-- ========================

INSERT INTO public.product_variants (product_id, sku, size_label, price, stock_quantity, display_order)
SELECT id, 'CLN-100ML', '100ml', 8500, 80, 1 FROM public.products WHERE slug = 'glow-face-cleanser'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, sku, size_label, price, stock_quantity, display_order)
SELECT id, 'CLN-200ML', '200ml', 14500, 40, 2 FROM public.products WHERE slug = 'glow-face-cleanser'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, sku, size_label, price, stock_quantity, display_order)
SELECT id, 'MST-50ML', '50ml', 12000, 60, 1 FROM public.products WHERE slug = 'african-shea-moisturizing-cream'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, sku, size_label, price, stock_quantity, display_order)
SELECT id, 'MST-100ML', '100ml', 21000, 35, 2 FROM public.products WHERE slug = 'african-shea-moisturizing-cream'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, sku, size_label, price, stock_quantity, display_order)
SELECT id, 'SRM-30ML', '30ml', 18500, 45, 1 FROM public.products WHERE slug = 'vitamin-c-brightening-serum'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, sku, size_label, price, stock_quantity, display_order)
SELECT id, 'SCR-200G', '200g', 7500, 90, 1 FROM public.products WHERE slug = 'coffee-coconut-body-scrub'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, sku, size_label, price, stock_quantity, display_order)
SELECT id, 'SCR-400G', '400g', 13500, 50, 2 FROM public.products WHERE slug = 'coffee-coconut-body-scrub'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, sku, size_label, price, stock_quantity, display_order)
SELECT id, 'LOT-250ML', '250ml', 9500, 70, 1 FROM public.products WHERE slug = 'shea-mango-body-lotion'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, sku, size_label, price, stock_quantity, display_order)
SELECT id, 'LOT-500ML', '500ml', 16000, 45, 2 FROM public.products WHERE slug = 'shea-mango-body-lotion'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, sku, size_label, price, stock_quantity, display_order)
SELECT id, 'MST-200ML', '200ml', 6500, 100, 1 FROM public.products WHERE slug = 'hibiscus-ylang-ylang-body-mist'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, sku, size_label, price, stock_quantity, display_order)
SELECT id, 'SUN-50ML', '50ml', 11000, 55, 1 FROM public.products WHERE slug = 'spf-50-daily-sunscreen'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, sku, size_label, price, stock_quantity, display_order)
SELECT id, 'GEL-250ML', '250ml', 5500, 80, 1 FROM public.products WHERE slug = 'aloe-vera-shower-gel'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, sku, size_label, price, stock_quantity, display_order)
SELECT id, 'SOAP-150G', '150g', 4500, 120, 1 FROM public.products WHERE slug = 'african-black-soap-bar'
ON CONFLICT (sku) DO NOTHING;

-- ========================
-- Featured Testimonials (3)
-- ========================

INSERT INTO public.testimonials (customer_name, text, is_featured, display_order)
VALUES
  ('Amina K.', 'The Vitamin C Serum changed my skin completely! My dark spots have faded significantly in just 6 weeks. I receive so many compliments now — people keep asking what my secret is. Thia is my new holy grail.', true, 1),
  ('Chioma N.', 'I''ve tried so many moisturizers but none compared to the Shea Cream. It''s rich without being heavy, absorbs beautifully, and my skin stays hydrated all day even in the dry season. 100% repurchasing.', true, 2),
  ('Fatou D.', 'The Coffee Body Scrub is absolutely divine — the smell alone is worth it. My skin is so smooth after using it and the results last for days. Finally a scrub that works for my skin tone without irritation.', true, 3)
ON CONFLICT DO NOTHING;

-- Update hero settings to include headline and subheadline
UPDATE public.site_settings
SET value = '{"image_url": "", "headline": "Natural Skincare from Cameroon", "subheadline": "Handcrafted with African botanicals for radiant, healthy skin.", "cta_link": "/categories", "cta_text": "Shop Now"}'
WHERE key = 'homepage_hero';

-- ========================
-- Admin User
-- Create via Supabase Dashboard or CLI, then promote:
--   UPDATE public.profiles SET role = 'admin' WHERE id = '<your-user-uuid>';
-- ========================
