import { useState } from 'react'
import { useTrip } from '@/context/TripContext'
import { DAY_COLORS, ACTIVITY_COLORS, ACTIVITY_LABELS } from '@/utils/constants'

export function ItineraryView() {
  const { currentTrip } = useTrip()
  const [openDays, setOpenDays] = useState<Set<number>>(new Set([1]))
  if (!currentTrip) return null

  function toggle(n: number) {
    setOpenDays(s => { const ns = new Set(s); ns.has(n) ? ns.delete(n) : ns.add(n); return ns })
  }

  const { stats } = currentTrip
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeUp 0.4s ease' }}>
      {/* Route banner */}
      <div className="card-glow" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>🟢 {currentTrip.origin}</span>
          <span style={{ color: 'var(--text3)', fontSize: 14 }}>✈️</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f87171' }}>🔴 {currentTrip.destination}</span>
        </div>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700 }} className="gradient-text">
          {currentTrip.destination}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 3, fontStyle: 'italic' }}>{currentTrip.tagline}</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          { label: 'Attractions', value: stats.attractions, color: '#818cf8' },
          { label: 'Restaurants', value: stats.restaurants, color: '#fbbf24' },
          { label: 'Areas', value: stats.neighborhoods, color: '#34d399' },
          { label: 'Walking', value: stats.walkingKm + ' km', color: '#f87171' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-val" style={{ color: s.color, fontSize: 20 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="section-label">Day-by-Day Itinerary</div>

      {currentTrip.days.map((day, i) => {
        const col = DAY_COLORS[i % DAY_COLORS.length]
        const open = openDays.has(day.dayNum)
        return (
          <div key={day.dayNum} style={{ background: 'var(--bg2)', border: `1.5px solid ${open ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`, borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s' }}>
            <div onClick={() => toggle(day.dayNum)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: col.bg, color: col.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0, border: `1.5px solid ${col.text}44` }}>D{day.dayNum}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{day.title}</div>
                <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 2 }}>📍 {day.area} · {day.activities.length} activities</div>
              </div>
              <span style={{ color: 'var(--text3)', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: 12 }}>▼</span>
            </div>
            {open && (
              <div style={{ padding: '4px 16px 16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 14 }}>
                  {day.activities.map((act, ai) => {
                    const dc = ['#818cf8','#fbbf24','#34d399','#f87171','#a78bfa']
                    const ac = ACTIVITY_COLORS[act.type] || '#6366f1'
                    return (
                      <div key={ai} style={{ display: 'flex', gap: 12 }}>
                        <div style={{ fontSize: 11, color: 'var(--text3)', minWidth: 54, paddingTop: 2, fontWeight: 500 }}>{act.time}</div>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: dc[ai % dc.length], marginTop: 5, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{act.name}</div>
                          <div style={{ color: 'var(--text3)', fontSize: 12, lineHeight: 1.5 }}>{act.description}</div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: ac + '22', color: ac }}>{ACTIVITY_LABELS[act.type] || '📍 Visit'}</span>
                            {act.cost && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600, background: 'rgba(16,185,129,0.12)', color: '#34d399' }}>~₹{act.cost.toLocaleString('en-IN')}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
