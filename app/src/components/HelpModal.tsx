// Aide contextuelle « Comment ça marche » : explique où cliquer pour afficher
// ou masquer les informations, changer de vue, etc. Ouvert automatiquement à la
// première visite, rouvrable via le bouton « ? » de l'en-tête.

interface Section {
  icon: string
  title: string
  lines: (string | { b: string; t: string })[]
}

const SECTIONS: Section[] = [
  {
    icon: '🗺️',
    title: 'Explorer la carte',
    lines: [
      { b: 'Cliquez une région', t: '→ la carte zoome et affiche ses départements.' },
      { b: 'Cliquez un département', t: '→ sa fiche s’ouvre et ses communes apparaissent.' },
      { b: 'Cliquez un marqueur', t: '(ville, sommet, monument…) → sa fiche détaillée.' },
      { b: 'Revenir à la France', t: '→ le logo « FR » ou « France » dans le fil d’Ariane.' },
    ],
  },
  {
    icon: '🧭',
    title: 'Les trois onglets (en haut)',
    lines: [
      { b: 'Carte', t: 'navigation + repères à afficher.' },
      { b: 'Thématiques', t: 'colore les régions selon une donnée (population, chômage…).' },
      { b: 'Physique', t: 'relief, fleuves, lacs, parcs (cliquez un élément de la liste).' },
      'Sur mobile : retaper l’onglet actif — ou taper la carte — referme le panneau.',
    ],
  },
  {
    icon: '☑️',
    title: 'Afficher / masquer des éléments',
    lines: [
      {
        b: 'Panneau de gauche',
        t: '(bouton ☰ en mobile) : cochez/décochez les Repères (préfectures, grandes villes, communes) et la Géographie physique (fleuves, sommets, parcs, lacs).',
      },
      { b: 'Fond de carte', t: 'Plan / Topographique / Satellite se change au même endroit.' },
    ],
  },
  {
    icon: '🔎',
    title: 'Rechercher',
    lines: [
      'Tapez une commune, un département, un monument, un fleuve… puis cliquez un résultat pour y aller.',
    ],
  },
  {
    icon: '📄',
    title: 'Fiches & aide',
    lines: [
      { b: 'Fermer une fiche', t: 'bouton ✕ (ou touche Échap) → retour à la carte.' },
      { b: 'Légende', t: 'bouton « ⓘ Légende » en bas à gauche : signification des symboles.' },
      { b: 'Synthèse IA', t: 'chaque fiche peut générer un résumé (configurez la clé via ⚙).' },
    ],
  },
]

interface HelpProps {
  onClose: () => void
  onStartTour: () => void
  onStartDemo: () => void
}

export default function HelpModal({ onClose, onStartTour, onStartDemo }: HelpProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,22,24,0.42)',
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
          width: 'min(520px, 96vw)',
          maxHeight: '88vh',
          overflowY: 'auto',
          background: '#fdfdfc',
          borderRadius: 12,
          boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 18px',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            background: '#fdfdfc',
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>Comment ça marche&nbsp;?</div>
          <button
            onClick={onClose}
            className="gf-modal-close"
            aria-label="Fermer"
            title="Fermer"
            style={{
              marginLeft: 'auto',
              width: 28,
              height: 28,
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 6,
              background: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              color: 'rgba(34,38,42,0.7)',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 12.5, color: 'rgba(34,38,42,0.65)', lineHeight: 1.5 }}>
            Un atlas interactif de la France. Voici où cliquer pour faire apparaître ou masquer les
            informations.
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onStartDemo}
              style={{
                flex: 1,
                height: 40,
                border: 'none',
                borderRadius: 8,
                background: '#2f5d8a',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              🎬 Lancer la démo
            </button>
            <button
              onClick={onStartTour}
              style={{
                flex: 1,
                height: 40,
                border: '1px solid #2f5d8a',
                borderRadius: 8,
                background: '#fff',
                color: '#2f5d8a',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              🧭 Visite guidée
            </button>
          </div>

          {SECTIONS.map((s) => (
            <div key={s.title} style={{ display: 'flex', gap: 12 }}>
              <div style={{ fontSize: 20, flex: 'none', lineHeight: '22px' }} aria-hidden="true">
                {s.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{s.title}</div>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {s.lines.map((l, i) => (
                    <li key={i} style={{ fontSize: 12.5, lineHeight: 1.5, color: 'rgba(34,38,42,0.82)' }}>
                      {typeof l === 'string' ? (
                        l
                      ) : (
                        <>
                          <strong style={{ color: '#2f5d8a' }}>{l.b}</strong> {l.t}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 2 }}>
            <button
              onClick={onClose}
              style={{
                height: 38,
                padding: '0 20px',
                border: 'none',
                borderRadius: 8,
                background: '#2f5d8a',
                color: '#fff',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              J’ai compris
            </button>
          </div>

          <div
            style={{
              fontSize: 10.5,
              color: 'rgba(34,38,42,0.4)',
              lineHeight: 1.5,
              borderTop: '1px solid rgba(0,0,0,0.07)',
              paddingTop: 10,
            }}
          >
            Vous pourrez rouvrir cette aide à tout moment via le bouton « ? » de l’en-tête.
          </div>
        </div>
      </div>
    </div>
  )
}
