import type { FicheModel } from '../lib/fiche'

export interface AiState {
  canUse: boolean
  status: 'idle' | 'loading' | 'done' | 'error'
  text?: string
  error?: string
}

interface Props {
  model: FicheModel
  ai: AiState
  onSummarize: () => void
  onOpenSettings: () => void
  onClose: () => void
  onViewSat: () => void
  onViewTopo: () => void
}

function hideOnError(e: React.SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = 'none'
}

const HATCH = 'repeating-linear-gradient(45deg,#f2f1ec,#f2f1ec 8px,#eae9e2 8px,#eae9e2 16px)'

function Placeholder({ label, height }: { label: string; height: number }) {
  return (
    <div
      style={{
        height,
        border: '1px dashed rgba(0,0,0,0.2)',
        borderRadius: 8,
        background: HATCH,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'ui-monospace,Menlo,monospace',
        fontSize: 10.5,
        color: 'rgba(34,38,42,0.55)',
        textAlign: 'center',
        padding: 4,
        boxSizing: 'border-box',
      }}
    >
      {label}
    </div>
  )
}

export default function Fiche({
  model,
  ai,
  onSummarize,
  onOpenSettings,
  onClose,
  onViewSat,
  onViewTopo,
}: Props) {
  const c = model.commune
  return (
    <aside
      className="gf-fiche gf-scroll"
      style={{
        width: 392,
        flex: 'none',
        background: '#fdfdfc',
        borderLeft: '1px solid rgba(0,0,0,0.10)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        animation: 'gfSlideIn 0.22s ease',
      }}
    >
      <div
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#fff',
            background: model.badgeColor,
            padding: '3px 8px',
            borderRadius: 4,
          }}
        >
          {model.badge}
        </div>
        {model.code && (
          <div
            style={{
              fontSize: 11,
              color: 'rgba(34,38,42,0.5)',
              fontFamily: 'ui-monospace,Menlo,monospace',
            }}
          >
            {model.code}
          </div>
        )}
        <button
          onClick={onClose}
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 18px 24px', boxSizing: 'border-box' }}>
        <h2 style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>
          {model.titre}
        </h2>
        <div style={{ fontSize: 12.5, color: 'rgba(34,38,42,0.55)', marginBottom: 14 }}>{model.sous}</div>

        {c && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {c.blason ? (
                <div
                  style={{
                    height: 84,
                    border: '1px solid rgba(0,0,0,0.10)',
                    borderRadius: 8,
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 6,
                    boxSizing: 'border-box',
                  }}
                >
                  <img
                    src={c.blason}
                    alt="Blason"
                    onError={hideOnError}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <Placeholder label={c.mediaLoading ? 'blason…' : 'blason\n(non trouvé)'} height={84} />
              )}
              {c.drapeau ? (
                <div
                  style={{
                    height: 84,
                    border: '1px solid rgba(0,0,0,0.10)',
                    borderRadius: 8,
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 6,
                    boxSizing: 'border-box',
                  }}
                >
                  <img
                    src={c.drapeau}
                    alt="Drapeau / logo"
                    onError={hideOnError}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <Placeholder label={'drapeau / logo\n(non existant)'} height={84} />
              )}
            </div>

            {c.photos.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: c.photos.length > 1 ? '1fr 1fr' : '1fr', gap: 8 }}>
                {c.photos.map((url, i) => (
                  <div
                    key={i}
                    style={{ height: 110, border: '1px solid rgba(0,0,0,0.10)', borderRadius: 8, overflow: 'hidden' }}
                  >
                    <img
                      src={url}
                      alt="Photo"
                      onError={hideOnError}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Placeholder
                label={c.mediaLoading ? 'photos…' : 'photos de la commune\n(non trouvées)'}
                height={110}
              />
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={onViewSat} style={ficheBtn}>
                Vue satellite
              </button>
              <button onClick={onViewTopo} style={ficheBtn}>
                Carte topographique
              </button>
            </div>
            {c.hasSite && c.siteUrl && (
              <a href={c.siteUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, fontWeight: 600 }}>
                {c.siteLabel} ↗
              </a>
            )}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          {model.rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 14,
                padding: '7px 0',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ fontSize: 12, color: 'rgba(34,38,42,0.55)', flex: 'none' }}>{r[0]}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, textAlign: 'right' }}>{r[1]}</div>
            </div>
          ))}
        </div>

        {model.depChips && model.depChips.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(34,38,42,0.5)',
                marginBottom: 8,
              }}
            >
              Départements
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {model.depChips.map((d, i) => (
                <div
                  key={i}
                  onClick={d.go}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: '5px 10px',
                    border: '1px solid rgba(0,0,0,0.12)',
                    borderRadius: 100,
                    cursor: 'pointer',
                    background: '#fff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2f5d8a'
                    e.currentTarget.style.color = '#2f5d8a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'
                    e.currentTarget.style.color = '#22262a'
                  }}
                >
                  {d.label}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {model.texts.map((t, i) => (
            <div key={i}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#2f5d8a',
                  marginBottom: 4,
                }}
              >
                {t[0]}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12.5,
                  lineHeight: 1.55,
                  color: 'rgba(34,38,42,0.85)',
                }}
              >
                {t[1]}
              </p>
            </div>
          ))}
        </div>

        <AiSummary ai={ai} onSummarize={onSummarize} onOpenSettings={onOpenSettings} />

        <div
          style={{
            marginTop: 20,
            paddingTop: 12,
            borderTop: '1px solid rgba(0,0,0,0.07)',
            fontSize: 10.5,
            color: 'rgba(34,38,42,0.45)',
            lineHeight: 1.5,
          }}
        >
          Données administratives : geo.api.gouv.fr · Médias : Wikidata/Commons · Texte : Wikipédia.
          Contenus éditoriaux région/département : curés.
        </div>
      </div>
    </aside>
  )
}

function AiSummary({
  ai,
  onSummarize,
  onOpenSettings,
}: {
  ai: AiState
  onSummarize: () => void
  onOpenSettings: () => void
}) {
  return (
    <div
      style={{
        marginTop: 18,
        padding: 14,
        borderRadius: 10,
        border: '1px solid rgba(47,93,138,0.20)',
        background: 'rgba(47,93,138,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: ai.status === 'done' ? 8 : 0 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#2f5d8a',
          }}
        >
          ✦ Synthèse IA
        </div>
        <button
          onClick={ai.status === 'loading' ? undefined : onSummarize}
          disabled={ai.status === 'loading'}
          style={{
            marginLeft: 'auto',
            height: 28,
            padding: '0 12px',
            border: 'none',
            borderRadius: 7,
            background: ai.status === 'loading' ? 'rgba(47,93,138,0.5)' : '#2f5d8a',
            color: '#fff',
            cursor: ai.status === 'loading' ? 'default' : 'pointer',
            fontSize: 11.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {ai.status === 'loading' && (
            <span
              style={{
                width: 12,
                height: 12,
                border: '2px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'gfSpin 0.8s linear infinite',
              }}
            />
          )}
          {ai.status === 'loading'
            ? 'Génération…'
            : ai.status === 'done'
              ? 'Régénérer'
              : 'Générer'}
        </button>
      </div>

      {ai.status === 'done' && ai.text && (
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: 'rgba(34,38,42,0.9)' }}>{ai.text}</p>
      )}

      {ai.status === 'error' && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#a44', lineHeight: 1.5 }}>
          {ai.error}
          {!ai.canUse && (
            <>
              {' '}
              <a
                onClick={onOpenSettings}
                style={{ cursor: 'pointer', color: '#2f5d8a', fontWeight: 600 }}
              >
                Ouvrir les paramètres →
              </a>
            </>
          )}
        </div>
      )}

      {ai.status === 'idle' && (
        <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(34,38,42,0.5)', lineHeight: 1.5 }}>
          {ai.canUse
            ? 'Génère un résumé de cette fiche avec le modèle OpenRouter sélectionné.'
            : 'Configurez une clé OpenRouter et un modèle (⚙) pour activer la synthèse.'}
        </div>
      )}
    </div>
  )
}

const ficheBtn: React.CSSProperties = {
  flex: 1,
  minWidth: 110,
  height: 34,
  border: '1px solid rgba(0,0,0,0.14)',
  borderRadius: 7,
  background: '#fff',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 600,
  color: '#22262a',
}
