import { useState } from 'react'
import { signInWithGoogle, signInEmail, signUpEmail, logout, isConfigured } from '@/services/firebase'
import { useTrip } from '@/context/TripContext'

interface Props { onClose: () => void }

export function AuthModal({ onClose }: Props) {
  const { user } = useTrip()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleEmail() {
    if (!email || !password) { setError('Fill in all fields'); return }
    setLoading(true); setError('')
    try {
      if (mode === 'login') await signInEmail(email, password)
      else await signUpEmail(email, password)
      onClose()
    } catch (e) { setError((e as Error).message.replace('Firebase: ', '')) }
    finally { setLoading(false) }
  }

  async function handleGoogle() {
    setLoading(true); setError('')
    try { await signInWithGoogle(); onClose() }
    catch (e) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  async function handleLogout() {
    await logout(); onClose()
  }

  const inp: React.CSSProperties = {
    width: '100%', background: 'var(--bg3)', border: '1.5px solid var(--border2)',
    borderRadius: 10, color: 'var(--text1)', fontFamily: "'Outfit',sans-serif",
    fontSize: 14, padding: '11px 14px', outline: 'none',
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔐</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 24, fontWeight: 700 }} className="gradient-text">
            {user ? 'Your Account' : mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </div>
          <div style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>
            {user ? user.email : 'Save trips to cloud & access anywhere'}
          </div>
        </div>

        {!isConfigured && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#fcd34d', marginBottom: 16, lineHeight: 1.5 }}>
            ⚠️ Firebase not configured. Add keys to .env to enable cloud sync. Auth works in demo mode only.
          </div>
        )}

        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--bg3)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'white' }}>
                {user.displayName?.charAt(0).toUpperCase() || '👤'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{user.displayName || 'Traveller'}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{user.email}</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1.5px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.1)', color: '#fda4af', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 600 }}>
              Sign Out
            </button>
            <button onClick={onClose} className="btn-secondary" style={{ width: '100%', padding: 11 }}>Close</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={handleGoogle} disabled={loading} style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1.5px solid var(--border2)', background: 'var(--bg3)', color: 'var(--text1)', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🌐</span> Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>or email</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <input style={inp} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
            <input style={inp} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmail()} />

            {error && <div style={{ fontSize: 12, color: '#fda4af', background: 'rgba(244,63,94,0.1)', borderRadius: 8, padding: '8px 12px' }}>{error}</div>}

            <button onClick={handleEmail} disabled={loading} className="btn-primary" style={{ width: '100%', padding: 12 }}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : mode === 'login' ? '🔑 Sign In' : '🚀 Create Account'}
            </button>

            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
              <span onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
