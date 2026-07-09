import { useEffect, useRef } from 'react'
import type { SearchResult, TabId } from '../types'

const TAB_DEFS: [TabId, string][] = [
  ['carte', 'Carte'],
  ['theme', 'Thématiques'],
  ['phys', 'Physique'],
]

interface Props {
  tab: TabId
  searchQ: string
  searchResults: SearchResult[]
  searchOpen: boolean
  onSearchChange: (v: string) => void
  onSearchFocus: () => void
  onSearchClose: () => void
  onTab: (t: TabId) => void
  onBurger: () => void
  onReset: () => void
  onOpenSettings: () => void
  onOpenHelp: () => void
}

export default function Header(p: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)

  // Ferme le dropdown au clic extérieur
  useEffect(() => {
    if (!p.searchOpen) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) p.onSearchClose()
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [p.searchOpen, p])

  const tabStyle = (on: boolean): React.CSSProperties => ({
    height: 34,
    padding: '0 14px',
    borderRadius: 7,
    border: `1px solid ${on ? '#2f5d8a' : 'rgba(0,0,0,0.12)'}`,
    background: on ? '#2f5d8a' : '#fff',
    color: on ? '#fff' : '#22262a',
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
  })

  return (
    <header
      className="gf-header"
      style={{
        height: 58,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 16px',
        background: '#fdfdfc',
        borderBottom: '1px solid rgba(0,0,0,0.10)',
        position: 'relative',
        zIndex: 1100,
      }}
    >
      <button
        className="gf-burger"
        onClick={p.onBurger}
        title="Afficher les calques"
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          border: '1px solid rgba(0,0,0,0.14)',
          borderRadius: 7,
          background: '#fff',
          cursor: 'pointer',
          fontSize: 16,
          flex: 'none',
        }}
      >
        ☰
      </button>

      <div
        onClick={p.onReset}
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flex: 'none' }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 7,
            background: '#2f5d8a',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: 0.5,
          }}
        >
          FR
        </div>
        <div className="gf-brandtext">
          <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>Géographie de France</div>
          <div
            className="gf-brandsub"
            style={{
              fontSize: 10.5,
              color: 'rgba(34,38,42,0.55)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Atlas interactif
          </div>
        </div>
      </div>

      {/* Recherche */}
      <div ref={wrapRef} className="gf-search" style={{ flex: 1, maxWidth: 520, position: 'relative' }}>
        <input
          value={p.searchQ}
          onChange={(e) => p.onSearchChange(e.target.value)}
          onFocus={p.onSearchFocus}
          placeholder="Rechercher : commune, département, monument, fleuve…"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            height: 38,
            padding: '0 14px 0 36px',
            border: '1px solid rgba(0,0,0,0.14)',
            borderRadius: 8,
            background: '#f5f4f0',
            fontSize: 13,
            color: '#22262a',
            outline: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(34,38,42,0.45)',
            fontSize: 14,
            pointerEvents: 'none',
          }}
        >
          ⌕
        </div>

        {p.searchOpen && (
          <div
            style={{
              position: 'absolute',
              top: 44,
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 10,
              boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
              overflow: 'hidden',
              animation: 'gfFadeIn 0.15s ease',
              zIndex: 1200,
            }}
          >
            {p.searchResults.map((r) => (
              <div
                key={r.key}
                onClick={r.go}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(47,93,138,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  style={{
                    flex: 'none',
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#fff',
                    background: r.color,
                    padding: '3px 7px',
                    borderRadius: 4,
                    minWidth: 64,
                    textAlign: 'center',
                  }}
                >
                  {r.badge}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'rgba(34,38,42,0.55)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {r.sub}
                  </div>
                </div>
              </div>
            ))}
            {p.searchResults.length === 0 && (
              <div style={{ padding: 14, fontSize: 12.5, color: 'rgba(34,38,42,0.55)' }}>
                Aucun résultat pour « {p.searchQ} »
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="gf-tabs" style={{ display: 'flex', gap: 6, marginLeft: 'auto', flex: 'none' }}>
        {TAB_DEFS.map(([id, label]) => (
          <button key={id} onClick={() => p.onTab(id)} style={tabStyle(p.tab === id)}>
            {label}
          </button>
        ))}
      </nav>

      <button
        onClick={p.onOpenHelp}
        title="Aide — comment ça marche"
        aria-label="Aide"
        className="gf-help"
        style={{
          flex: 'none',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0,0,0,0.14)',
          borderRadius: 8,
          background: '#fff',
          cursor: 'pointer',
          fontSize: 16,
          fontWeight: 700,
          color: '#2f5d8a',
        }}
      >
        ?
      </button>

      <button
        onClick={p.onOpenSettings}
        title="Paramètres IA"
        className="gf-gear"
        style={{
          flex: 'none',
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(0,0,0,0.14)',
          borderRadius: 8,
          background: '#fff',
          cursor: 'pointer',
          fontSize: 16,
          color: '#22262a',
        }}
      >
        ⚙
      </button>
    </header>
  )
}
