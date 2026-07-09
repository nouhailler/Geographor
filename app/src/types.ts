// ---- Types du domaine ----

export type TabId = 'carte' | 'theme' | 'phys'
export type BaseMap = 'plan' | 'topo' | 'sat'
export type EntityKind = 'region' | 'dep' | 'commune' | 'lieu'

export type LayerKey = 'prefs' | 'villes' | 'fleuves' | 'sommets' | 'parcs' | 'lacs'
export type LayerState = Record<LayerKey, boolean>

/** Données administratives issues de geo.api.gouv.fr */
export interface ApiRegion {
  code: string
  nom: string
}
export interface ApiDepartement {
  code: string
  nom: string
  codeRegion: string
}
export interface ApiCommune {
  code: string // code INSEE
  nom: string
  codesPostaux?: string[]
  population?: number
  surface?: number // hectares
  centre?: { type: 'Point'; coordinates: [number, number] } // [lng, lat]
  codeDepartement?: string
  codeRegion?: string
}

/** Média + enrichissement d'une commune (Wikidata / Commons / Wikipédia) */
export interface CommuneMedia {
  blason?: string
  drapeau?: string
  photos: string[]
  gentile?: string
  elevation?: number
  maire?: string
  wikipediaUrl?: string
  historique?: string
  loading: boolean
}

/** Descripteur de l'entité affichée dans le panneau de fiche */
export type FicheRef =
  | { kind: 'region'; code: string }
  | { kind: 'dep'; code: string }
  | { kind: 'commune'; commune: ApiCommune }
  | { kind: 'lieu'; badge: string; titre: string; sous: string; rows: [string, string][] }

/** Résultat de recherche unifié */
export interface SearchResult {
  key: string
  label: string
  sub: string
  badge: string
  color: string
  go: () => void
}

// ---- Données éditoriales curées (pas d'API libre structurée) ----

export interface RegionEditorial {
  nom: string
  capitale: string
  pop: number
  pib: string
  pibHab: number
  sup: number
  deps: string[]
  climat: string
  economie: string
  universites: string
  parcs: string
  tourisme: string
  traditions: string
  histoire: string
}

export interface DepFiche {
  sousPrefs: string[]
  nbCommunes: number
  sup: number
  pointCulminant: string
  fleuves: string
  histoire: string
  economie: string
  agriculture: string
  tourisme: string
  gastronomie: string
  specialites: string
  monuments: string
}

export interface MetricData {
  pop: number
  pibHab: number
  chom: number
  revMed: number
  temp: number
  pluie: number
  foret: number
  agri: number
  eolien: number
  solaire: number
  nucleaire: number
}

export type MetricKey =
  | 'pop'
  | 'dens'
  | 'pibHab'
  | 'chom'
  | 'revMed'
  | 'temp'
  | 'pluie'
  | 'foret'
  | 'agri'
  | 'eolien'
  | 'solaire'
  | 'nucleaire'

export interface Fleuve {
  nom: string
  longueur: string
  pts: [number, number][]
}
/** [nom, lat, lng, altitude, massif] */
export type Sommet = [string, number, number, number, string]
/** [nom, lat, lng, statut] */
export type Parc = [string, number, number, string]
/** [nom, lat, lng, caractéristiques] */
export type Lac = [string, number, number, string]
/** [nom, lat, lng, population] */
export type Ville = [string, number, number, number]
/** [nom, type, lat, lng, description] */
export type Poi = [string, string, number, number, string]

export interface LegendStop {
  color: string
  label: string
}
export interface Legend {
  title: string
  stops: LegendStop[]
}
