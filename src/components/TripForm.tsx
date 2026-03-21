import { useState } from 'react'
import { useTrip } from '@/context/TripContext'
import { INTERESTS, DEFAULT_FORM, TRAVEL_MODES } from '@/utils/constants'
import { inrFull, inrShort } from '@/utils/helpers'
import type { TripFormData } from '@/types'

export function TripForm() {
  const { generate, isGenerating } = useTrip()
  const [form, setForm] = useState<TripFormData>(DEFAULT_FORM)

  function update<K extends keyof TripFormData>(k: K, v: TripFormData[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function toggleInterest(val: string) {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(val)
        ? f.interests.filter(i => i !== val)
        : [...f.interests, val],
    }))
  }

  async function handleGenerate() {
    if (!form.origin.trim()) { alert('Enter your starting location'); return }
    if (!form.destination.trim()) { alert('Enter your destination'); return }
    await generate(form)
  }

  return (
    <aside style={{
      width: 360, minWidth: 300, flexShrink: 0,
      borderRight: '1px solid var(--border)',
      background: 'var(--bg1)',
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - 64px)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, marginBottom: 2 }} className="gradient-text">
          ✈️ Plan Your Journey
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>Enter route, budget & preferences</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Route card */}
        <div style={{ background: 'var(--bg3)', border: '1.5px solid rgba(99,102,241,0.25)', borderRadius: 16, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', letterSpacing: 0.9, textTransform: 'uppercase', marginBottom: 12 }}>📍 Your Route</div>

          <div style={{ marginBottom: 10 }}>
            <label className="label">From — Starting Point</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🟢</span>
              <input
                className="jm-input"
                style={{ paddingLeft: 36 }}
                value={form.origin}
                onChange={e => update('origin', e.target.value)}
                placeholder="e.g. Chennai, India"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '6px 0', gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(99,102,241,0.2)' }} />
            <div style={{ fontSize: 16, color: '#818cf8' }}>↓</div>
            <div style={{ flex: 1, height: 1, background: 'rgba(99,102,241,0.2)' }} />
          </div>

          <div>
            <label className="label">To — Destination</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔴</span>
              <input
                className="jm-input"
                style={{ paddingLeft: 36 }}
                value={form.destination}
                onChange={e => update('destination', e.target.value)}
                placeholder="e.g. Mumbai, India"
              />
            </div>
          </div>
        </div>

        {/* Travel Mode */}
        <div>
          <label className="label">Travel Mode</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            {TRAVEL_MODES.map(m => (
              <button
                key={m.value}
                onClick={() => update('travelMode', m.value as TripFormData['travelMode'])}
                style={{
                  padding: '9px 4px', borderRadius: 10,
                  border: `1.5px solid ${form.travelMode === m.value ? '#6366f1' : 'var(--border)'}`,
                  background: form.travelMode === m.value ? 'rgba(99,102,241,0.15)' : 'var(--bg3)',
                  color: form.travelMode === m.value ? '#a5b4fc' : 'var(--text3)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Outfit',sans-serif",
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 18 }}>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date & Duration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="label">Start Date</label>
            <input className="jm-input" type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} />
          </div>
          <div>
            <label className="label">Duration</label>
            <select className="jm-input" value={form.duration} onChange={e => update('duration', Number(e.target.value))}>
              {[1,2,3,5,7,10,14].map(d => <option key={d} value={d}>{d} Day{d>1?'s':''}</option>)}
            </select>
          </div>
        </div>

        {/* Travellers & Style */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="label">Travellers</label>
            <select className="jm-input" value={form.travellers} onChange={e => update('travellers', e.target.value as TripFormData['travellers'])}>
              <option value="solo">🧍 Solo</option>
              <option value="couple">👫 Couple</option>
              <option value="family">👨‍👩‍👧 Family</option>
              <option value="group">👥 Group</option>
            </select>
          </div>
          <div>
            <label className="label">Style</label>
            <select className="jm-input" value={form.style} onChange={e => update('style', e.target.value as TripFormData['style'])}>
              <option value="backpacker">🎒 Budget</option>
              <option value="mid-range">⭐ Mid-range</option>
              <option value="luxury">💎 Luxury</option>
              <option value="business">💼 Business</option>
            </select>
          </div>
        </div>

        {/* Budget slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label className="label" style={{ marginBottom: 0 }}>Budget (₹ INR)</label>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fbbf24' }}>{inrFull(form.budget)}</span>
          </div>
          <input type="range" min={5000} max={500000} step={5000} value={form.budget} onChange={e => update('budget', Number(e.target.value))} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{inrShort(5000)}</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>≈ ${Math.round(form.budget/84).toLocaleString()} USD</span>
            <span style={{ fontSize: 10, color: 'var(--text3)' }}>{inrShort(500000)}</span>
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="label">Interests</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {INTERESTS.map(item => (
              <span
                key={item.value}
                onClick={() => toggleInterest(item.value)}
                className={`tag-chip${form.interests.includes(item.value) ? ' active' : ''}`}
              >{item.label}</span>
            ))}
          </div>
        </div>

        {/* Accommodation */}
        <div>
          <label className="label">Accommodation</label>
          <select className="jm-input" value={form.accommodation} onChange={e => update('accommodation', e.target.value as TripFormData['accommodation'])}>
            <option value="hotel">🏨 Hotel</option>
            <option value="airbnb">🏠 Airbnb / Apartment</option>
            <option value="hostel">🛏️ Hostel / Dormitory</option>
            <option value="ryokan">🏯 Boutique / Heritage Stay</option>
            <option value="resort">🌴 Resort</option>
          </select>
        </div>

        {/* Special requests */}
        <div>
          <label className="label">Special Requests</label>
          <textarea
            className="jm-input"
            style={{ height: 70, resize: 'none', lineHeight: 1.5 }}
            value={form.specialRequests}
            onChange={e => update('specialRequests', e.target.value)}
            placeholder="Vegetarian food, wheelchair access, avoid crowds..."
          />
        </div>
      </div>

      {/* Generate button */}
      <div style={{ padding: '12px 18px 16px' }}>
        <button onClick={handleGenerate} disabled={isGenerating} className="btn-primary" style={{ width: '100%', padding: '13px', fontSize: 15, borderRadius: 14 }}>
          {isGenerating
            ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2.5 }} />Planning your trip...</>
            : <><span>✨</span>Generate AI Itinerary</>
          }
        </button>
      </div>
    </aside>
  )
}
