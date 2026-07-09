export const fmt = (n: number): string => n.toLocaleString('fr-FR')

const COMBINING = /[̀-ͯ]/g
export const normalize = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(COMBINING, '')

/** Couleurs de badge par type d'entité (design tokens du handoff). */
export const BADGE_COLORS = {
  region: '#2f5d8a',
  dep: '#6b4a2e',
  commune: '#4e7a5a',
  water: '#3b7ea1',
  poi: '#8a6a2f',
  lieu: '#555c63',
} as const
