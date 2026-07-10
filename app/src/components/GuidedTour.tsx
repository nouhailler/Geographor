// Visite guidée « spotlight » : met en surbrillance chaque zone réelle de
// l'interface (recherche, onglets, panneau, carte, aide) et affiche une bulle
// explicative avec les commandes Précédent / Suivant / Passer. Les cibles sont
// désignées par un sélecteur CSS ; si l'élément est absent ou masqué (mobile),
// l'étape bascule automatiquement en bulle centrée sans surbrillance.

import { useEffect, useLayoutEffect, useState } from 'react'

interface Step {
  selector?: string
  title: string
  body: string
  pad?: number
}

const STEPS: Step[] = [
  {
    title: 'Bienvenue 👋',
    body: 'En quelques écrans, voici où cliquer pour explorer la France. Utilisez « Suivant » ou les flèches ← →.',
  },
  {
    selector: '[data-tour="search"]',
    title: 'Rechercher',
    body: 'Tapez une commune, un département, un monument ou un fleuve, puis choisissez un résultat pour y aller directement.',
  },
  {
    selector: '[data-tour="tabs"]',
    title: 'Trois vues',
    body: 'Carte pour naviguer, Thématiques pour colorer les régions selon une donnée (population, chômage…), Physique pour le relief, les fleuves et les parcs.',
  },
  {
    selector: '.gf-side',
    title: 'Panneau des calques',
    body: 'Cochez les repères à afficher (préfectures, grandes villes, communes) et choisissez le fond de carte : plan, topographique ou satellite.',
    pad: 4,
  },
  {
    selector: '[data-tour="map"]',
    title: 'La carte',
    body: 'Cliquez une région pour zoomer et voir ses départements, puis un département pour ouvrir sa fiche. Les marqueurs (villes, sommets, monuments…) ouvrent leur propre fiche.',
    pad: 0,
  },
  {
    selector: '[data-tour="help"]',
    title: 'Aide & démo',
    body: 'Ce bouton rouvre à tout moment ce menu : relancer la visite, lancer la démo automatique ou consulter l’aide détaillée. Bonne exploration !',
  },
]

const TW = 336

export default function GuidedTour({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const step = STEPS[i]
  const last = i === STEPS.length - 1

  // Mesure (et re-mesure) la cible de l'étape courante.
  useLayoutEffect(() => {
    const measure = () => {
      if (!step.selector) return setRect(null)
      const el = document.querySelector(step.selector) as HTMLElement | null
      const r = el?.getBoundingClientRect()
      setRect(r && r.width > 0 && r.height > 0 ? r : null)
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    const id = window.setInterval(measure, 400) // suit les éventuels reflows (chargement carte)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
      window.clearInterval(id)
    }
  }, [i, step.selector])

  // Navigation clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') last ? onClose() : setI((n) => n + 1)
      else if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1))
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [last, onClose])

  const pad = step.pad ?? 8

  // Position de la bulle : sous la cible si la place le permet, sinon au-dessus ; centrée sans cible.
  let tip: React.CSSProperties
  if (rect) {
    const placeBelow = window.innerHeight - rect.bottom > 210
    const left = Math.max(12, Math.min(rect.left + rect.width / 2 - TW / 2, window.innerWidth - TW - 12))
    tip = placeBelow
      ? { top: rect.bottom + pad + 14, left, width: TW }
      : { bottom: window.innerHeight - rect.top + pad + 14, left, width: TW }
  } else {
    tip = { top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: TW }
  }

  return (
    <>
      {/* Capteur plein écran : neutralise les clics sur l'UI pendant la visite */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 2998 }} onClick={(e) => e.stopPropagation()} />

      {/* Surbrillance de la cible (le box-shadow assombrit tout le reste) */}
      {rect ? (
        <div
          style={{
            position: 'fixed',
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            borderRadius: 10,
            boxShadow: '0 0 0 9999px rgba(16,20,24,0.55)',
            border: '2px solid #2f5d8a',
            pointerEvents: 'none',
            transition: 'top 0.25s ease, left 0.25s ease, width 0.25s ease, height 0.25s ease',
            zIndex: 3000,
          }}
        />
      ) : (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(16,20,24,0.55)', zIndex: 2999 }}
        />
      )}

      {/* Bulle explicative */}
      <div
        style={{
          position: 'fixed',
          ...tip,
          maxWidth: '92vw',
          background: '#fdfdfc',
          borderRadius: 12,
          boxShadow: '0 18px 48px rgba(0,0,0,0.30)',
          padding: 16,
          zIndex: 3001,
          animation: 'gfFadeIn 0.18s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700 }}>{step.title}</div>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(34,38,42,0.5)', fontWeight: 600 }}>
            {i + 1} / {STEPS.length}
          </div>
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.55, color: 'rgba(34,38,42,0.82)' }}>{step.body}</div>

        {/* Points de progression */}
        <div style={{ display: 'flex', gap: 5, margin: '12px 0 12px' }}>
          {STEPS.map((_, n) => (
            <div
              key={n}
              onClick={() => setI(n)}
              style={{
                width: n === i ? 18 : 7,
                height: 7,
                borderRadius: 4,
                cursor: 'pointer',
                background: n === i ? '#2f5d8a' : 'rgba(47,93,138,0.25)',
                transition: 'width 0.2s ease',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              color: 'rgba(34,38,42,0.55)',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Passer
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {i > 0 && (
              <button
                onClick={() => setI((n) => Math.max(0, n - 1))}
                style={{
                  height: 34,
                  padding: '0 14px',
                  border: '1px solid rgba(0,0,0,0.14)',
                  borderRadius: 8,
                  background: '#fff',
                  color: '#22262a',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                Précédent
              </button>
            )}
            <button
              onClick={() => (last ? onClose() : setI((n) => n + 1))}
              style={{
                height: 34,
                padding: '0 18px',
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
              {last ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
