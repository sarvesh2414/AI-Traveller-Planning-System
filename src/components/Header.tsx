import { useState } from 'react'
import { useTrip } from '@/context/TripContext'
import { AuthModal } from './AuthModal'
import type { NavTab } from '@/types'

const TABS: { id: NavTab; label: string; icon: string }[] = [
  { id: 'plan', label: 'Plan Trip', icon: '✈️' },
  { id: 'saved', label: 'Saved', icon: '📦' },
  { id: 'insights', label: 'Insights', icon: '🧠' },
]

export function Header() {
  const { navTab, setNavTab, savedTrips, user } = useTrip()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <>
      <header style={{
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5,8,15,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>🗺️</div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg,#f1f5ff,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>JourneyMap</div>
            <div style={{ fontSize: 9, color: '#6366f1', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>AI Travel Planner</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '4px' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setNavTab(tab.id)} style={{
              padding: '7px 16px', borderRadius: 9, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', border: 'none',
              background: navTab === tab.id ? 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))' : 'transparent',
              color: navTab === tab.id ? '#a5b4fc' : 'var(--text3)',
              transition: 'all 0.2s', fontFamily: "'Outfit',sans-serif",
              position: 'relative',
              borderBottom: navTab === tab.id ? 'none' : 'none',
            }}>
              <span className="hide-mobile">{tab.icon} </span>{tab.label}
              {tab.id === 'saved' && savedTrips.length > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2, width: 15, height: 15, borderRadius: '50%', background: '#6366f1', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{savedTrips.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Auth */}
        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }} className="hide-mobile">
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text1)' }}>{user.displayName || 'Traveller'}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{user.email}</span>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'white', cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.4)' }}>
                {user.displayName?.charAt(0).toUpperCase() || '👤'}
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
              🔐 Sign In
            </button>
          )}
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
