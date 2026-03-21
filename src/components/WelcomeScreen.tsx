export function WelcomeScreen() {
  const features = [
    { icon: '📍', title: 'From → To Planning', desc: 'Enter origin & destination for full route planning with AI' },
    { icon: '🗺️', title: 'Live Route Map', desc: 'Real-time navigation — car, bike, walk, transit modes' },
    { icon: '🌤️', title: 'Weather Forecast', desc: '7-day forecast with packing tips and travel advisories' },
    { icon: '💸', title: 'Cost Splitter', desc: 'Split expenses among friends with WhatsApp sharing' },
    { icon: '🎒', title: 'AI Packing List', desc: 'Smart packing list generated for your destination' },
    { icon: '📔', title: 'Trip Journal', desc: 'Document memories, tick activities, rate each day' },
    { icon: '🔐', title: 'Cloud Sync', desc: 'Sign in to save trips across all devices with Firebase' },
    { icon: '💱', title: 'Live INR Rates', desc: 'Real-time currency conversion for all countries' },
    { icon: '🤖', title: 'AI Assistant', desc: 'Chat about your trip — all prices quoted in ₹ INR' },
  ]

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 30px', textAlign: 'center', gap: 28, animation: 'fadeUp 0.5s ease' }}>
      <div style={{ fontSize: 60, filter: 'drop-shadow(0 0 24px rgba(99,102,241,0.4))', animation: 'pulse 3s ease infinite' }}>✈️</div>

      <div>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 36, fontWeight: 700, marginBottom: 10, lineHeight: 1.1 }} className="gradient-text">
          Your AI Travel Companion
        </h1>
        <p style={{ color: 'var(--text3)', fontSize: 15, lineHeight: 1.7, maxWidth: 480 }}>
          Enter your starting point and destination on the left. Get a complete AI-powered travel plan — maps, weather, cost splitting, packing lists, and a trip journal — all in ₹ INR.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, width: '100%', maxWidth: 680 }}>
        {features.map(f => (
          <div key={f.title} className="card" style={{ textAlign: 'left', cursor: 'default' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 5, color: 'var(--text1)' }}>{f.title}</div>
            <div style={{ color: 'var(--text3)', fontSize: 11, lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text3)' }}>
        <span>🔓 Free to use</span>
        <span>·</span>
        <span>⚡ Powered by Groq AI</span>
        <span>·</span>
        <span>🗺️ OpenStreetMap</span>
        <span>·</span>
        <span>☁️ Firebase sync</span>
      </div>
    </div>
  )
}
