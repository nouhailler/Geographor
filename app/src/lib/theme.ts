// Échelle choroplèthe pour les cartes thématiques.
// Interpolation rgb(232,238,244) → rgb(24,74,118), exposant 0.6 (accentue les valeurs hautes).
import { METRIC_DATA, METRIC_SUP, METRIC_LABELS } from '../data/editorial'
import type { Legend, MetricKey } from '../types'

const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t)

export function metricValue(code: string, metric: MetricKey): number {
  const m = METRIC_DATA[code]
  if (!m) return 0
  if (metric === 'dens') return m.pop / METRIC_SUP[code]
  return m[metric]
}

export interface ThemeScale {
  colorForCode: (code: string) => string
  legend: Legend
}

export function buildThemeScale(metric: MetricKey): ThemeScale {
  const codes = Object.keys(METRIC_DATA)
  const vals: Record<string, number> = {}
  codes.forEach((c) => (vals[c] = metricValue(c, metric)))
  const arr = Object.values(vals)
  const min = Math.min(...arr)
  const max = Math.max(...arr)

  const colorForValue = (v: number): string => {
    const t = max === min ? 0.5 : Math.pow((v - min) / (max - min), 0.6)
    return `rgb(${lerp(232, 24, t)},${lerp(238, 74, t)},${lerp(244, 118, t)})`
  }

  const fmtV = (v: number): string => {
    if (metric === 'pop') return (v / 1e6).toFixed(1).replace('.', ',') + ' M'
    if (metric === 'revMed') return Math.round(v).toLocaleString('fr-FR') + ' €'
    if (metric === 'dens') return Math.round(v).toLocaleString('fr-FR')
    return (Math.round(v * 10) / 10).toLocaleString('fr-FR')
  }

  const stops = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const v = min + (max - min) * t
    return { color: colorForValue(v), label: fmtV(v) }
  })

  return {
    colorForCode: (code) => colorForValue(vals[code] ?? min),
    legend: { title: METRIC_LABELS[metric], stops },
  }
}
