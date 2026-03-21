import { TripProvider, useTrip } from '@/context/TripContext'
import { Header } from '@/components/Header'
import { PlanPage } from '@/pages/PlanPage'
import { SavedPage } from '@/pages/SavedPage'
import { InsightsPage } from '@/pages/InsightsPage'
import './index.css'

function AppContent() {
  const { navTab } = useTrip()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg0)' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {navTab === 'plan' && <PlanPage />}
        {navTab === 'saved' && <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}><SavedPage /></div>}
        {navTab === 'insights' && <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}><InsightsPage /></div>}
      </main>
    </div>
  )
}

export default function App() {
  return <TripProvider><AppContent /></TripProvider>
}
