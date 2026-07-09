# Géographie de France — Atlas interactif (PWA)

Implémentation React/Vite/TypeScript de l'atlas décrit dans
`../design_handoff_geographie_france/README.md`. Carte interactive (France → régions →
départements → communes), fiches détaillées, recherche intelligente, cartes thématiques,
géographie physique, et paramètres IA (OpenRouter).

## Démarrer

```bash
npm install
npm run dev        # serveur de dev (http://localhost:5173)
npm run build      # build de production (dist/) + génération PWA
npm run preview    # sert le build de production
```

Node ≥ 18. Aucune clé d'API requise pour la cartographie.

## Sources de données — hybride assumé

Le handoff précise que certaines données n'ont pas d'API libre structurée (métriques RTE/INSEE,
textes éditoriaux régionaux). L'app combine donc **données réelles en direct** et **données curées
embarquées** :

| Donnée | Source | Type |
| --- | --- | --- |
| Régions / départements / communes (listes, population, surface, centre) | `geo.api.gouv.fr` | **API réelle** |
| Recherche de communes (fuzzy, pondérée population) | `geo.api.gouv.fr?nom=` | **API réelle** |
| Stats agrégées d'un département (pop, nb communes, superficie) | somme des communes du dép. | **API réelle** |
| Blason / drapeau / gentilé / altitude d'une commune | Wikidata (SPARQL, par code INSEE P374) → Commons | **API réelle** |
| Maire en cours d'une commune | Wikidata P6 (statement sans date de fin, début le plus récent) | **API réelle** |
| Photos d'une commune (jusqu'à 4) | Wikidata P18 + membres image de la catégorie Commons (P373) | **API réelle** |
| Historique d'une commune | Wikipédia REST (résumé) | **API réelle** |
| Synthèse IA d'une fiche | OpenRouter (modèle gratuit choisi) | **API réelle** (clé requise) |
| Contours régions / départements (polygones) | GeoJSON simplifié embarqué (`public/geo/`, open data france-geojson) | statique |
| Textes éditoriaux région (climat, économie, histoire…) | `src/data/editorial.ts` | **curé** |
| 12 métriques thématiques (chômage, pluviométrie, nucléaire…) | `src/data/editorial.ts` | **curé** (ordres de grandeur INSEE/RTE) |
| Fiches départementales détaillées (6 exemples) | `src/data/editorial.ts` | **curé** |
| Géographie physique (fleuves, sommets, parcs, lacs, POIs) + préfectures | `src/data/editorial.ts` | **curé / référence** |

> Pour passer à l'échelle (35 000 communes) : le script d'ingestion Wikidata/Commons du handoff
> (`../design_handoff_geographie_france/source/scripts/`) peut pré-calculer les médias. Ici, les
> médias sont résolus **à la volée** à l'ouverture de chaque fiche commune (avec cache mémoire).

## Architecture

```
src/
├── App.tsx              état global + actions de navigation (orchestrateur)
├── types.ts             types du domaine
├── api/
│   ├── geo.ts           geo.api.gouv.fr (régions, départements, communes, agrégats)
│   └── media.ts         Wikidata (SPARQL) + Wikipédia (résumé)
├── lib/
│   ├── search.ts        index local + recherche communale en direct
│   ├── theme.ts         échelle choroplèthe (interp. + exposant 0.6)
│   ├── fiche.ts         assemblage du modèle de fiche (réel + curé)
│   └── format.ts        formatage FR, normalisation accents, tokens couleur
├── state/
│   ├── actions.ts       interface NavActions
│   └── useSettings.ts   paramètres IA OpenRouter (localStorage + modèles gratuits)
├── components/
│   ├── Header.tsx        en-tête + recherche + onglets
│   ├── Sidebar.tsx       calques / thématiques / physique
│   ├── MapView.tsx       intégration Leaflet (impérative, via ref)
│   ├── Fiche.tsx         panneau de détail
│   ├── Legend.tsx        légende choroplèthe
│   └── SettingsModal.tsx modal paramètres IA
└── data/editorial.ts    données curées (voir tableau ci-dessus)
```

**Carte** : Leaflet en accès direct (impératif) encapsulé dans `MapView`, qui expose une API via
`ref` (`focusRegion`, `focusDep`, `flyTo`, `setCommuneMarkers`, choroplèthe…). `App` combine ces
appels impératifs avec l'état React — les gestionnaires de clic Leaflet lisent l'état courant via un
ref « live » pour éviter les closures périmées.

**Fonds de carte** : CARTO Positron (plan clair), OpenTopoMap (topo), Esri World Imagery (satellite).

## PWA

`vite-plugin-pwa` (Workbox) génère `manifest.webmanifest` + service worker :
- coquille applicative (HTML/JS/GeoJSON/icônes) en precache ;
- tuiles de carte en `StaleWhileRevalidate` ;
- appels API (geo.api.gouv.fr, Wikidata, Wikipédia) en `NetworkFirst` avec repli cache.

Installable une fois déployée sur un domaine HTTPS.

## Fonction IA — synthèse de fiche

Chaque fiche (région, département, commune, lieu) propose un bloc **« Synthèse IA »** avec un bouton
*Générer*. À l'activation, `src/api/ai.ts` envoie les données déjà affichées (titre, lignes de
tableau, textes) au modèle OpenRouter sélectionné via `POST /chat/completions`, et rend un paragraphe
de synthèse en français. Le prompt interdit explicitement d'inventer des chiffres.

Prérequis : une clé OpenRouter + un modèle gratuit configurés dans le modal (roue dentée). Sans clé,
le bloc invite à ouvrir les paramètres. Clé et modèle sont stockés en `localStorage`
(`gf_openrouter_key`, `gf_openrouter_model`) et ne sont transmis qu'à OpenRouter. La liste des modèles
est chargée en direct depuis `https://openrouter.ai/api/v1/models`, filtrée sur `:free`.

## Sélection de département

Cliquez une région (zoom + affichage de ses départements) puis un département : ses **communes réelles**
sont chargées depuis `geo.api.gouv.fr` (marqueurs sur la carte) et ses **statistiques agrégées** —
population, nombre de communes, superficie, densité — sont calculées à la volée et affichées dans la
fiche. La couche « Préfectures » permet aussi de sélectionner un département directement au niveau
national.

## Écarts connus / pistes production

- Altitude/gentilé/maire/photos communaux dépendent de la présence des propriétés Wikidata et de la
  catégorie Commons (couverture variable selon les communes).
- Le maire provient de Wikidata (P6, statement en cours) : exact quand la donnée y est à jour, sinon
  potentiellement daté. Source autoritative alternative : Répertoire National des Élus (data.gouv.fr).
- La synthèse IA n'est pas streamée (réponse en un bloc) ; le streaming SSE est un ajout possible.
- Textes région/département et métriques thématiques restent curés (pas d'API libre équivalente).
- Icônes PWA reprises du handoff — à remplacer par une identité visuelle définitive.
