-- Profil publik ringan untuk menampilkan nama pembuat trade
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Penawaran trade
CREATE TABLE public.trade_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  note text,
  contact text,
  status text NOT NULL DEFAULT 'active',
  offer_value numeric NOT NULL DEFAULT 0,
  request_value numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_trade_offers_status_created ON public.trade_offers (status, created_at DESC);
GRANT SELECT ON public.trade_offers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trade_offers TO authenticated;
GRANT ALL ON public.trade_offers TO service_role;
ALTER TABLE public.trade_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trade_offers public read active" ON public.trade_offers FOR SELECT USING (status = 'active');
CREATE POLICY "trade_offers owner read" ON public.trade_offers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "trade_offers admin read" ON public.trade_offers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "trade_offers owner insert" ON public.trade_offers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "trade_offers owner update" ON public.trade_offers FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')) WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "trade_offers owner delete" ON public.trade_offers FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_trade_offers_updated BEFORE UPDATE ON public.trade_offers FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Item di dalam penawaran
CREATE TABLE public.trade_offer_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.trade_offers(id) ON DELETE CASCADE,
  side text NOT NULL,
  item_id uuid REFERENCES public.trade_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  image_url text,
  variant text NOT NULL DEFAULT 'regular',
  qty integer NOT NULL DEFAULT 1,
  value numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_trade_offer_items_offer ON public.trade_offer_items (offer_id);
GRANT SELECT ON public.trade_offer_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trade_offer_items TO authenticated;
GRANT ALL ON public.trade_offer_items TO service_role;
ALTER TABLE public.trade_offer_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trade_offer_items public read" ON public.trade_offer_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.trade_offers o WHERE o.id = offer_id AND o.status = 'active')
);
CREATE POLICY "trade_offer_items owner all" ON public.trade_offer_items FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.trade_offers o WHERE o.id = offer_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
WITH CHECK (EXISTS (SELECT 1 FROM public.trade_offers o WHERE o.id = offer_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

-- Percakapan trade
CREATE TABLE public.trade_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.trade_offers(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  buyer_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (offer_id, buyer_id)
);
GRANT SELECT, INSERT, UPDATE ON public.trade_conversations TO authenticated;
GRANT ALL ON public.trade_conversations TO service_role;
ALTER TABLE public.trade_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trade_conversations participant read" ON public.trade_conversations FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR buyer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "trade_conversations buyer insert" ON public.trade_conversations FOR INSERT TO authenticated
WITH CHECK (buyer_id = auth.uid() AND EXISTS (SELECT 1 FROM public.trade_offers o WHERE o.id = offer_id AND o.user_id = owner_id));
CREATE TRIGGER trg_trade_conversations_updated BEFORE UPDATE ON public.trade_conversations FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Pesan dalam percakapan
CREATE TABLE public.trade_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.trade_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_trade_messages_conv ON public.trade_messages (conversation_id, created_at);
GRANT SELECT, INSERT ON public.trade_messages TO authenticated;
GRANT ALL ON public.trade_messages TO service_role;
ALTER TABLE public.trade_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trade_messages participant read" ON public.trade_messages FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.trade_conversations c WHERE c.id = conversation_id AND (c.owner_id = auth.uid() OR c.buyer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "trade_messages participant insert" ON public.trade_messages FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.trade_conversations c WHERE c.id = conversation_id AND (c.owner_id = auth.uid() OR c.buyer_id = auth.uid())));

-- Notifikasi pengguna
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications (user_id, created_at DESC);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications self read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications self update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Realtime untuk chat & notifikasi
ALTER TABLE public.trade_messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;