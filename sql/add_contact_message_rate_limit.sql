-- Limitation anti-abus des messages publics : 3 messages maximum par e-mail/téléphone sur 15 minutes.
-- Le contrôle est exécuté côté PostgreSQL et ne dépend pas du navigateur.
create or replace function private.noor_contact_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_email text := lower(btrim(coalesce(new.email, '')));
  v_phone text := regexp_replace(coalesce(new.phone, ''), '[^0-9+]', '', 'g');
  v_recent integer;
begin
  if v_email = '' and v_phone = '' then
    raise exception 'Veuillez fournir un téléphone ou une adresse e-mail pour être recontacté.';
  end if;
  if v_email <> '' then
    perform pg_advisory_xact_lock(hashtextextended('noor-contact-email:' || v_email, 0));
  end if;
  if v_phone <> '' then
    perform pg_advisory_xact_lock(hashtextextended('noor-contact-phone:' || v_phone, 0));
  end if;
  select count(*) into v_recent
  from public.contact_messages m
  where m.created_at > now() - interval '15 minutes'
    and ((v_email <> '' and lower(btrim(coalesce(m.email, ''))) = v_email)
      or (v_phone <> '' and regexp_replace(coalesce(m.phone, ''), '[^0-9+]', '', 'g') = v_phone));
  if v_recent >= 3 then
    raise exception 'Trop de messages envoyés récemment avec ces coordonnées. Réessayez dans quelques minutes.';
  end if;
  return new;
end;
$$;
drop trigger if exists noor_contact_rate_limit_before_insert on public.contact_messages;
create trigger noor_contact_rate_limit_before_insert
before insert on public.contact_messages
for each row execute function private.noor_contact_rate_limit();
revoke all on function private.noor_contact_rate_limit() from public, anon, authenticated;
