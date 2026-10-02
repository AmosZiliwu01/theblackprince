CREATE TABLE public.link_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.link_groups TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.link_groups TO authenticated;
GRANT ALL ON public.link_groups TO service_role;
ALTER TABLE public.link_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "link groups public read" ON public.link_groups FOR SELECT USING (true);
CREATE POLICY "link groups admin write" ON public.link_groups FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_link_groups_updated BEFORE UPDATE ON public.link_groups FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
INSERT INTO public.link_groups (name, sort_order) VALUES ('Chat Admin & Komunitas', 0), ('Dukung & Kepercayaan', 1), ('Sosial & Roblox', 2) ON CONFLICT (name) DO NOTHING;
INSERT INTO public.link_groups (name, sort_order) SELECT DISTINCT link_group, 100 FROM public.community_links WHERE link_group IS NOT NULL AND btrim(link_group) <> '' ON CONFLICT (name) DO NOTHING;
ALTER TABLE public.website_settings ADD COLUMN store_cta_title text NOT NULL DEFAULT 'Beli di The Black Prince Store';
ALTER TABLE public.website_settings ADD COLUMN store_cta_description text NOT NULL DEFAULT '';
ALTER TABLE public.website_settings ADD COLUMN payment_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.website_settings ADD COLUMN payment_qris_url text;
ALTER TABLE public.website_settings ADD COLUMN payment_wallet_number text;
ALTER TABLE public.website_settings ADD COLUMN payment_note text;
CREATE TABLE public.trade_offer_contacts (
  offer_id uuid PRIMARY KEY REFERENCES public.trade_offers(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  whatsapp_number text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trade_contact_number_valid CHECK (whatsapp_number ~ '^\+[1-9][0-9]{7,14}$')
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trade_offer_contacts TO authenticated;
GRANT ALL ON public.trade_offer_contacts TO service_role;
ALTER TABLE public.trade_offer_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trade contact owner read" ON public.trade_offer_contacts FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "trade contact owner insert" ON public.trade_offer_contacts FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.trade_offers o WHERE o.id = offer_id AND o.user_id = auth.uid()));
CREATE POLICY "trade contact owner update" ON public.trade_offer_contacts FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND EXISTS (SELECT 1 FROM public.trade_offers o WHERE o.id = offer_id AND o.user_id = auth.uid()));
CREATE POLICY "trade contact owner delete" ON public.trade_offer_contacts FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE TRIGGER trg_trade_contacts_updated BEFORE UPDATE ON public.trade_offer_contacts FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();