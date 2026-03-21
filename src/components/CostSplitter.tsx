import { useState } from 'react'
import { useTrip } from '@/context/TripContext'
import { MEMBER_COLORS, EXPENSE_CATEGORIES } from '@/utils/constants'
import { inrFull, generateId } from '@/utils/helpers'
import type { SplitMember, SplitExpense } from '@/types'

export function CostSplitter() {
  const { splitMembers, splitExpenses, setSplitMembers, addExpense, removeExpense } = useTrip()
  const [newName, setNewName] = useState('')
  const [expTitle, setExpTitle] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expPaidBy, setExpPaidBy] = useState('')
  const [expCategory, setExpCategory] = useState('🍜 Food')
  const [expSplitAmong, setExpSplitAmong] = useState<string[]>([])
  const [showAddExp, setShowAddExp] = useState(false)

  function addMember() {
    if (!newName.trim()) return
    const member: SplitMember = { id: generateId(), name: newName.trim(), color: MEMBER_COLORS[splitMembers.length % MEMBER_COLORS.length] }
    setSplitMembers([...splitMembers, member])
    setNewName('')
    if (!expPaidBy) setExpPaidBy(member.id)
    setExpSplitAmong(prev => [...prev, member.id])
  }

  function removeMember(id: string) {
    setSplitMembers(splitMembers.filter(m => m.id !== id))
    setExpSplitAmong(prev => prev.filter(i => i !== id))
  }

  function toggleSplitAmong(id: string) {
    setExpSplitAmong(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  function handleAddExpense() {
    if (!expTitle.trim() || !expAmount || !expPaidBy || expSplitAmong.length === 0) return
    const exp: SplitExpense = {
      id: generateId(), title: expTitle.trim(),
      amount: parseFloat(expAmount), paidBy: expPaidBy,
      splitAmong: expSplitAmong, category: expCategory,
      date: new Date().toISOString().split('T')[0],
    }
    addExpense(exp)
    setExpTitle(''); setExpAmount(''); setShowAddExp(false)
  }

  // Calculate balances
  const balances: Record<string, number> = {}
  splitMembers.forEach(m => { balances[m.id] = 0 })
  splitExpenses.forEach(exp => {
    const share = exp.amount / exp.splitAmong.length
    balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount
    exp.splitAmong.forEach(id => { balances[id] = (balances[id] || 0) - share })
  })

  // Calculate settlements
  const settlements: { from: string; to: string; amount: number }[] = []
  const debtors = splitMembers.filter(m => balances[m.id] < -0.5).map(m => ({ ...m, amount: -balances[m.id] }))
  const creditors = splitMembers.filter(m => balances[m.id] > 0.5).map(m => ({ ...m, amount: balances[m.id] }))
  debtors.forEach(d => {
    let owe = d.amount
    creditors.forEach(c => {
      if (owe <= 0 || c.amount <= 0) return
      const settle = Math.min(owe, c.amount)
      settlements.push({ from: d.id, to: c.id, amount: settle })
      owe -= settle; c.amount -= settle
    })
  })

  const totalSpent = splitExpenses.reduce((a, e) => a + e.amount, 0)
  const inp: React.CSSProperties = { width: '100%', background: 'var(--bg3)', border: '1.5px solid var(--border2)', borderRadius: 10, color: 'var(--text1)', fontFamily: "'Outfit',sans-serif", fontSize: 13, padding: '9px 12px', outline: 'none' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeUp 0.4s ease' }}>
      <div className="section-label">💸 Trip Cost Splitter</div>

      {/* Summary */}
      {splitExpenses.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { label: 'Total Spent', value: inrFull(Math.round(totalSpent)), color: '#f87171' },
            { label: 'Expenses', value: String(splitExpenses.length), color: '#818cf8' },
            { label: 'Per Person', value: inrFull(Math.round(totalSpent / Math.max(splitMembers.length, 1))), color: '#34d399' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-val" style={{ color: s.color, fontSize: 18 }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Members */}
      <div className="card">
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', marginBottom: 12 }}>👥 Group Members</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {splitMembers.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg3)', border: '1.5px solid var(--border2)', borderRadius: 20, padding: '5px 12px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</span>
              <span onClick={() => removeMember(m.id)} style={{ cursor: 'pointer', color: 'var(--text3)', fontSize: 12, marginLeft: 2 }}>✕</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...inp, flex: 1 }} placeholder="Member name..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMember()} />
          <button onClick={addMember} className="btn-primary" style={{ padding: '9px 16px', fontSize: 13 }}>+ Add</button>
        </div>
      </div>

      {/* Add expense */}
      {splitMembers.length >= 2 && (
        <div>
          {!showAddExp ? (
            <button onClick={() => setShowAddExp(true)} className="btn-primary" style={{ width: '100%', padding: 12 }}>
              ➕ Add Expense
            </button>
          ) : (
            <div className="card-glow" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>New Expense</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">What for?</label>
                  <input style={inp} placeholder="Dinner at restaurant..." value={expTitle} onChange={e => setExpTitle(e.target.value)} />
                </div>
                <div>
                  <label className="label">Amount (₹)</label>
                  <input style={inp} type="number" placeholder="0" value={expAmount} onChange={e => setExpAmount(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="label">Paid by</label>
                  <select style={inp} value={expPaidBy} onChange={e => setExpPaidBy(e.target.value)}>
                    <option value="">Select...</option>
                    {splitMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Category</label>
                  <select style={inp} value={expCategory} onChange={e => setExpCategory(e.target.value)}>
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Split among</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {splitMembers.map(m => (
                    <span key={m.id} onClick={() => toggleSplitAmong(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: `1.5px solid ${expSplitAmong.includes(m.id) ? m.color : 'var(--border2)'}`, background: expSplitAmong.includes(m.id) ? m.color + '22' : 'var(--bg3)', color: expSplitAmong.includes(m.id) ? 'var(--text1)' : 'var(--text3)', fontSize: 12, fontWeight: 500, transition: 'all 0.15s', userSelect: 'none' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />{m.name}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleAddExpense} className="btn-primary" style={{ flex: 1, padding: 11 }}>Save Expense</button>
                <button onClick={() => setShowAddExp(false)} className="btn-secondary" style={{ padding: '11px 16px' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expense list */}
      {splitExpenses.length > 0 && (
        <div>
          <div className="section-label">Recent Expenses</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {splitExpenses.slice().reverse().map(exp => {
              const payer = splitMembers.find(m => m.id === exp.paidBy)
              const share = exp.amount / exp.splitAmong.length
              return (
                <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: 'var(--bg3)', borderRadius: 12, border: '1.5px solid var(--border)' }}>
                  <div style={{ fontSize: 20, flexShrink: 0 }}>{exp.category.split(' ')[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{exp.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      Paid by <span style={{ color: payer?.color || '#818cf8' }}>{payer?.name}</span> · {inrFull(Math.round(share))}/person
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#fbbf24' }}>{inrFull(Math.round(exp.amount))}</div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>{exp.date}</div>
                  </div>
                  <span onClick={() => removeExpense(exp.id)} style={{ cursor: 'pointer', color: 'var(--text3)', fontSize: 14, padding: 4 }}>🗑️</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Settlements */}
      {settlements.length > 0 && (
        <div>
          <div className="section-label">💰 Who Owes Whom</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {settlements.map((s, i) => {
              const from = splitMembers.find(m => m.id === s.from)
              const to = splitMembers.find(m => m.id === s.to)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(16,185,129,0.08)', border: '1.5px solid rgba(16,185,129,0.2)', borderRadius: 12 }}>
                  <span style={{ fontWeight: 700, color: from?.color }}>{from?.name}</span>
                  <span style={{ color: 'var(--text3)', fontSize: 12 }}>owes</span>
                  <span style={{ fontWeight: 700, color: to?.color }}>{to?.name}</span>
                  <div style={{ flex: 1, textAlign: 'right', fontWeight: 700, fontSize: 15, color: '#34d399' }}>{inrFull(Math.round(s.amount))}</div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => {
              const text = settlements.map(s => {
                const from = splitMembers.find(m => m.id === s.from)?.name
                const to = splitMembers.find(m => m.id === s.to)?.name
                return `${from} owes ${to}: ${inrFull(Math.round(s.amount))}`
              }).join('\n')
              const msg = `*JourneyMap Trip Split*\nTotal: ${inrFull(Math.round(totalSpent))}\n\n${text}`
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
            }} style={{ width: '100%', padding: 11, borderRadius: 12, border: 'none', background: '#25d366', color: 'white', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              📱 Share via WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Balances */}
      {splitMembers.length > 0 && splitExpenses.length > 0 && (
        <div>
          <div className="section-label">Balance Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {splitMembers.map(m => {
              const bal = balances[m.id] || 0
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg3)', borderRadius: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: bal >= 0 ? '#34d399' : '#f87171' }}>
                    {bal >= 0 ? '+' : ''}{inrFull(Math.round(Math.abs(bal)))}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{bal >= 0 ? 'gets back' : 'owes'}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
