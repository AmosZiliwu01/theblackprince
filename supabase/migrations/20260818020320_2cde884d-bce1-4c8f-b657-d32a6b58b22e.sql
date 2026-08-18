ALTER TABLE public.trade_items
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS rarity text,
  ADD COLUMN IF NOT EXISTS category text;

-- Hapus baris duplikat lama (Perm X sebagai item terpisah)
DELETE FROM public.trade_items WHERE type = 'permanent';
UPDATE public.trade_items SET type = 'fruit', category = 'Fruits' WHERE type = 'physical';