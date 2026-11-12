# Noor Communication — site web

Site vitrine statique en français pour Noor Communication (Kinshasa, RDC), connecté à Supabase.

## Déploiement

- Publier le contenu de ce dossier à la racine d’un projet Cloudflare Pages (ou Netlify).
- Le fichier `_headers` configure les en-têtes de sécurité sur ces hébergeurs. GitHub Pages ne lit pas `_headers`.
- Renseigner le domaine définitif avant d’ajouter `sitemap.xml`, `rel=canonical` et `og:url` absolus.
- `config.js` contient uniquement la clé publishable Supabase, prévue pour le navigateur. Ne jamais y placer `service_role`.
- Le code et les créations Noor sont propriétaires; voir `LICENSE`.
- L’administration est sur `admin.html`; les droits réels sont contrôlés par Supabase Auth, RLS et la fonction `noor-admin-users`.
- Les visiteurs n’ont pas de compte à créer. Le formulaire public est protégé par un honeypot, une validation de coordonnées et une limite de trois envois par téléphone/e-mail sur 15 minutes côté PostgreSQL.

## Animations

`motion.css` et `motion.js` fournissent les révélations au défilement, le dévoilement des titres et la barre de progression. Les animations sont désactivées lorsque `prefers-reduced-motion` est activé.

## Vérifications avant mise en ligne

1. Tester connexion admin, ajout/modification de services, tarifs, réalisations, articles, textes et paramètres.
2. Tester invitation des deux administrateurs restants et la configuration SMTP Supabase.
3. Tester le formulaire contact sur mobile et ordinateur, avec téléphone seul puis e-mail seul.
4. Vérifier les règles RLS, les accès anon et les journaux Supabase.
5. Ajouter le domaine définitif puis compléter les URLs canoniques, Open Graph absolus et le sitemap.

## Dépendances externes

Supabase JS est chargé depuis jsDelivr avec une version v2 fixée (`2.49.4`). L’empreinte SRI n’a pas pu être récupérée dans cet environnement hors ligne; une copie locale du SDK ou un hash SRI vérifié reste une amélioration de durcissement. Les polices sont chargées depuis Google Fonts.

## Protection anti-abus du formulaire — état de production vérifié le 10 novembre 2026

La production utilise deux déclencheurs PostgreSQL `BEFORE INSERT` sur `public.contact_messages` :

- `noor_contact_rate_limit_before_insert` appelle `private.noor_contact_rate_limit()` : maximum de 3 messages par téléphone ou e-mail sur 15 minutes.
- `noor_contact_ip_global_rate_limit_before_insert` appelle `private.noor_contact_ip_global_rate_limit()` : 10 requêtes par IP sur 15 minutes, 30 par IP sur 24 heures, 40 globales par heure et 150 globales sur 24 heures.

Le contrôle par IP utilise l’en-tête Cloudflare `cf-connecting-ip` et un secret Vault pour calculer une empreinte HMAC-SHA256. Si l’en-tête IP ou le secret Vault est absent ou invalide, les limites par IP sont ignorées ; les limites globales restent actives. L’adresse IP en clair et le secret Vault ne sont pas stockés dans le dépôt.

**Limitation connue :** l’adresse IP complète est hachée, sans normalisation par préfixe IPv6. Une rotation d’adresse IPv6 peut donc contourner les quotas par IP. Ce point reste à corriger.

La garde avant requête `private.noor_contact_request_guard()` présente dans un ancien fichier SQL n'est pas configurée dans l'état de production vérifié. Ne pas exécuter `sql/20261109_adjust_contact_rate_limits.sql`. Les définitions SQL extraites de la production sont conservées à titre de référence dans `sql/snapshots/2026-11-10_contact_message_production_state.sql.snapshot`. Ce snapshot n'est pas une migration et ne doit pas être exécuté directement.

La protection réelle et l'insertion publique restent à valider de bout en bout par le test HTTP C.
