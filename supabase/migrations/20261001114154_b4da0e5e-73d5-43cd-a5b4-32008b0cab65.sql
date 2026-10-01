ALTER TABLE public.community_links ADD COLUMN IF NOT EXISTS link_group TEXT NOT NULL DEFAULT 'Sosial & Roblox';
ALTER TABLE public.community_links ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.community_links ADD COLUMN IF NOT EXISTS note TEXT;