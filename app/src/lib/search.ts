// Recherche intelligente : index local (régions, départements, POIs, géographie physique)
// + recherche communale en direct via geo.api.gouv.fr (les 35 000 communes ne sont pas
// chargées côté client). Normalisation accents/casse.
import { searchCommunes, surfaceKm2 } from '../api/geo'
import { normalize, fmt, BADGE_COLORS } from './format'
import {
  REGIONS,
  PREFECTURES,
  FLEUVES,
  SOMMETS,
  LACS,
  PARCS,
  POIS,
} from '../data/editorial'
import type { ApiDepartement, SearchResult } from '../types'
import type { NavActions } from '../state/actions'

interface IndexEntry extends Omit<SearchResult, 'key'> {
  n: string
}

/** Construit l'index local statique (dépend des listes admin + des actions de navigation). */
export function buildStaticIndex(deps: ApiDepartement[], a: NavActions): IndexEntry[] {
  const prefByCode = new Map(PREFECTURES.map((p) => [p[0], p[1]]))
  const ix: Omit<IndexEntry, 'n'>[] = []

  Object.keys(REGIONS).forEach((code) => {
    const r = REGIONS[code]
    ix.push({
      label: r.nom,
      sub: 'Capitale : ' + r.capitale,
      badge: 'Région',
      color: BADGE_COLORS.region,
      go: () => a.selectRegion(code),
    })
  })

  deps.forEach((d) => {
    ix.push({
      label: d.code + ' — ' + d.nom,
      sub: 'Préfecture : ' + (prefByCode.get(d.code) ?? '—'),
      badge: 'Départ.',
      color: BADGE_COLORS.dep,
      go: () => a.selectDep(d.code),
    })
  })

  POIS.forEach((p) => {
    ix.push({
      label: p[0],
      sub: p[4],
      badge: p[1],
      color: BADGE_COLORS.poi,
      go: () => a.openLieu(p[1], p[0], p[4], [p[2], p[3]], 12, [['Type', p[1]], ['Description', p[4]]]),
    })
  })

  FLEUVES.forEach((fl) => {
    const mid = fl.pts[Math.floor(fl.pts.length / 2)]
    ix.push({
      label: fl.nom,
      sub: 'Fleuve · ' + fl.longueur,
      badge: 'Fleuve',
      color: BADGE_COLORS.water,
      go: () => {
        a.ensureLayer('fleuves')
        a.openLieu('Fleuve', fl.nom, fl.longueur, mid, 7, [['Longueur', fl.longueur]])
      },
    })
  })

  SOMMETS.forEach((s) => {
    ix.push({
      label: s[0],
      sub: s[4] + ' · ' + s[3].toLocaleString('fr-FR') + ' m',
      badge: 'Sommet',
      color: BADGE_COLORS.dep,
      go: () => {
        a.ensureLayer('sommets')
        a.openLieu('Sommet', s[0], s[4], [s[1], s[2]], 11, [
          ['Altitude', s[3].toLocaleString('fr-FR') + ' m'],
          ['Massif', s[4]],
        ])
      },
    })
  })

  LACS.forEach((lc) => {
    ix.push({
      label: lc[0],
      sub: lc[3],
      badge: 'Lac',
      color: BADGE_COLORS.water,
      go: () => {
        a.ensureLayer('lacs')
        a.openLieu('Lac', lc[0], lc[3], [lc[1], lc[2]], 10, [['Caractéristiques', lc[3]]])
      },
    })
  })

  PARCS.forEach((p) => {
    ix.push({
      label: p[0],
      sub: p[3],
      badge: 'Parc',
      color: BADGE_COLORS.commune,
      go: () => {
        a.ensureLayer('parcs')
        a.openLieu('Parc naturel', p[0], p[3], [p[1], p[2]], 9, [['Statut', p[3]]])
      },
    })
  })

  return ix.map((e) => ({ ...e, n: normalize(e.label + ' ' + e.sub) }))
}

/** Exécute une recherche : communes (API) d'abord, puis correspondances locales. */
export async function runSearch(
  query: string,
  staticIndex: IndexEntry[],
  a: NavActions,
): Promise<SearchResult[]> {
  const nq = normalize(query.trim())
  if (nq.length < 2) return []

  const local: SearchResult[] = staticIndex
    .filter((e) => e.n.includes(nq))
    .slice(0, 6)
    .map((e, i) => ({ key: 'l' + i, label: e.label, sub: e.sub, badge: e.badge, color: e.color, go: e.go }))

  let communes: SearchResult[] = []
  try {
    const found = await searchCommunes(query, 5)
    communes = found.map((c) => {
      const km2 = surfaceKm2(c.surface)
      const sub =
        (c.codeDepartement ?? '') +
        (c.population ? ' · ' + fmt(c.population) + ' hab.' : '') +
        (km2 ? ` · ${km2.toFixed(0)} km²` : '')
      return {
        key: 'c' + c.code,
        label: c.nom,
        sub,
        badge: 'Commune',
        color: BADGE_COLORS.commune,
        go: () => a.openCommune(c),
      }
    })
  } catch {
    /* réseau indisponible : on garde les résultats locaux */
  }

  // Communes en tête (résultat le plus attendu), puis entités locales, plafonné à 9.
  const merged = [...communes, ...local]
  const seen = new Set<string>()
  return merged.filter((r) => (seen.has(r.label) ? false : (seen.add(r.label), true))).slice(0, 9)
}

export type { IndexEntry }
