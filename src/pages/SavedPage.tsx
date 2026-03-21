import { useTrip } from '@/context/TripContext'
import { inrFull } from '@/utils/helpers'

export function SavedPage() {
  const { savedTrips, loadTrip, deleteTrip, user } = useTrip()

  if (savedTrips.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 52 }}>📦</div>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700 }} className="gradient-text">No saved trips yet</div>
        <div style={{ color: 'var(--text3)', fontSize: 14, maxWidth: 360 }}>
          Generate a trip and click "Save" to store it here.
          {!user && ' Sign in to sync trips across devices.'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }} className="gradient-text">📦 Saved Trips</div>
        <div style={{ color: 'var(--text3)', fontSize: 13 }}>
          {savedTrips.length} trip{savedTrips.length !== 1 ? 's' : ''} saved
          {user ? ' · synced to cloud ☁️' : ' · stored locally (sign in to sync)'}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {savedTrips.map((trip, i) => (
          <div key={trip.id} className="card" style={{ display: 'flex', gap: 14, alignItems: 'center', animation: `fadeUp 0.3s ${i * 0.05}s ease both` }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>✈️</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>🟢 {trip.origin || '—'}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>→</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text1)' }}>{trip.destination}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span>📅 {trip.days.length} Days</span>
                <span>·</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>{inrFull(trip.budget.total)}</span>
                <span>·</span>
                <span>{new Date(trip.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => loadTrip(trip)} className="btn-primary" style={{ padding: '7px 16px', fontSize: 12 }}>Open ↗</button>
              <button onClick={() => { if (confirm('Delete this trip?')) deleteTrip(trip.id) }} className="btn-ghost" style={{ padding: '7px 10px', fontSize: 14 }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
