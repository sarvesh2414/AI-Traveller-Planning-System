import { useTrip } from '@/context/TripContext'
import { TripForm } from '@/components/TripForm'
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { ItineraryView } from '@/components/ItineraryView'
import { LiveMap } from '@/components/LiveMap'
import { WeatherView } from '@/components/WeatherView'
import { BudgetView } from '@/components/BudgetView'
import { EssentialsView } from '@/components/EssentialsView'
import { CostSplitter } from '@/components/CostSplitter'
import { PackingList } from '@/components/PackingList'
import { TripJournal } from '@/components/TripJournal'
import { ChatPanel } from '@/components/ChatPanel'
import type { ViewTab } from '@/types'

const TABS: { id: ViewTab; label: string }[] = [
  { id: 'itinerary', label: '📅 Itinerary' },
  { id: 'map', label: '🗺️ Live Map' },
  { id: 'weather', label: '🌤️ Weather' },
  { id: 'budget', label: '💰 Budget' },
  { id: 'splitter', label: '💸 Splitter' },
  { id: 'packing', label: '🎒 Packing' },
  { id: 'journal', label: '📔 Journal' },
]

export function PlanPage() {
  const { currentTrip, viewTab, setViewTab, saveTrip, error, isGenerating } = useTrip()

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <TripForm />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {currentTrip && (
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', padding: '0 20px', background: 'var(--bg1)', flexShrink: 0, overflowX: 'auto', alignItems: 'center' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setViewTab(tab.id)} className={`view-tab${viewTab === tab.id ? ' active' : ''}`}>
                {tab.label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button onClick={() => saveTrip(currentTrip)} className="btn-ghost" style={{ margin: '0 0 0 8px', padding: '5px 12px', fontSize: 11, flexShrink: 0 }}>💾 Save</button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: currentTrip ? '20px 24px' : 0 }}>
          {isGenerating && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
              <div className="spinner" style={{ width: 48, height: 48 }} />
              <div style={{ fontSize: 16, fontWeight: 600 }}>✨ Crafting your itinerary...</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>AI is planning your perfect trip with ₹ INR pricing</div>
            </div>
          )}
          {error && !isGenerating && (
            <div style={{ background: 'rgba(244,63,94,0.1)', border: '1.5px solid rgba(244,63,94,0.3)', color: '#fda4af', borderRadius: 12, padding: '14px 16px', fontSize: 13, margin: 20, lineHeight: 1.6 }}>
              ⚠️ {error}
            </div>
          )}
          {!currentTrip && !isGenerating && !error && <WelcomeScreen />}
          {currentTrip && !isGenerating && (
            <>
              {viewTab === 'itinerary' && <ItineraryView />}
              {viewTab === 'map' && <LiveMap />}
              {viewTab === 'weather' && <WeatherView />}
              {viewTab === 'budget' && <BudgetView />}
              {viewTab === 'splitter' && <CostSplitter />}
              {viewTab === 'packing' && <PackingList />}
              {viewTab === 'journal' && <TripJournal />}
            </>
          )}
        </div>

        {currentTrip && !isGenerating && <ChatPanel />}
      </div>
    </div>
  )
}
