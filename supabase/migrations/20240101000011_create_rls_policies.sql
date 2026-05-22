-- is_admin() helper: checks if the current auth user has role='admin' in profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ========================
-- PUBLIC READ (storefront)
-- ========================

CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (is_published = true);

CREATE POLICY "variants_public_read" ON public.product_variants
  FOR SELECT USING (true);

CREATE POLICY "images_public_read" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "reviews_public_read" ON public.reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "shipping_zones_public_read" ON public.shipping_zones
  FOR SELECT USING (true);

CREATE POLICY "discount_codes_public_read" ON public.discount_codes
  FOR SELECT USING (is_active = true);

CREATE POLICY "testimonials_public_read" ON public.testimonials
  FOR SELECT USING (true);

CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT USING (true);

-- ========================
-- AUTHENTICATED USER (own data only)
-- ========================

CREATE POLICY "profiles_own_read" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "addresses_own_select" ON public.addresses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "addresses_own_insert" ON public.addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "addresses_own_update" ON public.addresses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "addresses_own_delete" ON public.addresses
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "cart_own_select" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cart_own_insert" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_own_update" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cart_own_delete" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "orders_own_read" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "order_items_own_read" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "reviews_own_insert" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_own_read" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reviews_own_update" ON public.reviews
  FOR UPDATE USING (
    auth.uid() = user_id
    AND created_at > now() - interval '48 hours'
  );

-- ========================
-- ADMIN (full access via service role or admin role)
-- ========================

CREATE POLICY "admin_all_profiles" ON public.profiles FOR ALL USING (is_admin());
CREATE POLICY "admin_all_categories" ON public.categories FOR ALL USING (is_admin());
CREATE POLICY "admin_all_products" ON public.products FOR ALL USING (is_admin());
CREATE POLICY "admin_all_variants" ON public.product_variants FOR ALL USING (is_admin());
CREATE POLICY "admin_all_images" ON public.product_images FOR ALL USING (is_admin());
CREATE POLICY "admin_all_orders" ON public.orders FOR ALL USING (is_admin());
CREATE POLICY "admin_all_order_items" ON public.order_items FOR ALL USING (is_admin());
CREATE POLICY "admin_all_reviews" ON public.reviews FOR ALL USING (is_admin());
CREATE POLICY "admin_all_shipping" ON public.shipping_zones FOR ALL USING (is_admin());
CREATE POLICY "admin_all_discounts" ON public.discount_codes FOR ALL USING (is_admin());
CREATE POLICY "admin_all_testimonials" ON public.testimonials FOR ALL USING (is_admin());
CREATE POLICY "admin_all_settings" ON public.site_settings FOR ALL USING (is_admin());
