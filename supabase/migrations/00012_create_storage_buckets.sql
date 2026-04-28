-- Create public storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images',      'product-images',      true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('category-images',     'category-images',     true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('testimonial-photos',  'testimonial-photos',  true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('site-assets',         'site-assets',         true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- ========================
-- product-images
-- ========================

CREATE POLICY "product_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_admin_write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "product_images_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "product_images_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());

-- ========================
-- category-images
-- ========================

CREATE POLICY "category_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-images');

CREATE POLICY "category_images_admin_write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'category-images' AND public.is_admin());

CREATE POLICY "category_images_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'category-images' AND public.is_admin());

CREATE POLICY "category_images_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'category-images' AND public.is_admin());

-- ========================
-- testimonial-photos
-- ========================

CREATE POLICY "testimonial_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'testimonial-photos');

CREATE POLICY "testimonial_photos_admin_write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'testimonial-photos' AND public.is_admin());

CREATE POLICY "testimonial_photos_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'testimonial-photos' AND public.is_admin());

CREATE POLICY "testimonial_photos_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'testimonial-photos' AND public.is_admin());

-- ========================
-- site-assets
-- ========================

CREATE POLICY "site_assets_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

CREATE POLICY "site_assets_admin_write"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

CREATE POLICY "site_assets_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-assets' AND public.is_admin());

CREATE POLICY "site_assets_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-assets' AND public.is_admin());
