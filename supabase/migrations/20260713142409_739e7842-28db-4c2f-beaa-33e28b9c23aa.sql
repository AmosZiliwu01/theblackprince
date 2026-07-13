
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

CREATE POLICY "user_roles admin read all" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "user_roles self read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Helper macro-ish: we'll create tables then a common admin-write policy pattern.

-- ============ FRUIT CATEGORIES ============
CREATE TABLE public.fruit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fruit_categories TO anon, authenticated;
GRANT ALL ON public.fruit_categories TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.fruit_categories TO authenticated;
ALTER TABLE public.fruit_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.fruit_categories FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.fruit_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_fc_updated BEFORE UPDATE ON public.fruit_categories FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ FRUITS ============
CREATE TABLE public.fruits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  ready BOOLEAN NOT NULL DEFAULT true,
  category TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fruits TO anon, authenticated;
GRANT ALL ON public.fruits TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.fruits TO authenticated;
ALTER TABLE public.fruits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.fruits FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.fruits FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_fruits_updated BEFORE UPDATE ON public.fruits FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ JOKI SERVICES ============
CREATE TABLE public.joki_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  estimation TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.joki_services TO anon, authenticated;
GRANT ALL ON public.joki_services TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.joki_services TO authenticated;
ALTER TABLE public.joki_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.joki_services FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.joki_services FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_joki_updated BEFORE UPDATE ON public.joki_services FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ ACCOUNTS ============
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  level INT,
  race TEXT,
  fruit TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ready',
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.accounts TO anon, authenticated;
GRANT ALL ON public.accounts TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.accounts FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.accounts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_accounts_updated BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ COMMUNITY LINKS ============
CREATE TABLE public.community_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.community_links TO anon, authenticated;
GRANT ALL ON public.community_links TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.community_links TO authenticated;
ALTER TABLE public.community_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.community_links FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.community_links FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_cl_updated BEFORE UPDATE ON public.community_links FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ LIVE STATUS (single row) ============
CREATE TABLE public.live_status (
  id INT PRIMARY KEY DEFAULT 1,
  is_live BOOLEAN NOT NULL DEFAULT false,
  title TEXT,
  live_time TEXT,
  link TEXT,
  ai_message TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);
GRANT SELECT ON public.live_status TO anon, authenticated;
GRANT ALL ON public.live_status TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.live_status TO authenticated;
ALTER TABLE public.live_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.live_status FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.live_status FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_ls_updated BEFORE UPDATE ON public.live_status FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ GIVEAWAYS ============
CREATE TABLE public.giveaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  prize TEXT,
  how_to_join TEXT,
  ends_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.giveaways TO anon, authenticated;
GRANT ALL ON public.giveaways TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.giveaways TO authenticated;
ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.giveaways FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.giveaways FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_giv_updated BEFORE UPDATE ON public.giveaways FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ EVENTS ============
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.events FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_ev_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ FAQS ============
CREATE TABLE public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT ALL ON public.faqs TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.faqs FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_faq_updated BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ AI SETTINGS (single row) ============
CREATE TABLE public.ai_settings (
  id INT PRIMARY KEY DEFAULT 1,
  system_prompt TEXT NOT NULL DEFAULT '',
  greeting TEXT NOT NULL DEFAULT 'Halo bang! Aku Assistant Admin The Black Prince, ada yang bisa aku bantu?',
  forbidden_words TEXT NOT NULL DEFAULT '',
  custom_instructions TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row_ai CHECK (id = 1)
);
GRANT SELECT ON public.ai_settings TO anon, authenticated;
GRANT ALL ON public.ai_settings TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.ai_settings TO authenticated;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.ai_settings FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.ai_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_ai_updated BEFORE UPDATE ON public.ai_settings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ BANNERS ============
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'hero',
  image_url TEXT,
  title TEXT,
  subtitle TEXT,
  link TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon, authenticated;
GRANT ALL ON public.banners TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.banners TO authenticated;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.banners FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.banners FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_ban_updated BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ ANNOUNCEMENTS ============
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT ALL ON public.announcements TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.announcements FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_ann_updated BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ WEBSITE SETTINGS (single row) ============
CREATE TABLE public.website_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_name TEXT NOT NULL DEFAULT 'The Black Prince',
  tagline TEXT NOT NULL DEFAULT 'Blox Fruits Shop, Joki, Account & Community',
  logo_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row_ws CHECK (id = 1)
);
GRANT SELECT ON public.website_settings TO anon, authenticated;
GRANT ALL ON public.website_settings TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.website_settings TO authenticated;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "admin write" ON public.website_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_ws_updated BEFORE UPDATE ON public.website_settings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ CHAT SESSIONS ============
CREATE TABLE public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key TEXT NOT NULL UNIQUE,
  user_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.chat_sessions TO anon, authenticated;
GRANT ALL ON public.chat_sessions TO service_role;
GRANT DELETE ON public.chat_sessions TO authenticated;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can create session" ON public.chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can update own by key" ON public.chat_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "admin read all sessions" ON public.chat_sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete sessions" ON public.chat_sessions FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ CHAT MESSAGES ============
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.chat_messages TO anon, authenticated;
GRANT SELECT, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can insert msg" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read all messages" ON public.chat_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete messages" ON public.chat_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_key, created_at);

-- ============ SEED DEFAULT ROWS ============
INSERT INTO public.live_status(id,is_live) VALUES (1,false);
INSERT INTO public.ai_settings(id,system_prompt) VALUES (1,
'Kamu adalah ASSISTANT ADMIN The Black Prince, admin toko Blox Fruits Indonesia. Kamu ramah, santai, gaul, dan paham bahasa Indonesia termasuk singkatan (bg, min, bro, gk, ga, ngab, bjir, dll) dan typo. Kamu WAJIB menjawab pertanyaan harga, stok, link komunitas, status live, giveaway, event, dan FAQ berdasarkan DATA REAL yang diberikan pada context. Jangan mengarang harga atau stok. Jika data tidak tersedia atau kosong, katakan belum tersedia. Untuk pertanyaan umum Blox Fruits (cara awaken, race, raid, kitsune, dll) boleh menjawab dari pengetahuanmu. Untuk pertanyaan "PS mana", arahkan user untuk gabung komunitas dulu karena link PS dibagikan di grup. Gunakan gaya bahasa ringan dan panggil user "bang" atau "kak".');
INSERT INTO public.website_settings(id) VALUES (1);

INSERT INTO public.fruit_categories(name,sort_order) VALUES
  ('Common',1),('Uncommon',2),('Rare',3),('Legendary',4),('Mythical',5),('Gomu',6);
