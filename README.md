# Geographor — Géographie de France (Atlas interactif)

Atlas interactif de la géographie de France : carte Leaflet avec navigation hiérarchique
France → régions → départements → communes, fiches détaillées, recherche intelligente, cartes
thématiques, géographie physique, synthèse IA et PWA installable.

## Structure du dépôt

- **[`app/`](app/)** — l'application (Vite + React + TypeScript, PWA). C'est le code à exécuter.
  Voir [`app/README.md`](app/README.md) pour le démarrage, l'architecture et les sources de données.
- **[`design_handoff_geographie_france/`](design_handoff_geographie_france/)** — le handoff de design
  d'origine (prototype HTML de référence, données d'exemple, captures, script d'ingestion). Sert de
  référence, n'est pas exécuté en production.

## Démarrage rapide

```bash
cd app
npm install
npm run dev
```

## Données

Approche hybride : **APIs réelles** (`geo.api.gouv.fr`, Wikidata/Commons, Wikipédia, OpenRouter pour
l'IA) pour tout ce qui dispose d'une source structurée, et **données curées embarquées** pour les
contenus éditoriaux régionaux et les métriques thématiques (INSEE/RTE) sans API libre équivalente.
Détails dans [`app/README.md`](app/README.md).
