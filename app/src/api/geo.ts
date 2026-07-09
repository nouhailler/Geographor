// Accès aux données administratives réelles via geo.api.gouv.fr (gratuit, sans clé).
import type { ApiRegion, ApiDepartement, ApiCommune } from '../types'

const BASE = 'https://geo.api.gouv.fr'

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`geo.api.gouv.fr ${res.status} — ${url}`)
  return res.json() as Promise<T>
}

// --- Caches en mémoire (les listes changent rarement) ---
let regionsCache: ApiRegion[] | null = null
let depsCache: ApiDepartement[] | null = null
const communesByDep = new Map<string, ApiCommune[]>()

export async function fetchRegions(): Promise<ApiRegion[]> {
  if (!regionsCache) regionsCache = await getJSON<ApiRegion[]>(`${BASE}/regions?fields=nom,code`)
  return regionsCache
}

export async function fetchDepartements(): Promise<ApiDepartement[]> {
  if (!depsCache) depsCache = await getJSON<ApiDepartement[]>(`${BASE}/departements?fields=nom,code,codeRegion`)
  return depsCache
}

const COMMUNE_FIELDS = 'nom,code,codesPostaux,population,surface,centre,codeDepartement,codeRegion'

/** Communes d'un département (chargées à la demande lors de la sélection). */
export async function fetchCommunesOfDep(codeDep: string): Promise<ApiCommune[]> {
  const cached = communesByDep.get(codeDep)
  if (cached) return cached
  const list = await getJSON<ApiCommune[]>(
    `${BASE}/departements/${codeDep}/communes?fields=${COMMUNE_FIELDS}&format=json&geometry=centre`,
  )
  const clean = list.filter((c) => c.centre?.coordinates)
  communesByDep.set(codeDep, clean)
  return clean
}

/** Recherche de communes par nom (fuzzy, pondérée par population). */
export async function searchCommunes(q: string, limit = 6): Promise<ApiCommune[]> {
  const url = `${BASE}/communes?nom=${encodeURIComponent(q)}&fields=${COMMUNE_FIELDS}&boost=population&limit=${limit}&geometry=centre`
  try {
    return await getJSON<ApiCommune[]>(url)
  } catch {
    return []
  }
}

/** Une commune par code INSEE (utilisé au besoin). */
export async function fetchCommune(code: string): Promise<ApiCommune | null> {
  try {
    return await getJSON<ApiCommune>(`${BASE}/communes/${code}?fields=${COMMUNE_FIELDS}&geometry=centre`)
  } catch {
    return null
  }
}

// --- Helpers dérivés ---

/** Coordonnées [lat, lng] depuis le centre GeoJSON [lng, lat]. */
export function communeLatLng(c: ApiCommune): [number, number] | null {
  const co = c.centre?.coordinates
  return co ? [co[1], co[0]] : null
}

/** Superficie en km² (l'API renvoie des hectares). */
export function surfaceKm2(surfaceHa?: number): number | null {
  return typeof surfaceHa === 'number' ? surfaceHa / 100 : null
}

/** Agrège les stats réelles d'un département à partir de ses communes. */
export function aggregateDep(communes: ApiCommune[]): {
  population: number
  nbCommunes: number
  supKm2: number
} {
  let population = 0
  let supHa = 0
  for (const c of communes) {
    population += c.population ?? 0
    supHa += c.surface ?? 0
  }
  return { population, nbCommunes: communes.length, supKm2: Math.round(supHa / 100) }
}
