import { useTrip } from '@/context/TripContext'

const SECTIONS = [
  { key: 'mustPack', title: '🎒 Must Pack', color: '#818cf8' },
  { key: 'localTips', title: '💡 Local Tips', color: '#fbbf24' },
  { key: 'warnings', title: '⚠️ Heads Up', color: '#f87171' },
  { key: 'transport', title: '🚇 Getting Around', color: '#34d399' },
] as const

export function EssentialsView() {
  const { currentTrip } = useTrip()
  if (!currentTrip) return null
  const ess = currentTrip.essentials

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp 0.4s ease' }}>
      <div className="section-label">🎒 Trip Essentials</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {SECTIONS.map(s => (
          <div key={s.key} className="card">
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: s.color }}>{s.title}</div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {(ess[s.key] as string[]).map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                  <span style={{ color: s.color, flexShrink: 0, fontSize: 10, paddingTop: 2 }}>→</span>{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(244,63,94,0.08)', border: '1.5px solid rgba(244,63,94,0.2)', borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: '#fda4af' }}>🆘 Emergency Numbers (India)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[{ l: 'Police', n: '100' }, { l: 'Ambulance', n: '108' }, { l: 'Fire', n: '101' }, { l: 'Tourist Help', n: '1800-111-363' }].map(c => (
            <div key={c.l} style={{ background: 'var(--bg0)', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{c.l}</span>
              <a href={`tel:${c.n}`} style={{ fontSize: 13, fontWeight: 700, color: '#fda4af', textDecoration: 'none' }}>{c.n}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
