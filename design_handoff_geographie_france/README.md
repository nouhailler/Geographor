# Handoff : Géographie de France — Atlas interactif

## Overview

Prototype d'une PWA (Progressive Web App) React de géographie de France, à destination de collectivités/professionnels de l'urbanisme. Cœur de l'app : une carte interactive (France → régions → départements → communes) avec fiches détaillées, recherche intelligente, cartes thématiques et géographie physique. Objectif produit final : PWA installable, responsive mobile/desktop, données réelles (INSEE, IGN, Wikidata).

## About the Design Files

Les fichiers de ce dossier (`source/Géographie de France.dc.html` + `source/data.js`) sont des **références de design en HTML** : un prototype fonctionnel montrant l'apparence et le comportement voulus, **pas du code à copier tel quel dans la codebase finale**. La tâche est de **recréer ce design dans l'environnement cible** (React/Next.js recommandé vu la nature de l'app — cartographie, état de navigation, recherche — ou le framework déjà en place s'il y en a un) en utilisant ses patterns et librairies établis.

Le prototype utilise Leaflet.js pour la carte (chargé en CDN dans le HTML) — c'est un excellent choix à conserver côté production également (mature, léger, écosystème de plugins riche), mais libre à l'équipe de choisir Mapbox GL / MapLibre si un rendu vectoriel plus poussé est souhaité.

## Fidelity

**Haute-fidélité (hifi)** pour la structure de navigation, les layouts, la palette et la typographie : à recréer précisément. **Les données sont un échantillon de démonstration** (13 régions complètes, 96 départements de base dont 6 fiches enrichies, 10 communes détaillées, métriques régionales arrondies) — à remplacer par des données réelles en production (voir section Données ci-dessous).

## Screens / Views

### 1. Carte — vue France (`screenshots/01-carte-france.png`)
- **Purpose** : point d'entrée. Navigation hiérarchique France → région → département → commune.
- **Layout** : 3 colonnes en desktop — sidebar gauche fixe 252px (calques/navigation), carte flex-1 au centre, panneau fiche à droite (392px, apparaît seulement au clic sur un élément). Header fixe 58px en haut, pleine largeur.
- **Header** : logo "FR" (34×34px, radius 7px, fond `#2f5d8a`) + titre "Géographie de France" (15px/700) + sous-titre "Atlas interactif" (10.5px, uppercase, letter-spacing 0.06em, gris) — barre de recherche centrale (max-width 520px, height 38px, radius 8px, fond `#f5f4f0`, icône loupe à gauche) — 3 onglets à droite ("Carte"/"Thématiques"/"Physique", boutons 34px height, actif = fond `#2f5d8a` texte blanc) — bouton roue dentée 36×36px tout à droite.
- **Sidebar (onglet Carte)** : sections "Navigation" (fil d'Ariane cliquable France › Région › Département), "Repères" (cases à cocher Préfectures/Grandes villes), "Géographie physique" (Fleuves/Sommets/Parcs/Lacs), "Fond de carte" (radios Plan/Topo/Satellite).
- **Carte** : Leaflet réel, 3 fonds de tuiles (CARTO Positron clair par défaut, OpenTopoMap, Esri World Imagery satellite). Régions en GeoJSON, style par défaut `fill:#dfe8ef stroke:#7d97ab weight:1.2`, hover `fill:#cfdde9`. Contrôle zoom en haut à droite.

### 2. Fiche commune (`screenshots/02-fiche-commune-paris.png`)
- **Purpose** : détail complet d'une commune après clic sur un marqueur ville ou résultat de recherche.
- **Layout** : panneau droit 392px, header (badge coloré + code INSEE + bouton fermer), corps scrollable avec padding 18px.
- **Bloc médias** (spécifique commune) : grille 2×1 blason/drapeau (84px de haut, image `object-fit:contain` sur fond blanc si présente, sinon placeholder hachuré avec mention "non existant" si le drapeau n'existe pas) puis grille 2×1 photos pleine largeur (110px, `object-fit:cover`). Boutons "Vue satellite" / "Carte topographique" en dessous, puis lien site officiel.
- **Tableau de données** : lignes label/valeur alternées avec séparateur `border-bottom:1px solid rgba(0,0,0,0.06)` — Code INSEE, code postal, département, région, population, superficie, densité, altitude min/max, coordonnées GPS, gentilé, maire.
- **Texte** : section "Historique" — titre en majuscules `#2f5d8a` 10px/700, letter-spacing 0.1em, texte 12.5px/1.55 line-height.
- **Badge** : couleur par type d'entité — Région `#2f5d8a` (bleu), Département `#6b4a2e` (brun), Commune `#4e7a5a` (vert), lieu générique `#555c63` (gris).

### 3. Fiche département (`screenshots/06-fiche-departement.png`)
- Même structure de panneau. Données : préfecture, sous-préfectures, population, nb communes, superficie, densité, point culminant, cours d'eau. Sections texte : Histoire, Économie, Agriculture, Tourisme, Gastronomie, Spécialités, Monuments célèbres.

### 4. Fiche région
- Données : capitale régionale, population, superficie, densité, PIB, PIB/habitant, nombre de départements. **Chips cliquables** listant les départements (pill 100px radius, bordure 1px, hover → bordure/texte bleu `#2f5d8a`). Sections texte : Climat, Économie, Universités, Parcs naturels, Tourisme, Traditions, Histoire.

### 5. Cartes thématiques (`screenshots/03-cartes-thematiques.png`)
- **Sidebar** : liste de 12 métriques (Population, Densité, PIB/hab, Chômage, Revenu médian, Température, Pluviométrie, Part forêt/agricole, Éolien/Solaire/Nucléaire). Item actif : fond `rgba(47,93,138,0.10)`, texte bleu 700.
- **Carte** : choroplèthe par région, couleur interpolée `rgb(232,238,244) → rgb(24,74,118)` (échelle non linéaire, `pow(t, 0.6)` pour accentuer les valeurs hautes).
- **Légende** flottante en bas à gauche de la carte : titre + 5 pastilles de couleur avec valeur formatée (ex. "12,3 M" pour population, "24 800 €" pour revenu).

### 6. Géographie physique (`screenshots/04-geographie-physique.png`)
- **Sidebar** : 9 sections empilées (Massifs & relief, Fleuves, Rivières, Lacs, Parcs naturels, Cascades, Forêts, Zones humides, Littoral), chaque item = titre 12.5px/600 + sous-texte 11px gris.
- Active automatiquement les calques Fleuves/Sommets/Parcs/Lacs sur la carte à l'ouverture de l'onglet.

### 7. Recherche intelligente
- Dropdown sous la barre de recherche (max ~9 résultats), déclenché dès 2 caractères, recherche normalisée (accents/casse ignorés) sur : communes, départements, régions, villes, monuments/châteaux/musées (POIs), fleuves, sommets, lacs, parcs.
- Chaque résultat : badge coloré par type (min-width 64px) + label + sous-texte tronqué (`text-overflow:ellipsis`).

### 8. Paramètres IA (`screenshots/05-parametres-ia.png`)
- Modal centré (460px max, overlay `rgba(20,22,24,0.42)`), ouvert via la roue dentée.
- Champ clé API OpenRouter (type password, stockage `localStorage` uniquement, jamais transmis).
- Liste de modèles **gratuits** chargée en direct depuis `GET https://openrouter.ai/api/v1/models`, filtrée sur `id` se terminant par `:free` (ou pricing prompt/completion = 0). Sélection = surlignage `rgba(47,93,138,0.10)`, badge vert "GRATUIT".
- Boutons Fermer / Enregistrer (persistent clé + modèle choisi en `localStorage`).
- **Non branché à une fonctionnalité IA concrète dans ce prototype** — la clé/modèle sont stockés mais aucun appel de complétion n'est câblé. À faire côté production si souhaité (ex. résumé de fiche, aide à la rédaction).

## Interactions & Behavior

- **Clic région** → zoom + affichage des départements de cette région (GeoJSON filtré) + ouverture fiche région. Fil d'Ariane mis à jour.
- **Clic département** → zoom sur ses contours + ouverture fiche département. Si la région n'était pas encore sélectionnée, la sélectionne d'abord.
- **Clic marqueur ville** → `flyTo` (animation Leaflet, ~1s) + ouverture fiche commune (ou fiche générique "Ville" si commune non détaillée dans l'échantillon).
- **Clic sur logo "FR"** ou breadcrumb "France" → réinitialise à la vue France entière, ferme la fiche.
- **Bascule d'onglet Carte/Thématiques/Physique** : la carte thématique applique un style choroplèthe (remplace le style région par défaut) ; en quittant l'onglet Thématiques le style par défaut est restauré ; l'onglet Physique active automatiquement 4 calques nature.
- **Recherche** : debounce implicite (déclenché à chaque frappe dès 2 caractères), clic sur un résultat déclenche la navigation appropriée + ferme le dropdown.
- **Responsive (≤900px)** : sidebar et panneau fiche passent en position `absolute` avec ombre portée (au lieu de flex in-flow), un bouton "☰" apparaît dans le header pour basculer l'affichage de la sidebar. Le sous-titre "Atlas interactif" est masqué.
- **Images cassées** (blason/drapeau/photo) : `onError` masque silencieusement l'`<img>` (`display:none`) plutôt que d'afficher l'icône de lien brisé du navigateur.
- **PWA** : `manifest.json` + service worker (`sw.js`, cache-first pour la coquille applicative, stale-while-revalidate pour les tuiles de carte) + meta tags iOS. Prêt pour l'installation une fois déployé sur un domaine HTTPS réel (l'installabilité ne peut pas être testée dans l'environnement de prototypage).

## State Management

État local (composant unique dans le prototype, à répartir selon l'architecture cible — contexte de navigation carte + store séparé pour les préférences IA est une bonne décomposition) :
- `tab` : `'carte' | 'theme' | 'phys'`
- `regionSel`, `depSel` : codes INSEE sélectionnés (navigation hiérarchique)
- `fiche` : objet décrivant l'entité affichée dans le panneau (`{kind: 'region'|'dep'|'commune'|'lieu', code/nom, ...}`) ou `null`
- `layers` : booléens par calque (prefs, villes, fleuves, sommets, parcs, lacs)
- `base` : fond de carte actif (`plan`/`topo`/`sat`)
- `metric` : métrique thématique active + `legend` (bornes calculées dynamiquement min/max)
- `searchQ`, `searchResults`, `searchOpen` : état de la recherche
- `apiKey`, `selectedModel` : persistés en `localStorage` (clés `gf_openrouter_key`, `gf_openrouter_model`), `freeModels` chargé à l'ouverture du modal (pas de cache — rechargé si la liste est vide)

## Design Tokens

**Couleurs**
- Fond global : `#f5f4f0` · Panneaux/header : `#fdfdfc` · Texte : `#22262a`
- Accent primaire (régions, liens, actif) : `#2f5d8a`
- Départements/préfectures : `#6b4a2e` (brun)
- Communes/nature (parcs) : `#4e7a5a` (vert)
- Fleuves/lacs : `#3b7ea1` / `#4f86b8`
- Bordures : `rgba(0,0,0,0.10)` à `rgba(0,0,0,0.14)` selon le poids visuel voulu
- Choroplèthe thématique : interpolation `rgb(232,238,244)` (min) → `rgb(24,74,118)` (max), exposant `0.6`

**Typographie** : Archivo (Google Fonts, poids 500/600/700) partout, système `system-ui` en repli. Tailles : 22px/700 (titre fiche), 15px/700 (titre header), 13px (corps UI), 12.5px (valeurs de tableau), 11-11.5px (sous-textes), 10-10.5px/700 uppercase letter-spacing 0.06-0.1em (labels de section).

**Rayons** : 4px (cases à cocher, pastilles légende), 6-8px (boutons, inputs, lignes de liste), 10-12px (cartes/modals), 100px (chips pill départements).

**Ombres** : `0 12px 32px rgba(0,0,0,0.14)` (dropdown recherche), `0 6px 20px rgba(0,0,0,0.10)` (légende carte), `0 24px 64px rgba(0,0,0,0.28)` (modal paramètres).

**Espacement** : header 58px de haut, sidebar 252px de large, panneau fiche 392px, padding intérieur standard 14-18px.

## Assets

- **Fonds de carte** : CARTO Positron (`basemaps.cartocdn.com/light_all`), OpenTopoMap, Esri World Imagery — tous via tuiles publiques, attribution affichée automatiquement par Leaflet.
- **GeoJSON régions/départements** : issus du dépôt public `gregoiredavid/france-geojson` (licence ouverte), versions simplifiées incluses dans `source/`.
- **Blason/photos Paris** : Wikimedia Commons, licence CC BY-SA — voir attribution sur la page fichier de chaque image. **Important** : dans l'environnement de prototypage, ces images sont chargées via l'URL de redirection `commons.wikimedia.org/wiki/Special:FilePath/...` ; en production, préférer l'URL `upload.wikimedia.org` résolue directement (plus rapide, pas de redirection) — voir `source/scripts/README-ingestion.md`.
- **Icônes PWA** : générées pour ce prototype (`source/icons/`), à remplacer par une véritable identité visuelle si le produit est prolongé.

## Données — comment passer à l'échelle (35 000 communes)

Le script `source/scripts/ingest-communes-media.js` (Node.js, sans dépendance) interroge Wikidata (SPARQL) pour croiser code INSEE ↔ blason (P94) ↔ drapeau (P41) ↔ photo (P18), puis résout chaque fichier via l'API Commons (URL, licence, attribution). Voir `source/scripts/README-ingestion.md` pour l'usage complet, la couverture attendue (~50-60% pour les blasons, variable pour les photos, drapeaux quasi inexistants pour les communes françaises) et la gestion des cas manquants (proposer à l'utilisateur d'uploader une image plutôt que de faire générer une image par une IA — une IA ne peut pas produire un vrai blason officiel ou une vraie photo, seulement une image plausible mais fictive).

Pour les données administratives de base (population, superficie, code postal, etc.) sur l'ensemble des communes/départements/régions, utiliser l'API officielle **geo.api.gouv.fr** (gratuite, sans clé) plutôt que l'échantillon statique du prototype.

## Files

- `source/Géographie de France.dc.html` — composant principal (template + logique). Le rendu s'appuie sur un petit runtime (`support.js`) propre à l'outil de prototypage : **ne pas copier ce fichier de runtime**, il ne doit pas exister dans la codebase cible. Ce qui compte est le contenu HTML/JS du template et de la classe logique, à traduire dans le framework choisi.
- `source/data.js` — jeu de données d'exemple (régions, départements, communes, métriques, fleuves, sommets, parcs, lacs, POIs).
- `source/regions-version-simplifiee.geojson`, `source/departements-version-simplifiee.geojson` — contours administratifs.
- `source/manifest.json`, `source/sw.js`, `source/icons/` — configuration PWA.
- `source/scripts/` — script d'ingestion Wikidata/Commons + documentation.
