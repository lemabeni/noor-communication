# Noor Communication

Site web officiel de Noor Communication.

## Import de la version V4.2

Déposez à la racine du dépôt le fichier `Noor_Communication_V4_2_Securite_Formulaire.zip`.

Le workflow GitHub Actions `.github/workflows/import-noor-site.yml` extraira automatiquement le dossier `Noor_Communication_V4` à la racine du dépôt, puis créera un commit contenant le site.

Le fichier ZIP sera supprimé du dépôt après extraction. Les fichiers sources du site resteront versionnés.

## Déploiement

Le déploiement Cloudflare Pages sera configuré après vérification de l'import. Le site de production existant ne doit pas être remplacé avant validation.
