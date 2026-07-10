// Mode démo : l'application se pilote automatiquement pour montrer ce qu'elle
// sait faire. Une bande de narration en bas de l'écran commente chaque étape ;
// l'utilisateur peut mettre en pause, avancer/reculer manuellement ou quitter.
// Les étapes appellent les vraies actions de navigation (mêmes que l'UI), donc
// la carte et les fiches réagissent réellement pendant la démonstration.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { BaseMap, LayerKey, MetricKey, TabId } from '../types'

export interface DemoControls {
  reset: () => void
  selectRegion: (code: string) => void
  selectDep: (code: string) => void
  ensureLayer: (k: LayerKey) => void
  setTab: (t: TabId) => void
  setMetric: (m: MetricKey) => void
  setBase: (b: BaseMap) => void
  openCommuneByName: (name: string) => void | Promise<void>
}

interface DemoStep {
  cap: string
  ms: number
  run: () => void
}

function buildSteps(c: DemoControls): DemoStep[] {
  return [
    {
      cap: 'Bienvenue ! Cet atlas couvre toute la France métropolitaine. On commence par une vue d’ensemble.',
      ms: 3400,
      run: () => {
        c.setTab('carte')
        c.setBase('plan')
        c.reset()
      },
    },
    {
      cap: 'Cliquer sur une région zoome dessus et révèle ses départements — ici l’Île-de-France.',
      ms: 3800,
      run: () => c.selectRegion('11'),
    },
    {
      cap: 'On choisit ensuite un département — Paris — pour ouvrir sa fiche détaillée.',
      ms: 3800,
      run: () => c.selectDep('75'),
    },
    {
      cap: 'Activons les grandes villes pour situer les principaux pôles urbains sur la carte.',
      ms: 3400,
      run: () => c.ensureLayer('villes'),
    },
    {
      cap: 'Chaque commune a sa fiche : population, blason, photos et résumé. Ouvrons celle de Paris.',
      ms: 4400,
      run: () => c.openCommuneByName('Paris'),
    },
    {
      cap: 'L’onglet « Thématiques » colore les régions selon une donnée — ici la population.',
      ms: 3800,
      run: () => {
        c.setTab('theme')
        c.setMetric('pop')
      },
    },
    {
      cap: 'On peut comparer d’autres indicateurs : chômage, revenu médian, forêt, énergies…',
      ms: 3600,
      run: () => c.setMetric('chom'),
    },
    {
      cap: 'L’onglet « Physique » cartographie le relief, les fleuves, les lacs et les parcs naturels.',
      ms: 3800,
      run: () => {
        c.setTab('phys')
        c.ensureLayer('fleuves')
        c.ensureLayer('sommets')
      },
    },
    {
      cap: 'Le fond de carte passe en satellite ou topographique à tout moment.',
      ms: 3600,
      run: () => c.setBase('sat'),
    },
    {
      cap: 'C’est terminé ! À vous d’explorer. Vous pourrez relancer cette démo via le bouton « ? ».',
      ms: 5000,
      run: () => {
        c.setBase('plan')
        c.setTab('carte')
        c.reset()
      },
    },
  ]
}

export default function DemoMode({ controls, onExit }: { controls: DemoControls; onExit: () => void }) {
  const steps = useMemo(() => buildSteps(controls), [controls])
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(true)
  const last = i === steps.length - 1
  const runRef = useRef(steps[i].run)
  runRef.current = steps[i].run

  // Exécute l'action de l'étape à chaque changement d'étape.
  useEffect(() => {
    runRef.current()
  }, [i])

  // Avance automatique tant que la démo est en lecture.
  useEffect(() => {
    if (!playing || last) return
    const t = window.setTimeout(() => setI((n) => n + 1), steps[i].ms)
    return () => window.clearTimeout(t)
  }, [i, playing, last, steps])

  // Contrôles clavier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit()
      else if (e.key === 'ArrowRight') setI((n) => Math.min(steps.length - 1, n + 1))
      else if (e.key === 'ArrowLeft') setI((n) => Math.max(0, n - 1))
      else if (e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [steps.length, onExit])

  const step = steps[i]

  const ctrlBtn: React.CSSProperties = {
    width: 34,
    height: 34,
    flex: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'max(18px, env(safe-area-inset-bottom))',
        transform: 'translateX(-50%)',
        width: 'min(620px, calc(100vw - 24px))',
        background: 'rgba(23,28,33,0.95)',
        color: '#fff',
        borderRadius: 14,
        boxShadow: '0 18px 48px rgba(0,0,0,0.4)',
        zIndex: 2600,
        overflow: 'hidden',
        animation: 'gfFadeIn 0.2s ease',
        backdropFilter: 'blur(2px)',
      }}
    >
      {/* Barre de progression de l'étape courante */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.12)' }}>
        <div
          key={i + (playing ? '-play' : '-pause')}
          style={{
            height: '100%',
            background: '#5b9bd8',
            width: playing ? '100%' : '0%',
            animation: playing ? `gfDemoBar ${step.ms}ms linear forwards` : 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
        <div
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#fff',
            background: '#2f5d8a',
            padding: '4px 8px',
            borderRadius: 5,
            flex: 'none',
          }}
        >
          Démo {i + 1}/{steps.length}
        </div>

        <div style={{ fontSize: 13, lineHeight: 1.45, flex: 1, minWidth: 0 }}>{step.cap}</div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 14px 12px',
        }}
      >
        <button
          style={ctrlBtn}
          onClick={() => setI((n) => Math.max(0, n - 1))}
          disabled={i === 0}
          title="Étape précédente"
          aria-label="Étape précédente"
        >
          ⏮
        </button>
        <button
          style={{ ...ctrlBtn, background: '#2f5d8a', borderColor: '#2f5d8a' }}
          onClick={() => (last ? onExit() : setPlaying((p) => !p))}
          title={last ? 'Terminer' : playing ? 'Pause' : 'Lecture'}
          aria-label={last ? 'Terminer' : playing ? 'Pause' : 'Lecture'}
        >
          {last ? '✓' : playing ? '⏸' : '▶'}
        </button>
        <button
          style={ctrlBtn}
          onClick={() => setI((n) => Math.min(steps.length - 1, n + 1))}
          disabled={last}
          title="Étape suivante"
          aria-label="Étape suivante"
        >
          ⏭
        </button>

        <button
          onClick={onExit}
          style={{
            marginLeft: 'auto',
            height: 34,
            padding: '0 14px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          Quitter la démo
        </button>
      </div>
    </div>
  )
}
