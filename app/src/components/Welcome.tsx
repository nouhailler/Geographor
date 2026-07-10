// Écran d'accueil (« hub » d'onboarding) affiché à la première visite et
// rouvrable via le bouton « ? ». Propose trois entrées : une visite guidée en
// surbrillance, un mode démo automatique, ou explorer librement. Un lien mène à
// l'aide détaillée (HelpModal).

interface Choice {
  icon: string
  title: string
  desc: string
  onPick: () => void
  primary?: boolean
}

interface Props {
  onStartTour: () => void
  onStartDemo: () => void
  onExplore: () => void
  onOpenHelp: () => void
  onClose: () => void
}

export default function Welcome(p: Props) {
  const choices: Choice[] = [
    {
      icon: '🎬',
      title: 'Lancer la démo',
      desc: 'L’atlas se pilote tout seul : régions, départements, fiches, thématiques… Regardez et laissez-vous guider.',
      onPick: p.onStartDemo,
      primary: true,
    },
    {
      icon: '🧭',
      title: 'Visite guidée',
      desc: 'Un tour pas-à-pas qui met en surbrillance chaque zone de l’écran et explique à quoi elle sert.',
      onPick: p.onStartTour,
    },
    {
      icon: '🗺️',
      title: 'Explorer par moi-même',
      desc: 'Fermer et commencer directement. L’aide reste accessible via le bouton « ? ».',
      onPick: p.onExplore,
    },
  ]

  return (
    <div
      onClick={p.onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,22,24,0.46)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'gfFadeIn 0.15s ease',
        padding: 12,
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="gf-scroll"
        style={{
          width: 'min(540px, 96vw)',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#fdfdfc',
          borderRadius: 14,
          boxShadow: '0 24px 64px rgba(0,0,0,0.30)',
        }}
      >
        <div
          style={{
            padding: '26px 26px 18px',
            borderBottom: '1px solid rgba(0,0,0,0.07)',
            background: 'linear-gradient(180deg, rgba(47,93,138,0.07), rgba(47,93,138,0))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#2f5d8a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: 0.5,
                flex: 'none',
              }}
            >
              FR
            </div>
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1.15 }}>
                Bienvenue dans l’Atlas de France
              </div>
              <div style={{ fontSize: 12.5, color: 'rgba(34,38,42,0.6)', marginTop: 2 }}>
                Régions, départements, communes, relief et données — le tout sur une carte interactive.
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, color: 'rgba(34,38,42,0.6)', marginBottom: 2 }}>
            Comment souhaitez-vous découvrir l’application&nbsp;?
          </div>

          {choices.map((c) => (
            <button
              key={c.title}
              onClick={c.onPick}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 13,
                textAlign: 'left',
                padding: '13px 15px',
                borderRadius: 10,
                border: `1px solid ${c.primary ? '#2f5d8a' : 'rgba(0,0,0,0.12)'}`,
                background: c.primary ? 'rgba(47,93,138,0.06)' : '#fff',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2f5d8a'
                e.currentTarget.style.background = 'rgba(47,93,138,0.06)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = c.primary ? '#2f5d8a' : 'rgba(0,0,0,0.12)'
                e.currentTarget.style.background = c.primary ? 'rgba(47,93,138,0.06)' : '#fff'
              }}
            >
              <div style={{ fontSize: 24, flex: 'none', lineHeight: '28px' }} aria-hidden="true">
                {c.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: c.primary ? '#2f5d8a' : '#22262a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {c.title}
                  {c.primary && (
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        color: '#fff',
                        background: '#2f5d8a',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      Recommandé
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(34,38,42,0.68)', lineHeight: 1.5, marginTop: 3 }}>
                  {c.desc}
                </div>
              </div>
            </button>
          ))}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              borderTop: '1px solid rgba(0,0,0,0.07)',
              paddingTop: 12,
              marginTop: 2,
            }}
          >
            <button
              onClick={p.onOpenHelp}
              style={{
                border: 'none',
                background: 'none',
                color: '#2f5d8a',
                fontFamily: 'inherit',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              📄 Voir l’aide détaillée
            </button>
            <span style={{ fontSize: 10.5, color: 'rgba(34,38,42,0.4)' }}>
              Réouvrable via « ? » en haut à droite
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
