ALTER TABLE public.promotions ADD COLUMN IF NOT EXISTS target_kinds text[] NOT NULL DEFAULT '{}'::text[];

UPDATE public.promotions
SET target_kinds = ARRAY[target_kind]
WHERE target_kind IS NOT NULL AND (target_kinds IS NULL OR array_length(target_kinds, 1) IS NULL);

CREATE TABLE IF NOT EXISTS public.trade_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL,
  type text NOT NULL DEFAULT 'physical',
  image_url text,
  regular_value numeric,
  permanent_value numeric,
  gamepass_value numeric,
  demand text,
  trend text,
  source text,
  source_updated_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (slug, type)
);

GRANT SELECT ON public.trade_items TO anon;
GRANT SELECT ON public.trade_items TO authenticated;
GRANT ALL ON public.trade_items TO service_role;

ALTER TABLE public.trade_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON public.trade_items FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.trade_items FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_trade_items_updated BEFORE UPDATE ON public.trade_items
  FOR EACH ROW EXECUTE FUNCTION tg_set_updated_at();