# Ingestion des blasons, drapeaux et photos de communes (Wikidata + Wikimedia Commons)

Ce dossier contient un script Node.js autonome (`ingest-communes-media.js`) destiné à être **exécuté localement ou par Claude Code**, pas dans ce projet (l'environnement de prototypage n'a pas d'accès réseau sortant). Objectif : construire un fichier `communes-media.json` associant à chaque code INSEE les URLs de blason, drapeau/logo et photo(s), avec licence et attribution.

## Pourquoi Wikidata et pas une recherche image par image

Chaque commune française a (en général) un item Wikidata identifié par son **code INSEE (propriété P374)**. Cet item porte souvent :
- `P94` — blason / coat of arms (fichier Commons SVG/PNG)
- `P41` — drapeau (rare pour les communes françaises)
- `P18` — image représentative (photo)
- `P373` — catégorie Commons (pour piocher plusieurs photos)

Interroger Wikidata en SPARQL par lots permet de résoudre ça en quelques centaines de requêtes au lieu de 35 000 recherches individuelles, et donne une source structurée plutôt que du matching flou par nom de commune (ambigu : ~30 communes s'appellent "Saint-Martin", etc.).

## Étapes

1. **Récupérer la liste des communes** (source officielle) : fichier COG INSEE ou `https://geo.api.gouv.fr/communes?fields=nom,code,codeDepartement,codeRegion&format=json` (environ 35 000 lignes). Sauvegardez en `communes.json`.
2. **Lancer le script** :
   ```bash
   node ingest-communes-media.js communes.json communes-media.json
   ```
   Le script :
   - découpe la liste en lots de 200 codes INSEE,
   - interroge `https://query.wikidata.org/sparql` avec `VALUES` sur les codes,
   - pour chaque item trouvé, résout le nom de fichier Commons en URL directe + licence via l'API `commons.wikimedia.org/w/api.php?action=query&prop=imageinfo`,
   - écrit une ligne JSON par commune au fur et à mesure (reprise possible si interrompu — le script saute les codes déjà présents dans le fichier de sortie),
   - respecte un délai entre requêtes (throttle) pour rester dans les limites d'usage de Wikidata/Commons.
3. **Résultat** : `communes-media.json`, un objet `{ "75056": { blason, drapeau, photo, licence, attribution, commonsCategory }, ... }`. Fusionnez-le dans `data.js` (ou chargez-le en fichier séparé et joignez par code INSEE au runtime).

## Couverture attendue

- Blasons : environ 50-60 % des communes (bonne couverture sur communes moyennes/grandes, plus faible sur les très petits villages).
- Photos : variable, meilleure couverture via P18 + catégorie Commons associée que via une seule image.
- Drapeaux : quasi inexistants pour les communes françaises (concept plus courant à l'étranger) — à traiter comme rare, pas comme absence de donnée.

## Note pour l'intégration dans ce prototype

Le bac à sable de prévisualisation de cet environnement de design bloque le chargement direct d'images depuis `upload.wikimedia.org` (le CDN d'assets). Pour l'aperçu dans cet outil, utilisez la redirection `https://commons.wikimedia.org/wiki/Special:FilePath/<nom_du_fichier>?width=NNN` plutôt que l'URL `upload.wikimedia.org` résolue par le script. En production (hors de cet environnement), l'URL `upload.wikimedia.org` directe fonctionne normalement et est préférable (plus rapide, pas de redirection).

## Licences

Les fichiers Commons sont presque tous en CC-BY-SA ou domaine public, mais l'attribution est **obligatoire** pour CC-BY-SA. Le script récupère le champ `attribution`/auteur — affichez-le en petit sous chaque image dans l'app (comme actuellement fait pour Paris).

## Pour les communes sans résultat

Le script produit aussi `communes-media-manquants.json` (liste des codes INSEE sans blason/photo). Pour ces cas, préférez un **fallback d'upload utilisateur** dans l'app plutôt qu'une génération IA — une IA ne peut pas produire une vraie photo ou un vrai blason officiel, seulement une image plausible mais fictive.
