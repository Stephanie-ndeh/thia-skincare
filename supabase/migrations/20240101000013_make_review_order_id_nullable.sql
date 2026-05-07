-- Make order_id optional on reviews (story 4.3 allows reviews without a linked order)
ALTER TABLE public.reviews
  ALTER COLUMN order_id DROP NOT NULL;

-- Replace the (product_id, user_id, order_id) unique constraint with
-- (product_id, user_id) so one review per product per user is enforced
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_product_id_user_id_order_id_key;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_product_id_user_id_key UNIQUE (product_id, user_id);
