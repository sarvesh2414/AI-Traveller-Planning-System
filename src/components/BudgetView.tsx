// BudgetView
import { useTrip } from '@/context/TripContext'
import { percentOf, inrFull } from '@/utils/helpers'

const CATS = [
  { key: 'accommodation', label: 'Accommodation', icon: '🏨', color: '#818cf8' },
  { key: 'food', label: 'Food & Dining', icon: '🍜', color: '#fbbf24' },
  { key: 'activities', label: 'Activities', icon: '🎟️', color: '#34d399' },
  { key: 'transport', label: 'Transport', icon: '🚇', color: '#f87171' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️', color: '#a78bfa' },
] as const

export function BudgetView() {
  const { currentTrip } = useTrip()
  if (!currentTrip) return null
  const b = currentTrip.budget

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp 0.4s ease' }}>
      <div className="section-label">💰 Budget Breakdown (₹ INR)</div>

      <div className="card-glow" style={{ textAlign: 'center', padding: '20px 16px' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Total Estimated Cost</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: '#34d399', fontFamily: "'Outfit',sans-serif" }}>{inrFull(b.total)}</div>
        <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>≈ ${Math.round(b.total / 84).toLocaleString()} USD · 1 USD = ₹84</div>
      </div>

      {CATS.map(c => {
        const amt = b[c.key as keyof typeof b] as number
        const pct = percentOf(amt, b.total)
        return (
          <div key={c.key} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{c.icon} {c.label}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: c.color }}>{inrFull(amt)}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>≈ ${Math.round(amt / 84).toLocaleString()}</div>
              </div>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: pct + '%', background: c.color }} /></div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{pct}% of total</div>
          </div>
        )
      })}

      <div className="card">
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>Per Day Estimates</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { label: 'Per Day', value: inrFull(Math.round(b.total / currentTrip.days.length)), color: '#818cf8' },
            { label: 'Per Meal', value: inrFull(Math.round(b.food / (currentTrip.days.length * 3))), color: '#fbbf24' },
            { label: 'Per Night', value: inrFull(Math.round(b.accommodation / currentTrip.days.length)), color: '#34d399' },
          ].map(x => (
            <div key={x.label} style={{ background: 'var(--bg0)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: x.color }}>{x.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.6 }}>{x.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
