import {
  METRIC_LABELS,
  SOMMETS,
  FLEUVES,
  RIVIERES,
  LACS,
  PARCS,
  CASCADES,
  FORETS,
  ZONES_HUMIDES,
  LITTORAL,
} from '../data/editorial'
import { fmt } from '../lib/format'
import type { BaseMap, LayerKey, LayerState, MetricKey, TabId } from '../types'
import type { NavActions } from '../state/actions'

export interface Crumb {
  label: string
  active: boolean
  go: () => void
}

interface Props {
  tab: TabId
  display: 'flex' | 'none'
  layers: LayerState
  onToggleLayer: (k: LayerKey) => void
  base: BaseMap
  onSetBase: (b: BaseMap) => void
  metric: MetricKey
  onSetMetric: (m: MetricKey) => void
  crumbs: Crumb[]
  hint: string
  actions: NavActions
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'rgba(34,38,42,0.5)',
  marginBottom: 8,
}
const ROW: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  padding: '6px 8px',
  borderRadius: 6,
  cursor: 'pointer',
}
const hoverBg = {
  onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) =>
    (e.currentTarget.style.background = 'rgba(47,93,138,0.06)'),
  onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => (e.currentTarget.style.background = 'transparent'),
}

const ADMIN_LAYERS: [LayerKey, string][] = [
  ['prefs', 'Préfectures'],
  ['villes', 'Grandes villes'],
  ['communes', 'Communes (du département)'],
]
const NATURE_LAYERS: [LayerKey, string][] = [
  ['fleuves', 'Fleuves'],
  ['sommets', 'Sommets & massifs'],
  ['parcs', 'Parcs naturels'],
  ['lacs', 'Lacs'],
]
const BASES: [BaseMap, string][] = [
  ['plan', 'Plan (clair)'],
  ['topo', 'Topographique'],
  ['sat', 'Satellite'],
]

function Checkbox({ on }: { on: boolean }) {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        flex: 'none',
        borderRadius: 4,
        border: `1.5px solid ${on ? '#2f5d8a' : 'rgba(0,0,0,0.25)'}`,
        background: on ? '#2f5d8a' : '#fff',
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {on ? '✓' : ''}
    </div>
  )
}

function Radio({ on }: { on: boolean }) {
  return (
    <div
      style={{
        width: 14,
        height: 14,
        flex: 'none',
        borderRadius: '50%',
        border: `1.5px solid ${on ? '#2f5d8a' : 'rgba(0,0,0,0.25)'}`,
        background: on ? 'radial-gradient(circle, #2f5d8a 0 4px, #fff 4.5px)' : '#fff',
      }}
    />
  )
}

export default function Sidebar(p: Props) {
  return (
    <aside
      className="gf-side gf-scroll"
      style={{
        width: 252,
        flex: 'none',
        background: '#fdfdfc',
        borderRight: '1px solid rgba(0,0,0,0.10)',
        overflowY: 'auto',
        padding: 14,
        boxSizing: 'border-box',
        display: p.display,
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {p.tab === 'carte' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={SECTION_LABEL}>Navigation</div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 4,
                fontSize: 12.5,
              }}
            >
              {p.crumbs.map((c, i) => (
                <span
                  key={i}
                  onClick={c.go}
                  style={{
                    cursor: 'pointer',
                    fontWeight: c.active ? 700 : 500,
                    color: c.active ? '#22262a' : '#2f5d8a',
                  }}
                >
                  {i > 0 ? '› ' : ''}
                  {c.label}
                </span>
              ))}
            </div>
            <div
              style={{ fontSize: 11.5, color: 'rgba(34,38,42,0.55)', marginTop: 8, lineHeight: 1.45 }}
            >
              {p.hint}
            </div>
          </div>

          <div>
            <div style={SECTION_LABEL}>Repères</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ADMIN_LAYERS.map(([k, label]) => (
                <div key={k} onClick={() => p.onToggleLayer(k)} style={ROW} {...hoverBg}>
                  <Checkbox on={p.layers[k]} />
                  <div style={{ fontSize: 13 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={SECTION_LABEL}>Géographie physique</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {NATURE_LAYERS.map(([k, label]) => (
                <div key={k} onClick={() => p.onToggleLayer(k)} style={ROW} {...hoverBg}>
                  <Checkbox on={p.layers[k]} />
                  <div style={{ fontSize: 13 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={SECTION_LABEL}>Fond de carte</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {BASES.map(([k, label]) => (
                <div key={k} onClick={() => p.onSetBase(k)} style={ROW} {...hoverBg}>
                  <Radio on={p.base === k} />
                  <div style={{ fontSize: 13 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              fontSize: 11,
              color: 'rgba(34,38,42,0.45)',
              lineHeight: 1.5,
              borderTop: '1px solid rgba(0,0,0,0.07)',
              paddingTop: 10,
            }}
          >
            Communes : sélectionnez un département pour afficher ses villes (chargées en direct depuis
            geo.api.gouv.fr).
          </div>
        </div>
      )}

      {p.tab === 'theme' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={SECTION_LABEL}>Cartes thématiques</div>
            <div style={{ fontSize: 11.5, color: 'rgba(34,38,42,0.55)', lineHeight: 1.45 }}>
              Choroplèthe par région. Cliquez sur une région pour ses valeurs.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(Object.keys(METRIC_LABELS) as MetricKey[]).map((k) => {
              const on = p.metric === k
              return (
                <div
                  key={k}
                  onClick={() => p.onSetMetric(k)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12.5,
                    fontWeight: on ? 700 : 500,
                    background: on ? 'rgba(47,93,138,0.10)' : 'transparent',
                    color: on ? '#2f5d8a' : '#22262a',
                  }}
                >
                  {METRIC_LABELS[k]}
                </div>
              )
            })}
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: 'rgba(34,38,42,0.45)',
              lineHeight: 1.5,
              borderTop: '1px solid rgba(0,0,0,0.07)',
              paddingTop: 10,
            }}
          >
            Données d'exemple — ordres de grandeur INSEE / RTE 2021-2023, arrondis.
          </div>
        </div>
      )}

      {p.tab === 'phys' && <PhysSections actions={p.actions} layers={p.layers} onToggle={p.onToggleLayer} />}
    </aside>
  )
}

function PhysSections({
  actions,
  layers,
  onToggle,
}: {
  actions: NavActions
  layers: LayerState
  onToggle: (k: LayerKey) => void
}) {
  const ensure = (k: LayerKey) => {
    if (!layers[k]) onToggle(k)
  }
  const itemStyle: React.CSSProperties = { padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }
  const staticItem: React.CSSProperties = { padding: '6px 8px', borderRadius: 6 }

  const shortParc = (n: string) =>
    n
      .replace('Parc national ', 'PN ')
      .replace('PNR des ', 'PNR ')
      .replace('PNR du ', 'PNR ')
      .replace('PNR de ', 'PNR ')

  const sections: {
    title: string
    items: { label: string; sub: string; go?: () => void }[]
  }[] = [
    {
      title: 'Massifs & relief',
      items: SOMMETS.slice(0, 8).map((x) => ({
        label: x[0],
        sub: x[4] + ' · ' + fmt(x[3]) + ' m',
        go: () => {
          ensure('sommets')
          actions.openLieu('Sommet', x[0], x[4], [x[1], x[2]], 11, [
            ['Altitude', fmt(x[3]) + ' m'],
            ['Massif', x[4]],
          ])
        },
      })),
    },
    {
      title: 'Fleuves',
      items: FLEUVES.map((fl) => ({
        label: fl.nom,
        sub: fl.longueur,
        go: () => {
          ensure('fleuves')
          actions.openLieu('Fleuve', fl.nom, fl.longueur, fl.pts[Math.floor(fl.pts.length / 2)], 7, [
            ['Longueur', fl.longueur],
          ])
        },
      })),
    },
    {
      title: 'Rivières',
      items: RIVIERES.slice(0, 5).map((r) => ({ label: r.split(' (')[0], sub: '(' + r.split(' (')[1] })),
    },
    {
      title: 'Lacs',
      items: LACS.map((lc) => ({
        label: lc[0],
        sub: lc[3],
        go: () => {
          ensure('lacs')
          actions.openLieu('Lac', lc[0], lc[3], [lc[1], lc[2]], 10, [['Caractéristiques', lc[3]]])
        },
      })),
    },
    {
      title: 'Parcs naturels',
      items: PARCS.slice(0, 8).map((pk) => ({
        label: shortParc(pk[0]),
        sub: pk[3],
        go: () => {
          ensure('parcs')
          actions.openLieu('Parc naturel', pk[0], pk[3], [pk[1], pk[2]], 9, [['Statut', pk[3]]])
        },
      })),
    },
    {
      title: 'Cascades',
      items: CASCADES.map((c) => ({ label: c.split(' (')[0], sub: c.includes('(') ? '(' + c.split(' (')[1] : '' })),
    },
    {
      title: 'Forêts',
      items: FORETS.slice(0, 4).map((c) => ({ label: c.split(' (')[0], sub: c.includes('(') ? '(' + c.split(' (')[1] : '' })),
    },
    {
      title: 'Zones humides',
      items: ZONES_HUMIDES.map((c) => ({ label: c, sub: '' })),
    },
    {
      title: 'Littoral',
      items: [{ label: '5 853 km de côtes', sub: LITTORAL }],
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {sections.map((s) => (
        <div key={s.title}>
          <div style={SECTION_LABEL}>{s.title}</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {s.items.map((it, i) => (
              <div key={i} onClick={it.go} style={it.go ? itemStyle : staticItem} {...(it.go ? hoverBg : {})}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{it.label}</div>
                {it.sub && (
                  <div style={{ fontSize: 11, color: 'rgba(34,38,42,0.55)', lineHeight: 1.4 }}>
                    {it.sub}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
