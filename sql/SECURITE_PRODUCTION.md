# Noor Communication — état de sécurité de production

Le projet Supabase `ghjdhdnztvcrijualwxc` a déjà reçu les migrations de protection anti-abus le 9 novembre 2026.

La protection PostgREST utilise `private.noor_contact_request_guard` sur les POST visant `contact_messages`. Les seuils sont 120/IP/15 min, 500/IP/24 h, 300 global/heure et 2 000 global/24 h. L'identifiant réseau est HMAC-SHA256 avec un secret Vault nommé `noor_contact_ip_salt`; aucune IP en clair n'est conservée. L'envoi conserve aussi le déclencheur existant limitant les coordonnées répétées à 3 messages/15 min.

**Important :** ne pas appliquer les anciennes migrations de prototype et ne pas remplacer les tables. Le schéma de production existant est la référence. Les modifications SQL doivent passer par des migrations incrémentales et non destructives.

Le contrôle statique du code source ne remplace pas un test réel du formulaire depuis le domaine de production.
