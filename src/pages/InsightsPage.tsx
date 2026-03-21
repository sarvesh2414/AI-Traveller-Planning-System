import { useTrip } from '@/context/TripContext'
import { inrFull } from '@/utils/helpers'

export function InsightsPage() {
  const { savedTrips, currentTrip } = useTrip()
  const totalBudget = savedTrips.reduce((a, t) => a + t.budget.total, 0) + (currentTrip?.budget.total || 0)
  const totalDays = savedTrips.reduce((a, t) => a + t.days.length, 0) + (currentTrip?.days.length || 0)

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }} className="gradient-text">🧠 AI Travel Insights</div>
        <div style={{ color: 'var(--text3)', fontSize: 13 }}>Personalised recommendations for Indian travellers</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { l: 'Trips Planned', v: savedTrips.length + (currentTrip ? 1 : 0), c: '#818cf8' },
            { l: 'Days Planned', v: totalDays, c: '#fbbf24' },
            { l: 'Total Budget', v: inrFull(totalBudget), c: '#34d399' },
          ].map(s => (
            <div key={s.l} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.c, marginBottom: 4, fontFamily: "'Outfit',sans-serif" }}>{s.v}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.7 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <InsightCard icon="🌏" color="rgba(99,102,241,0.15)" title="Your Travel Persona" sub="Based on your trip history">
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
            You're a <strong style={{ color: '#818cf8' }}>Cultural Explorer</strong> — you prioritise authentic local experiences, street food, and photography. You prefer mid-range stays and active itineraries with local flavour.
          </p>
        </InsightCard>

        {currentTrip && (
          <InsightCard icon="💡" color="rgba(245,158,11,0.15)" title="Destination Match" sub={currentTrip.destination}>
            {[['Cultural richness', 97, 'linear-gradient(90deg,#818cf8,#6366f1)'], ['Food scene', 99, 'linear-gradient(90deg,#fbbf24,#f59e0b)'], ['Photography', 95, 'linear-gradient(90deg,#34d399,#10b981)'], ['Value for money', 82, 'linear-gradient(90deg,#a78bfa,#8b5cf6)']].map(([l, p, c]) => (
              <div key={String(l)} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text3)' }}>{String(l)}</span>
                  <span style={{ color: 'var(--text1)', fontWeight: 700 }}>{String(p)}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: String(p) + '%', background: String(c) }} /></div>
              </div>
            ))}
          </InsightCard>
        )}

        <InsightCard icon="💰" color="rgba(16,185,129,0.12)" title="INR Money Tips" sub="Save smart on your journey">
          {['Carry ₹2,000–₹5,000 cash for markets, autos, and street food', 'Use UPI (PhonePe / GPay) — accepted almost everywhere in India', 'Avoid airport currency exchange — use ATMs for better rates', 'Negotiate auto/taxi fares before boarding or insist on meter', 'Budget ₹200–₹400 per meal at local dhabas, ₹600–₹1,200 at restaurants'].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text2)', padding: '4px 0', lineHeight: 1.5 }}>
              <span style={{ color: '#34d399', flexShrink: 0 }}>→</span>{tip}
            </div>
          ))}
        </InsightCard>

        <InsightCard icon="📅" color="rgba(6,182,212,0.1)" title="Best Time to Visit" sub="Seasonal travel guide">
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
            October–March is ideal for most Indian destinations. Avoid monsoon (June–September) for coastal areas. Hill stations are best April–June. Book train tickets 60–90 days in advance on IRCTC.
          </p>
        </InsightCard>

        <InsightCard icon="🔮" color="rgba(139,92,246,0.1)" title="AI Hidden Gems" sub="Off-the-beaten-path picks">
          {['Visit local bazaars at dawn — vendors set up before tourists arrive', 'Take a cooking class on Day 2 to understand local ingredients', 'Download: IRCTC, Ola, Zomato, Google Pay, MakeMyTrip before you go', 'Railway retiring rooms are clean and cheap (₹500–₹1,200/night)', 'Ask your hotel for locals-only street food recommendations'].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text2)', padding: '4px 0', lineHeight: 1.5 }}>
              <span style={{ color: '#a78bfa', flexShrink: 0 }}>→</span>{tip}
            </div>
          ))}
        </InsightCard>
      </div>
    </div>
  )
}

function InsightCard({ icon, color, title, sub, children }: { icon: string; color: string; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 18 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{sub}</div>
        </div>
      </div>
      {children}
    </div>
  )
}
