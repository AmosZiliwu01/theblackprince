
-- Product image columns
ALTER TABLE public.fruits ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.fruits ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.fruits ADD COLUMN IF NOT EXISTS alt_text TEXT;

ALTER TABLE public.joki_services ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.joki_services ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.joki_services ADD COLUMN IF NOT EXISTS alt_text TEXT;
ALTER TABLE public.joki_services ADD COLUMN IF NOT EXISTS stock INT;
ALTER TABLE public.joki_services ADD COLUMN IF NOT EXISTS category TEXT;

ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- WhatsApp number for orders
ALTER TABLE public.website_settings ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE public.website_settings ADD COLUMN IF NOT EXISTS whatsapp_greeting TEXT;

-- Ensure product-images storage bucket policies (bucket created via tool separately)
-- Public read on product-images objects
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='product_images public read'
  ) THEN
    CREATE POLICY "product_images public read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='product_images admin write'
  ) THEN
    CREATE POLICY "product_images admin write" ON storage.objects FOR ALL TO authenticated USING (bucket_id='product-images' AND public.has_role(auth.uid(),'admin')) WITH CHECK (bucket_id='product-images' AND public.has_role(auth.uid(),'admin'));
  END IF;
END $$;
