import type { ApiCommune, LayerKey } from '../types'

/** API de navigation exposée par App et consommée par la carte, la sidebar, la recherche. */
export interface NavActions {
  selectRegion: (code: string) => void
  selectDep: (code: string) => void
  openCommune: (c: ApiCommune) => void
  openLieu: (
    badge: string,
    titre: string,
    sous: string,
    latlng: [number, number] | null,
    zoom: number | null,
    rows: [string, string][],
  ) => void
  ensureLayer: (key: LayerKey) => void
  resetFrance: () => void
}
