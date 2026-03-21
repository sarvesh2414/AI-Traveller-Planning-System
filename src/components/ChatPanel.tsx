import { useState, useRef, useEffect } from 'react'
import { useTrip } from '@/context/TripContext'
import { QUICK_CHAT_PROMPTS } from '@/utils/constants'

export function ChatPanel() {
  const { chatMessages, sendChat, isChatting, currentTrip } = useTrip()
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages, isChatting])

  async function handleSend() {
    const msg = input.trim()
    if (!msg || isChatting) return
    setInput('')
    await sendChat(msg)
  }

  if (!currentTrip) return null

  return (
    <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg1)', padding: '12px 20px 14px', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
      {chatMessages.length > 0 && (
        <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 4 }}>
          {chatMessages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: msg.role === 'user' ? 'linear-gradient(135deg,#f59e0b,#f43f5e)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>
                {msg.role === 'user' ? 'Me' : 'AI'}
              </div>
              <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: 12, fontSize: 12, lineHeight: 1.6, color: 'var(--text1)', background: msg.role === 'user' ? 'rgba(99,102,241,0.2)' : 'var(--bg3)', border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`, borderTopLeftRadius: msg.role === 'assistant' ? 4 : 12, borderTopRightRadius: msg.role === 'user' ? 4 : 12 }}>
                {msg.content}
              </div>
            </div>
          ))}
          {isChatting && (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>AI</div>
              <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, borderTopLeftRadius: 4, padding: '10px 14px', display: 'flex', gap: 4 }}>
                {[0, 200, 400].map((d, i) => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)', display: 'inline-block', animation: `bounce 1.4s ${d}ms infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {QUICK_CHAT_PROMPTS.map(q => (
          <button key={q.prompt} onClick={() => sendChat(q.prompt)} disabled={isChatting} className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }}>
            {q.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Ask anything... (prices in ₹ INR)" rows={1}
          className="jm-input" style={{ flex: 1, resize: 'none', maxHeight: 90, lineHeight: 1.5 }} />
        <button onClick={handleSend} disabled={isChatting || !input.trim()} className="btn-primary" style={{ width: 42, height: 42, borderRadius: 12, padding: 0, fontSize: 16, flexShrink: 0, opacity: (isChatting || !input.trim()) ? 0.5 : 1 }}>
          ➤
        </button>
      </div>
    </div>
  )
}
