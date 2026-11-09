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


## Protection anti-abus du formulaire (configuration Supabase déjà appliquée)

Le projet Supabase connecté possède une protection serveur additionnelle sur `POST /rest/v1/contact_messages` :

- 120 requêtes par empreinte IP sur 15 minutes et 500 sur 24 heures ;
- 300 requêtes globales par heure et 2 000 par 24 heures ;
- empreinte IP HMAC-SHA256 avec secret Vault, sans conservation de l'adresse IP en clair ;
- contrôle du champ `cf-connecting-ip` et réponse temporaire avec recours à WhatsApp si la limite est atteinte.

Ces réglages sont déjà appliqués au projet Supabase. Ne pas réexécuter une ancienne migration de prototype ni remplacer les tables de production. Le fichier `sql/add_contact_message_rate_limit.sql` documente uniquement la limite historique par téléphone/e-mail ; il ne remplace pas la configuration serveur actuellement appliquée.

La version 4.2 améliore également le retour utilisateur : en cas de limitation, d'erreur API ou de perte de connexion, le formulaire affiche un lien WhatsApp cliquable.
