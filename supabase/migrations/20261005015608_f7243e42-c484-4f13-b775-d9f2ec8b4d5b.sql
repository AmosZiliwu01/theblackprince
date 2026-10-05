CREATE OR REPLACE FUNCTION public.notify_trade_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c record; target uuid; sender_name text;
BEGIN
  SELECT * INTO c FROM trade_conversations WHERE id = NEW.conversation_id;
  IF c IS NULL THEN RETURN NEW; END IF;
  target := CASE WHEN NEW.sender_id = c.owner_id THEN c.buyer_id ELSE c.owner_id END;
  IF target = NEW.sender_id THEN RETURN NEW; END IF;
  SELECT display_name INTO sender_name FROM profiles WHERE id = NEW.sender_id;
  INSERT INTO notifications(user_id, type, title, body, link)
  VALUES (target, 'trade_chat', 'Pesan baru dari ' || coalesce(sender_name, 'trader'),
          left(NEW.content, 120), '/trade/' || c.offer_id);
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.notify_trade_message() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS trg_notify_trade_message ON public.trade_messages;
CREATE TRIGGER trg_notify_trade_message AFTER INSERT ON public.trade_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_trade_message();