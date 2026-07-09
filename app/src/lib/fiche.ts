// Assemble le modèle d'affichage d'une fiche à partir de la référence d'entité,
// des données éditoriales curées et des données réelles (API + médias).
import { REGIONS, DEP_FICHES, PREFECTURES } from '../data/editorial'
import { surfaceKm2, communeLatLng } from '../api/geo'
import { fmt, BADGE_COLORS } from './format'
import type {
  ApiCommune,
  CommuneMedia,
  EntityKind,
  FicheRef,
} from '../types'
import type { NavActions } from '../state/actions'

export interface DepChip {
  label: string
  go: () => void
}

export interface FicheModel {
  kind: EntityKind
  badge: string
  badgeColor: string
  code: string
  titre: string
  sous: string
  rows: [string, string][]
  texts: [string, string][]
  depChips?: DepChip[]
  commune?: {
    blason?: string
    drapeau?: string
    photos: string[]
    hasSite: boolean
    siteUrl?: string
    siteLabel?: string
    mediaLoading: boolean
  }
}

export interface FicheContext {
  regionNames: Map<string, string> // code région -> nom (API)
  depNames: Map<string, string> // code dép -> nom (API)
  communeMedia: CommuneMedia | null
  depAgg: { population: number; nbCommunes: number; supKm2: number } | null
}

const prefName = (code: string) => PREFECTURES.find((p) => p[0] === code)?.[1] ?? '—'

export function buildFicheModel(
  ref: FicheRef,
  ctx: FicheContext,
  actions: NavActions,
): FicheModel | null {
  if (ref.kind === 'region') {
    const r = REGIONS[ref.code]
    if (!r) return null
    const dens = Math.round(r.pop / r.sup)
    return {
      kind: 'region',
      badge: 'Région',
      badgeColor: BADGE_COLORS.region,
      code: 'INSEE ' + ref.code,
      titre: r.nom,
      sous: 'Capitale régionale : ' + r.capitale,
      rows: [
        ['Population', fmt(r.pop) + ' hab.'],
        ['Superficie', fmt(r.sup) + ' km²'],
        ['Densité', dens + ' hab/km²'],
        ['PIB', r.pib],
        ['PIB par habitant', r.pibHab + ' k€/an'],
        ['Départements', String(r.deps.length)],
      ],
      texts: [
        ['Climat', r.climat],
        ['Économie', r.economie],
        ['Universités', r.universites],
        ['Parcs naturels', r.parcs],
        ['Tourisme', r.tourisme],
        ['Traditions', r.traditions],
        ['Histoire', r.histoire],
      ],
      depChips: r.deps.map((code) => ({
        label: code + ' ' + (ctx.depNames.get(code) ?? ''),
        go: () => actions.selectDep(code),
      })),
    }
  }

  if (ref.kind === 'dep') {
    const nom = ctx.depNames.get(ref.code) ?? ref.code
    const det = DEP_FICHES[ref.code]
    const agg = ctx.depAgg
    const regionCodeGuess = Object.keys(REGIONS).find((rc) => REGIONS[rc].deps.includes(ref.code))
    const regionNom = regionCodeGuess ? REGIONS[regionCodeGuess].nom : '—'

    const rows: [string, string][] = [
      ['Préfecture', prefName(ref.code)],
      ['Région', regionNom],
    ]
    if (agg) {
      rows.push(['Population', fmt(agg.population) + ' hab.'])
      rows.push(['Communes', fmt(agg.nbCommunes)])
      rows.push(['Superficie', fmt(agg.supKm2) + ' km²'])
      if (agg.supKm2 > 0) rows.push(['Densité', Math.round(agg.population / agg.supKm2) + ' hab/km²'])
    } else {
      rows.push(['Population', '— (chargement…)'])
    }
    if (det) {
      rows.push(['Sous-préfectures', det.sousPrefs.length ? det.sousPrefs.join(', ') : 'aucune'])
      rows.push(['Point culminant', det.pointCulminant])
      rows.push(["Cours d'eau", det.fleuves])
    }

    const texts: [string, string][] = det
      ? [
          ['Histoire', det.histoire],
          ['Économie', det.economie],
          ['Agriculture', det.agriculture],
          ['Tourisme', det.tourisme],
          ['Gastronomie', det.gastronomie],
          ['Spécialités', det.specialites],
          ['Monuments célèbres', det.monuments],
        ]
      : [
          [
            'Fiche détaillée',
            'Fiches éditoriales complètes disponibles pour : Paris (75), Alpes-Maritimes (06), Finistère (29), Gironde (33), Rhône (69) et Haute-Savoie (74). Les autres départements affichent les statistiques réelles agrégées depuis geo.api.gouv.fr.',
          ],
        ]

    return {
      kind: 'dep',
      badge: 'Département',
      badgeColor: BADGE_COLORS.dep,
      code: 'INSEE ' + ref.code,
      titre: nom,
      sous: 'Préfecture : ' + prefName(ref.code),
      rows,
      texts,
    }
  }

  if (ref.kind === 'commune') {
    const c: ApiCommune = ref.commune
    const media = ctx.communeMedia
    const km2 = surfaceKm2(c.surface)
    const ll = communeLatLng(c)
    const regionNom = c.codeRegion ? ctx.regionNames.get(c.codeRegion) ?? '' : ''
    const depNom = c.codeDepartement ? ctx.depNames.get(c.codeDepartement) ?? '' : ''

    const rows: [string, string][] = [
      ['Code INSEE', c.code],
      ['Code postal', (c.codesPostaux ?? []).join(', ') || '—'],
      ['Département', (c.codeDepartement ?? '') + (depNom ? ' — ' + depNom : '')],
      ['Région', regionNom],
      ['Population', c.population != null ? fmt(c.population) + ' hab.' : '—'],
      ['Superficie', km2 != null ? km2.toLocaleString('fr-FR') + ' km²' : '—'],
    ]
    if (km2 && c.population) rows.push(['Densité', fmt(Math.round(c.population / km2)) + ' hab/km²'])
    if (media?.elevation != null) rows.push(['Altitude', fmt(media.elevation) + ' m'])
    if (ll) rows.push(['Coordonnées GPS', ll[0].toFixed(4) + ', ' + ll[1].toFixed(4)])
    if (media?.gentile) rows.push(['Gentilé', media.gentile])
    if (media?.maire) rows.push(['Maire', media.maire])

    const texts: [string, string][] = []
    if (media?.historique) texts.push(['Historique', media.historique])
    else if (media && !media.loading) texts.push(['Historique', 'Aucun résumé Wikipédia trouvé pour cette commune.'])

    return {
      kind: 'commune',
      badge: 'Commune',
      badgeColor: BADGE_COLORS.commune,
      code: 'INSEE ' + c.code,
      titre: c.nom,
      sous: [depNom, regionNom].filter(Boolean).join(' · '),
      rows,
      texts,
      commune: {
        blason: media?.blason,
        drapeau: media?.drapeau,
        photos: media?.photos ?? [],
        hasSite: !!media?.wikipediaUrl,
        siteUrl: media?.wikipediaUrl,
        siteLabel: media?.wikipediaUrl ? 'Wikipédia' : undefined,
        mediaLoading: media?.loading ?? true,
      },
    }
  }

  // lieu
  return {
    kind: 'lieu',
    badge: ref.badge,
    badgeColor: BADGE_COLORS.lieu,
    code: '',
    titre: ref.titre,
    sous: ref.sous,
    rows: ref.rows,
    texts: [],
  }
}
