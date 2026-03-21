import { useState } from 'react'
import { useTrip } from '@/context/TripContext'
import { generateId } from '@/utils/helpers'
import type { JournalEntry } from '@/types'

const MOODS = ['😊 Happy', '😎 Excited', '😌 Relaxed', '😤 Tired', '🤩 Amazed', '😋 Well-fed', '🥵 Hot', '🌧️ Rainy day']

export function TripJournal() {
  const { currentTrip, journalEntries, upsertJournal } = useTrip()
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [editing, setEditing] = useState(false)
  const [mood, setMood] = useState(MOODS[0])
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState(4)
  const [highlight, setHighlight] = useState('')
  const [highlights, setHighlights] = useState<string[]>([])
  const [actDone, setActDone] = useState<Record<string, boolean>>({})

  if (!currentTrip) return null

  const day = currentTrip.days.find(d => d.dayNum === selectedDay)
  const entry = journalEntries.find(e => e.dayNum === selectedDay)

  function startEdit() {
    if (entry) {
      setMood(entry.mood)
      setNotes(entry.notes)
      setRating(entry.rating)
      setHighlights(entry.highlights || [])
      const done: Record<string, boolean> = {}
      entry.activities?.forEach(a => { done[a.name] = a.done })
      setActDone(done)
    } else {
      setMood(MOODS[0]); setNotes(''); setRating(4); setHighlights([])
      setActDone({})
    }
    setEditing(true)
  }

  function saveEntry() {
    if (!day) return
    const newEntry: JournalEntry = {
      id: entry?.id || generateId(),
      dayNum: selectedDay,
      date: new Date().toISOString().split('T')[0],
      mood, notes, rating, highlights,
      activities: day.activities.map(a => ({ name: a.name, done: actDone[a.name] || false })),
    }
    upsertJournal(newEntry)
    setEditing(false)
  }

  function addHighlight() {
    if (!highlight.trim()) return
    setHighlights(prev => [...prev, highlight.trim()])
    setHighlight('')
  }

  const completedDays = journalEntries.length
  const totalDays = currentTrip.days.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeUp 0.4s ease' }}>
      <div className="section-label">📔 Trip Journal</div>

      {/* Overall progress */}
      <div className="card-glow">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Journey Documentation</span>
          <span style={{ fontSize: 13, color: '#818cf8', fontWeight: 700 }}>{completedDays}/{totalDays} days logged</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${totalDays ? (completedDays / totalDays) * 100 : 0}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
        </div>
      </div>

      {/* Day selector */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {currentTrip.days.map(d => {
          const hasEntry = journalEntries.some(e => e.dayNum === d.dayNum)
          const isSelected = selectedDay === d.dayNum
          return (
            <button key={d.dayNum} onClick={() => { setSelectedDay(d.dayNum); setEditing(false) }} style={{
              padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
              border: `1.5px solid ${isSelected ? '#6366f1' : hasEntry ? 'rgba(16,185,129,0.4)' : 'var(--border2)'}`,
              background: isSelected ? 'rgba(99,102,241,0.2)' : hasEntry ? 'rgba(16,185,129,0.08)' : 'var(--bg3)',
              color: isSelected ? '#a5b4fc' : hasEntry ? '#34d399' : 'var(--text3)',
              fontSize: 13, fontWeight: 600, fontFamily: "'Outfit',sans-serif",
              display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s',
            }}>
              {hasEntry && !isSelected && <span>✅</span>}
              Day {d.dayNum}
            </button>
          )
        })}
      </div>

      {/* Day content */}
      {day && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700 }}>Day {day.dayNum}: {day.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>📍 {day.area}</div>
            </div>
            {!editing && (
              <button onClick={startEdit} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                {entry ? '✏️ Edit' : '+ Add Entry'}
              </button>
            )}
          </div>

          {/* View entry */}
          {entry && !editing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 22 }}>{entry.mood.split(' ')[0]}</span>
                <span style={{ fontSize: 14, color: 'var(--text2)' }}>{entry.mood}</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{ fontSize: 16, color: i < entry.rating ? '#fbbf24' : 'var(--border2)' }}>★</span>
                  ))}
                </div>
              </div>

              {entry.notes && (
                <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '12px 14px', fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, borderLeft: '3px solid #6366f1' }}>
                  {entry.notes}
                </div>
              )}

              {entry.highlights && entry.highlights.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 6 }}>✨ Highlights</div>
                  {entry.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text2)', padding: '3px 0' }}>
                      <span style={{ color: '#fbbf24' }}>→</span>{h}
                    </div>
                  ))}
                </div>
              )}

              {entry.activities && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Activities</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {entry.activities.map(a => (
                      <span key={a.name} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, background: a.done ? 'rgba(16,185,129,0.15)' : 'var(--bg3)', color: a.done ? '#34d399' : 'var(--text3)', border: `1px solid ${a.done ? 'rgba(16,185,129,0.3)' : 'var(--border)'}` }}>
                        {a.done ? '✅' : '⬜'} {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Edit form */}
          {editing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label">How was today?</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {MOODS.map(m => (
                    <span key={m} onClick={() => setMood(m)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `1.5px solid ${mood === m ? '#6366f1' : 'var(--border2)'}`, background: mood === m ? 'rgba(99,102,241,0.15)' : 'var(--bg3)', color: mood === m ? '#a5b4fc' : 'var(--text3)', userSelect: 'none', transition: 'all 0.15s' }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Day Rating</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} onClick={() => setRating(i + 1)} style={{ fontSize: 24, cursor: 'pointer', color: i < rating ? '#fbbf24' : 'var(--border2)', transition: 'color 0.15s' }}>★</span>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Notes & Memories</label>
                <textarea className="jm-input" style={{ height: 100, resize: 'none', lineHeight: 1.6 }} value={notes} onChange={e => setNotes(e.target.value)} placeholder="What happened today? Any funny moments, great food, or beautiful views?" />
              </div>

              <div>
                <label className="label">Highlights</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input className="jm-input" style={{ flex: 1 }} value={highlight} onChange={e => setHighlight(e.target.value)} placeholder="Best moment of the day..." onKeyDown={e => e.key === 'Enter' && addHighlight()} />
                  <button onClick={addHighlight} className="btn-secondary" style={{ padding: '9px 14px' }}>+</button>
                </div>
                {highlights.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '5px 0' }}>
                    <span style={{ color: '#fbbf24' }}>✨</span>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text2)' }}>{h}</span>
                    <span onClick={() => setHighlights(prev => prev.filter((_, j) => j !== i))} style={{ cursor: 'pointer', color: 'var(--text3)', fontSize: 12 }}>✕</span>
                  </div>
                ))}
              </div>

              <div>
                <label className="label">Activities Completed</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {day.activities.map(a => (
                    <div key={a.name} onClick={() => setActDone(prev => ({ ...prev, [a.name]: !prev[a.name] }))} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: actDone[a.name] ? 'rgba(16,185,129,0.08)' : 'var(--bg3)', borderRadius: 8, cursor: 'pointer', border: `1px solid ${actDone[a.name] ? 'rgba(16,185,129,0.25)' : 'var(--border)'}` }}>
                      <span style={{ fontSize: 16 }}>{actDone[a.name] ? '✅' : '⬜'}</span>
                      <span style={{ fontSize: 13, flex: 1, color: actDone[a.name] ? '#34d399' : 'var(--text2)', textDecoration: actDone[a.name] ? 'line-through' : 'none' }}>{a.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={saveEntry} className="btn-primary" style={{ flex: 1, padding: 12 }}>💾 Save Entry</button>
                <button onClick={() => setEditing(false)} className="btn-secondary" style={{ padding: '12px 16px' }}>Cancel</button>
              </div>
            </div>
          )}

          {!entry && !editing && (
            <div style={{ textAlign: 'center', padding: '30px', background: 'var(--bg3)', borderRadius: 14, border: '1.5px dashed var(--border2)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
              <div style={{ color: 'var(--text3)', fontSize: 13 }}>No journal entry yet for Day {selectedDay}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
