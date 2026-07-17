-- Adds a manually-set Ringgit Malaysia price alongside the existing Rupiah
-- price for fruits, joki_services, and accounts. Admin fills both in
-- independently -- this is NOT an automatic conversion.
-- Run this in Supabase SQL Editor (Lovable Cloud > Database > SQL editor).

ALTER TABLE public.fruits
  ADD COLUMN IF NOT EXISTS price_rm NUMERIC;

ALTER TABLE public.joki_services
  ADD COLUMN IF NOT EXISTS price_rm NUMERIC;

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS price_rm NUMERIC;