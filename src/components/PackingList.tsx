import { useState, useEffect } from 'react'
import { useTrip } from '@/context/TripContext'
import { generatePackingList } from '@/services/groq'
import { generateId } from '@/utils/helpers'
import type { PackingItem } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
  Clothes: '👕', Documents: '📄', Medicine: '💊',
  Electronics: '📱', Toiletries: '🧴', Miscellaneous: '🎒',
}

const DEFAULT_CATEGORIES = ['Clothes', 'Documents', 'Medicine', 'Electronics', 'Toiletries', 'Miscellaneous']

export function PackingList() {
  const { currentTrip, packingItems, setPackingItems, togglePackingItem } = useTrip()
  const [generating, setGenerating] = useState(false)
  const [filter, setFilter] = useState<'all' | string>('all')
  const [newItem, setNewItem] = useState('')
  const [newCategory, setNewCategory] = useState('Miscellaneous')

  const checkedCount = packingItems.filter(i => i.checked).length
  const totalCount = packingItems.length
  const progress = totalCount ? Math.round((checkedCount / totalCount) * 100) : 0

  async function handleGenerate() {
    if (!currentTrip) return
    setGenerating(true)
    try {
      const raw = await generatePackingList(
        currentTrip.destination,
        currentTrip.days.length,
        currentTrip.days.flatMap(d => d.activities.map(a => a.type)),
        'warm'
      )
      const clean = raw.replace(/```json|```/g, '').trim()
      const data = JSON.parse(clean) as Record<string, { name: string; essential: boolean }[]>
      const items: PackingItem[] = []
      Object.entries(data).forEach(([category, catItems]) => {
        catItems.forEach(item => items.push({
          id: generateId(), name: item.name,
          category, checked: false, essential: item.essential,
        }))
      })
      setPackingItems(items)
    } catch {
      // fallback default list
      const defaults: PackingItem[] = [
        ...['T-Shirts (x3)', 'Jeans/Trousers', 'Comfortable shoes', 'Sandals', 'Light jacket', 'Innerwear (x5)', 'Socks (x5)'].map(n => ({ id: generateId(), name: n, category: 'Clothes', checked: false, essential: true })),
        ...['Passport/Aadhaar', 'PAN Card', 'Travel insurance', 'Hotel booking printout', 'Emergency contacts'].map(n => ({ id: generateId(), name: n, category: 'Documents', checked: false, essential: true })),
        ...['Basic medicines', 'Prescription drugs', 'Hand sanitiser', 'ORS packets'].map(n => ({ id: generateId(), name: n, category: 'Medicine', checked: false, essential: false })),
        ...['Phone charger', 'Power bank', 'Earphones', 'Camera'].map(n => ({ id: generateId(), name: n, category: 'Electronics', checked: false, essential: false })),
        ...['Toothbrush & paste', 'Shampoo', 'Sunscreen', 'Deodorant'].map(n => ({ id: generateId(), name: n, category: 'Toiletries', checked: false, essential: false })),
        ...['Umbrella', 'Reusable water bottle', 'Snacks', 'UPI-linked phone'].map(n => ({ id: generateId(), name: n, category: 'Miscellaneous', checked: false, essential: false })),
      ]
      setPackingItems(defaults)
    }
    setGenerating(false)
  }

  function addCustomItem() {
    if (!newItem.trim()) return
    const item: PackingItem = { id: generateId(), name: newItem.trim(), category: newCategory, checked: false, essential: false }
    setPackingItems([...packingItems, item])
    setNewItem('')
  }

  function removeItem(id: string) {
    setPackingItems(packingItems.filter(i => i.id !== id))
  }

  const categories = DEFAULT_CATEGORIES
  const filtered = filter === 'all' ? packingItems : packingItems.filter(i => i.category === filter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeUp 0.4s ease' }}>
      <div className="section-label">🎒 AI Packing List</div>

      {/* Progress */}
      {totalCount > 0 && (
        <div className="card-glow">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Packing Progress</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: progress === 100 ? '#34d399' : '#818cf8' }}>{checkedCount}/{totalCount} items</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%`, background: progress === 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
          </div>
          {progress === 100 && <div style={{ marginTop: 8, fontSize: 13, color: '#34d399', fontWeight: 600 }}>🎉 All packed! Ready to travel!</div>}
        </div>
      )}

      {/* Generate button */}
      {packingItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 20px', background: 'var(--bg3)', borderRadius: 16, border: '1.5px dashed var(--border2)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, marginBottom: 6 }}>AI Packing Assistant</div>
          <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
            Let AI generate a personalised packing list based on your destination, duration and activities
          </div>
          <button onClick={handleGenerate} disabled={generating} className="btn-primary" style={{ padding: '12px 24px' }}>
            {generating ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />Generating...</> : '✨ Generate Smart Packing List'}
          </button>
        </div>
      )}

      {packingItems.length > 0 && (
        <>
          {/* Category filter tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => setFilter('all')} className={`btn-ghost${filter === 'all' ? ' active' : ''}`} style={{ fontSize: 12, background: filter === 'all' ? 'rgba(99,102,241,0.15)' : 'transparent', borderColor: filter === 'all' ? '#6366f1' : 'var(--border2)', color: filter === 'all' ? '#a5b4fc' : 'var(--text3)' }}>
              All ({totalCount})
            </button>
            {categories.map(cat => {
              const count = packingItems.filter(i => i.category === cat).length
              if (!count) return null
              return (
                <button key={cat} onClick={() => setFilter(cat)} className="btn-ghost" style={{ fontSize: 12, background: filter === cat ? 'rgba(99,102,241,0.15)' : 'transparent', borderColor: filter === cat ? '#6366f1' : 'var(--border2)', color: filter === cat ? '#a5b4fc' : 'var(--text3)' }}>
                  {CATEGORY_ICONS[cat]} {cat} ({count})
                </button>
              )
            })}
          </div>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: item.checked ? 'rgba(16,185,129,0.05)' : 'var(--bg3)', borderRadius: 10, border: `1.5px solid ${item.checked ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`, transition: 'all 0.2s' }}>
                <input type="checkbox" className="jm-check" checked={item.checked} onChange={() => togglePackingItem(item.id)} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: item.essential ? 600 : 400, color: item.checked ? 'var(--text3)' : 'var(--text1)', textDecoration: item.checked ? 'line-through' : 'none', transition: 'all 0.2s' }}>{item.name}</span>
                  {item.essential && !item.checked && <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'rgba(244,63,94,0.15)', color: '#fda4af', fontWeight: 600 }}>MUST</span>}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{CATEGORY_ICONS[item.category]}</span>
                <span onClick={() => removeItem(item.id)} style={{ cursor: 'pointer', color: 'var(--text3)', fontSize: 12, padding: 4 }}>✕</span>
              </div>
            ))}
          </div>

          {/* Add custom item */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="jm-input" style={{ flex: 1 }} placeholder="Add custom item..." value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomItem()} />
            <select className="jm-input" style={{ width: 130 }} value={newCategory} onChange={e => setNewCategory(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
            </select>
            <button onClick={addCustomItem} className="btn-primary" style={{ padding: '9px 14px', fontSize: 13 }}>+</button>
          </div>

          {/* Regenerate */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleGenerate} disabled={generating} className="btn-secondary" style={{ flex: 1, padding: 11 }}>
              {generating ? '⏳ Generating...' : '🔄 Regenerate with AI'}
            </button>
            <button onClick={() => setPackingItems(packingItems.map(i => ({ ...i, checked: false })))} className="btn-ghost" style={{ padding: '11px 14px' }}>
              Reset All
            </button>
          </div>
        </>
      )}
    </div>
  )
}
