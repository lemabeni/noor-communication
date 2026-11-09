-- Noor Communication — ajustement anti-spam incrémental
-- Seuils approuvés : 10/IP/15 min, 30/IP/24 h, 40 global/heure, 150 global/24 h.
-- Ne modifie ni les messages existants, ni les tables, ni le trigger téléphone/e-mail.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets
    WHERE name = 'noor_contact_ip_salt'
  ) THEN
    BEGIN
      PERFORM vault.create_secret(
        encode(extensions.gen_random_bytes(32), 'hex'),
        'noor_contact_ip_salt',
        'Secret HMAC généré par PostgreSQL pour pseudonymiser les IP du formulaire Noor'
      );
    EXCEPTION WHEN OTHERS THEN
      -- Le contrôle par IP sera ignoré si Vault est momentanément indisponible.
      RAISE WARNING 'Noor anti-spam: impossible de créer le secret Vault; limites IP désactivées temporairement.';
    END;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION private.noor_contact_request_guard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_method text;
  v_path text;
  v_headers jsonb;
  v_ip_text text;
  v_ip inet;
  v_salt text;
  v_ip_hash bytea;
  v_global_hash bytea;
  v_now timestamptz := pg_catalog.now();
  v_hits integer;
BEGIN
  v_method := pg_catalog.current_setting('request.method', true);
  v_path := pg_catalog.current_setting('request.path', true);

  IF v_method IS DISTINCT FROM 'POST'
     OR v_path IS NULL
     OR v_path NOT LIKE '%contact_messages%' THEN
    RETURN;
  END IF;

  v_headers := COALESCE(
    pg_catalog.current_setting('request.headers', true)::jsonb,
    '{}'::jsonb
  );

  -- L'adresse IP n'est utilisée que si l'en-tête Cloudflare est présent
  -- et valide. Aucun fallback vers des en-têtes falsifiables.
  v_ip_text := pg_catalog.btrim(COALESCE(v_headers ->> 'cf-connecting-ip', ''));

  IF v_ip_text <> '' THEN
    BEGIN
      v_ip := v_ip_text::inet;
    EXCEPTION WHEN OTHERS THEN
      v_ip := NULL;
    END;
  END IF;

  -- Si Vault/secret manque, seules les limites IP sont sautées.
  -- Les plafonds globaux restent toujours actifs.
  BEGIN
    SELECT decrypted_secret
      INTO v_salt
    FROM vault.decrypted_secrets
    WHERE name = 'noor_contact_ip_salt'
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_salt := NULL;
  END;

  IF v_ip IS NOT NULL AND v_salt IS NOT NULL
     AND pg_catalog.length(v_salt) >= 32 THEN
    v_ip_hash := extensions.hmac(
      pg_catalog.convert_to(v_ip::text, 'UTF8'),
      pg_catalog.convert_to(v_salt, 'UTF8'),
      'sha256'
    );

    v_hits := private.noor_rate_limit_hit(
      'ip_15m', v_ip_hash,
      pg_catalog.date_bin(interval '15 minutes', v_now, timestamptz '2000-01-01 00:00:00+00')
    );
    IF v_hits > 10 THEN
      RAISE SQLSTATE 'PGRST'
      USING
        MESSAGE = pg_catalog.json_build_object(
          'code', 'NOOR_RATE_LIMIT',
          'message', 'Vous avez atteint la limite temporaire d’envoi.',
          'details', 'Veuillez réessayer dans quelques minutes.',
          'hint', 'Vous pouvez utiliser le bouton WhatsApp sur la page Contact.'
        )::text,
        DETAIL = pg_catalog.json_build_object(
          'status', 429,
          'headers', pg_catalog.json_build_object('Retry-After', '900')
        )::text;
    END IF;

    v_hits := private.noor_rate_limit_hit(
      'ip_24h', v_ip_hash,
      pg_catalog.date_bin(interval '24 hours', v_now, timestamptz '2000-01-01 00:00:00+00')
    );
    IF v_hits > 30 THEN
      RAISE SQLSTATE 'PGRST'
      USING
        MESSAGE = pg_catalog.json_build_object(
          'code', 'NOOR_RATE_LIMIT',
          'message', 'La limite quotidienne d’envoi est atteinte.',
          'details', 'Veuillez réessayer ultérieurement.',
          'hint', 'Vous pouvez utiliser le bouton WhatsApp sur la page Contact.'
        )::text,
        DETAIL = pg_catalog.json_build_object(
          'status', 429,
          'headers', pg_catalog.json_build_object('Retry-After', '3600')
        )::text;
    END IF;
  END IF;

  -- Limites globales indépendantes du secret Vault et de l'en-tête IP.
  v_global_hash := extensions.digest(
    pg_catalog.convert_to('noor-contact-global', 'UTF8'),
    'sha256'
  );

  v_hits := private.noor_rate_limit_hit(
    'global_1h', v_global_hash,
    pg_catalog.date_bin(interval '1 hour', v_now, timestamptz '2000-01-01 00:00:00+00')
  );
  IF v_hits > 40 THEN
    RAISE SQLSTATE 'PGRST'
    USING
      MESSAGE = pg_catalog.json_build_object(
        'code', 'NOOR_GLOBAL_LIMIT',
        'message', 'Notre formulaire reçoit actuellement trop de demandes.',
        'details', 'Veuillez réessayer plus tard.',
        'hint', 'Vous pouvez utiliser le bouton WhatsApp sur la page Contact.'
      )::text,
      DETAIL = pg_catalog.json_build_object(
        'status', 429,
        'headers', pg_catalog.json_build_object('Retry-After', '3600')
      )::text;
  END IF;

  v_hits := private.noor_rate_limit_hit(
    'global_24h', v_global_hash,
    pg_catalog.date_bin(interval '24 hours', v_now, timestamptz '2000-01-01 00:00:00+00')
  );
  IF v_hits > 150 THEN
    RAISE SQLSTATE 'PGRST'
    USING
      MESSAGE = pg_catalog.json_build_object(
        'code', 'NOOR_GLOBAL_LIMIT',
        'message', 'Le formulaire est momentanément indisponible.',
        'details', 'Veuillez réessayer ultérieurement.',
        'hint', 'Vous pouvez utiliser le bouton WhatsApp sur la page Contact.'
      )::text,
      DETAIL = pg_catalog.json_build_object(
        'status', 429,
        'headers', pg_catalog.json_build_object('Retry-After', '3600')
      )::text;
  END IF;

  IF v_hits % 100 = 0 THEN
    DELETE FROM private.noor_contact_rate_limits
    WHERE window_start < v_now - interval '48 hours';
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION private.noor_contact_request_guard() FROM PUBLIC, anon, authenticated;
