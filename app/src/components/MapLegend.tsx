import { useState } from 'react'
import type { LayerState } from '../types'

// Légende des symboles de la carte. Les couleurs/formes reprennent exactement
// ce qui est dessiné dans MapView (voir buildOverlays / drawDepLayer).

function Swatch({ children }: { children: React.ReactNode }) {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" style={{ flex: 'none' }} aria-hidden="true">
      {children}
    </svg>
  )
}

interface Item {
  key: string
  icon: React.ReactNode
  label: string
  desc: string
  active: boolean
}

interface Props {
  layers: LayerState
  depSelected: boolean
}

export default function MapLegend({ layers, depSelected }: Props) {
  const [open, setOpen] = useState(false)

  const items: Item[] = [
    {
      key: 'region',
      icon: (
        <Swatch>
          <rect x="1" y="2" width="20" height="12" rx="2" fill="#dfe8ef" stroke="#7d97ab" strokeWidth="1.2" />
        </Swatch>
      ),
      label: 'Régions',
      desc: 'Surfaces bleutées — cliquez pour zoomer et voir les départements.',
      active: true,
    },
    {
      key: 'dep',
      icon: (
        <Swatch>
          <rect x="1" y="2" width="9" height="12" rx="1.5" fill="#ffffff" stroke="#5c7d99" strokeWidth="1" />
          <rect x="12" y="2" width="9" height="12" rx="1.5" fill="#f3d9b0" stroke="#5c7d99" strokeWidth="1" />
        </Swatch>
      ),
      label: 'Départements',
      desc: 'Contours blancs ; le département sélectionné apparaît en ocre.',
      active: true,
    },
    {
      key: 'villes',
      icon: (
        <Swatch>
          <circle cx="6" cy="8" r="2.5" fill="#2f5d8a" fillOpacity="0.25" stroke="#2f5d8a" strokeWidth="1.5" />
          <circle cx="15" cy="8" r="5" fill="#2f5d8a" fillOpacity="0.25" stroke="#2f5d8a" strokeWidth="1.5" />
        </Swatch>
      ),
      label: 'Grandes villes',
      desc: 'Ronds bleus dont la taille est proportionnelle à la population.',
      active: layers.villes,
    },
    {
      key: 'communes',
      icon: (
        <Swatch>
          <circle cx="11" cy="8" r="4" fill="#4e7a5a" fillOpacity="0.3" stroke="#4e7a5a" strokeWidth="1.4" />
        </Swatch>
      ),
      label: 'Communes',
      desc: "Ronds verts — les villes d'un département, affichées après sélection.",
      active: layers.communes && depSelected,
    },
    {
      key: 'prefs',
      icon: (
        <Swatch>
          <circle cx="11" cy="8" r="3.5" fill="#ffffff" stroke="#6b4a2e" strokeWidth="1.5" />
        </Swatch>
      ),
      label: 'Préfectures',
      desc: 'Points cerclés de brun — chefs-lieux de département.',
      active: layers.prefs,
    },
    {
      key: 'sommets',
      icon: (
        <Swatch>
          <path d="M11 3 L16 13 L6 13 Z" fill="#6b4a2e" />
        </Swatch>
      ),
      label: 'Sommets & massifs',
      desc: 'Triangles bruns — points culminants (altitude au clic).',
      active: layers.sommets,
    },
    {
      key: 'fleuves',
      icon: (
        <Swatch>
          <path d="M1 11 C6 11, 6 5, 11 5 S16 11, 21 5" fill="none" stroke="#4f86b8" strokeWidth="2.5" strokeLinecap="round" />
        </Swatch>
      ),
      label: 'Fleuves & rivières',
      desc: 'Traits bleus — tracés simplifiés des grands cours d\'eau.',
      active: layers.fleuves,
    },
    {
      key: 'lacs',
      icon: (
        <Swatch>
          <circle cx="11" cy="8" r="4" fill="#3b7ea1" fillOpacity="0.4" stroke="#3b7ea1" strokeWidth="1.5" />
        </Swatch>
      ),
      label: 'Lacs',
      desc: 'Ronds turquoise — principaux lacs et retenues.',
      active: layers.lacs,
    },
    {
      key: 'parcs',
      icon: (
        <Swatch>
          <circle cx="11" cy="8" r="5" fill="#4e7a5a" fillOpacity="0.3" stroke="#4e7a5a" strokeWidth="1.5" />
        </Swatch>
      ),
      label: 'Parcs naturels',
      desc: 'Ronds verts plus larges — parcs nationaux et régionaux.',
      active: layers.parcs,
    },
  ]

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Afficher la légende des symboles"
        style={{
          position: 'absolute',
          left: 14,
          bottom: 26,
          zIndex: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          height: 34,
          padding: '0 12px',
          background: 'rgba(253,253,252,0.95)',
          border: '1px solid rgba(0,0,0,0.14)',
          borderRadius: 8,
          boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 12.5,
          fontWeight: 600,
          color: '#22262a',
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: '1.5px solid #2f5d8a',
            color: '#2f5d8a',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          i
        </span>
        Légende
      </button>
    )
  }

  return (
    <div
      className="gf-scroll"
      style={{
        position: 'absolute',
        left: 14,
        bottom: 26,
        zIndex: 600,
        width: 'min(280px, calc(100% - 28px))',
        maxHeight: 'min(70%, 460px)',
        overflowY: 'auto',
        background: 'rgba(253,253,252,0.97)',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
        padding: '12px 14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700 }}>Symboles de la carte</div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Masquer la légende"
          title="Masquer"
          style={{
            marginLeft: 'auto',
            width: 24,
            height: 24,
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 6,
            background: '#fff',
            cursor: 'pointer',
            fontSize: 12,
            color: 'rgba(34,38,42,0.7)',
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          fontSize: 11,
          color: 'rgba(34,38,42,0.6)',
          lineHeight: 1.45,
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: '1px solid rgba(0,0,0,0.07)',
        }}
      >
        Navigation : France → région → département → commune. Activez ou masquez les repères dans le
        panneau de gauche (☰ en mobile).
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {items.map((it) => (
          <div key={it.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, opacity: it.active ? 1 : 0.45 }}>
            <div style={{ marginTop: 1 }}>{it.icon}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                {it.label}
                {!it.active && (
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: 'rgba(34,38,42,0.5)',
                      background: 'rgba(0,0,0,0.06)',
                      padding: '1px 5px',
                      borderRadius: 4,
                    }}
                  >
                    masqué
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(34,38,42,0.6)', lineHeight: 1.4 }}>{it.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
