import type { Legend as LegendType } from '../types'

export default function Legend({ legend }: { legend: LegendType }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 14,
        bottom: 26,
        zIndex: 600,
        background: 'rgba(253,253,252,0.95)',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 10,
        padding: '12px 14px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
        maxWidth: 230,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{legend.title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {legend.stops.map((st, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 16,
                height: 12,
                borderRadius: 3,
                flex: 'none',
                background: st.color,
                border: '1px solid rgba(0,0,0,0.10)',
              }}
            />
            <div style={{ fontSize: 11, color: 'rgba(34,38,42,0.7)' }}>{st.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
