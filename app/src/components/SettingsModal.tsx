import { useEffect, useState } from 'react'
import type { OpenRouterModel } from '../state/useSettings'

interface Props {
  apiKey: string
  selectedModel: string
  freeModels: OpenRouterModel[]
  modelsLoading: boolean
  modelsError: string | null
  onLoadModels: () => void
  onSave: (key: string, model: string) => void
  onClose: () => void
}

export default function SettingsModal(p: Props) {
  const [keyDraft, setKeyDraft] = useState(p.apiKey)
  const [modelDraft, setModelDraft] = useState(p.selectedModel)

  useEffect(() => {
    if (!p.freeModels.length && !p.modelsLoading) p.onLoadModels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const status = p.freeModels.length ? `${p.freeModels.length} modèles gratuits` : ''

  return (
    <div
      onClick={p.onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,22,24,0.42)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'gfFadeIn 0.15s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="gf-scroll"
        style={{
          width: 'min(460px,92vw)',
          maxHeight: '86vh',
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
          <div style={{ fontSize: 15, fontWeight: 700 }}>Paramètres IA</div>
          <button
            onClick={p.onClose}
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

        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 12.5, color: 'rgba(34,38,42,0.65)', lineHeight: 1.5 }}>
            Connectez une clé{' '}
            <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">
              OpenRouter
            </a>{' '}
            pour activer de futures fonctions IA (résumés, complétion de fiches). La clé est stockée
            uniquement dans ce navigateur.
          </div>

          <div>
            <label style={labelStyle}>Clé API OpenRouter</label>
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="sk-or-v1-…"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                height: 38,
                padding: '0 12px',
                border: '1px solid rgba(0,0,0,0.16)',
                borderRadius: 8,
                background: '#fff',
                fontFamily: 'ui-monospace,Menlo,monospace',
                fontSize: 12.5,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              <label style={labelStyle}>Modèle</label>
              <div style={{ marginLeft: 'auto', fontSize: 10.5, color: 'rgba(34,38,42,0.45)' }}>{status}</div>
            </div>

            {p.modelsLoading && (
              <div style={{ fontSize: 12.5, color: 'rgba(34,38,42,0.5)', padding: '10px 0' }}>
                Chargement des modèles gratuits…
              </div>
            )}
            {p.modelsError && (
              <div style={{ fontSize: 12, color: '#a44', padding: '8px 0' }}>{p.modelsError}</div>
            )}
            {!p.modelsLoading && !p.modelsError && (
              <div
                className="gf-scroll"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  maxHeight: 260,
                  overflowY: 'auto',
                  border: '1px solid rgba(0,0,0,0.10)',
                  borderRadius: 8,
                  padding: 6,
                }}
              >
                {p.freeModels.map((m) => {
                  const on = modelDraft === m.id
                  return (
                    <div
                      key={m.id}
                      onClick={() => setModelDraft(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 9px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        background: on ? 'rgba(47,93,138,0.10)' : 'transparent',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={ellipsis(12.5, 600)}>{m.name || m.id}</div>
                        <div style={ellipsis(10.5, 400, 'rgba(34,38,42,0.5)')}>{m.id}</div>
                      </div>
                      <div
                        style={{
                          flex: 'none',
                          marginLeft: 'auto',
                          fontSize: 9.5,
                          fontWeight: 700,
                          color: '#3a7a4e',
                          background: 'rgba(58,122,78,0.12)',
                          padding: '3px 7px',
                          borderRadius: 4,
                        }}
                      >
                        GRATUIT
                      </div>
                    </div>
                  )
                })}
                {p.freeModels.length === 0 && (
                  <div style={{ fontSize: 12, color: 'rgba(34,38,42,0.5)', padding: 8 }}>
                    Aucun modèle gratuit trouvé.
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button onClick={p.onClose} style={btnSecondary}>
              Fermer
            </button>
            <button onClick={() => p.onSave(keyDraft, modelDraft)} style={btnPrimary}>
              Enregistrer
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
            Liste récupérée en direct depuis l'API OpenRouter, filtrée sur les modèles gratuits (id se
            terminant par « :free »).
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'rgba(34,38,42,0.5)',
  marginBottom: 6,
}
const ellipsis = (size: number, weight: number, color?: string): React.CSSProperties => ({
  fontSize: size,
  fontWeight: weight,
  color,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})
const btnSecondary: React.CSSProperties = {
  height: 36,
  padding: '0 16px',
  border: '1px solid rgba(0,0,0,0.14)',
  borderRadius: 8,
  background: '#fff',
  cursor: 'pointer',
  fontSize: 12.5,
  fontWeight: 600,
}
const btnPrimary: React.CSSProperties = {
  height: 36,
  padding: '0 16px',
  border: 'none',
  borderRadius: 8,
  background: '#2f5d8a',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 12.5,
  fontWeight: 600,
}
