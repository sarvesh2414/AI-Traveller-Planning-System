import { useEffect, useRef, useState, useCallback } from 'react'
import { useTrip } from '@/context/TripContext'
import { DAY_COLORS, DAY_PIN_COLORS } from '@/utils/constants'
import { geocode, searchNearby, getRoute } from '@/services/maps'
import { inrFull } from '@/utils/helpers'
import type { NearbyPlace, TravelMode } from '@/types'

declare global { interface Window { L: any } }

const CAB_OPTIONS = [
  { id: 'auto', name: 'Auto Rickshaw', type: 'Economy', capacity: 3, time: '15 min', fare: 120, icon: '🛺' },
  { id: 'mini', name: 'Mini Cab', type: 'Standard', capacity: 4, time: '12 min', fare: 200, icon: '🚕' },
  { id: 'sedan', name: 'Sedan', type: 'Comfort', capacity: 4, time: '10 min', fare: 320, icon: '🚗' },
  { id: 'suv', name: 'SUV / Innova', type: 'Premium', capacity: 7, time: '12 min', fare: 480, icon: '🚙' },
  { id: 'bike', name: 'Bike Taxi', type: 'Fastest', capacity: 1, time: '8 min', fare: 80, icon: '🏍️' },
]

const NEARBY_TABS = [
  { id: 'hotel', label: 'Hotels', icon: '🏨' },
  { id: 'restaurant', label: 'Food', icon: '🍜' },
  { id: 'attraction', label: 'Sights', icon: '🏛️' },
  { id: 'hospital', label: 'Hospital', icon: '🏥' },
  { id: 'atm', label: 'ATM', icon: '🏧' },
]

export function LiveMap() {
  const { currentTrip, setUserLocation } = useTrip()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInst = useRef<any>(null)
  const userMark = useRef<any>(null)
  const routeLayer = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<TravelMode>('driving')
  const [nearbyType, setNearbyType] = useState('hotel')
  const [nearby, setNearby] = useState<NearbyPlace[]>([])
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string; steps: string[] } | null>(null)
  const [showCabs, setShowCabs] = useState(false)
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null)
  const [origCoords, setOrigCoords] = useState<[number, number] | null>(null)
  const [tracking, setTracking] = useState(false)
  const watchId = useRef<number | null>(null)

  useEffect(() => {
    if (document.getElementById('lf-css')) { setReady(true); return }
    const link = document.createElement('link'); link.id = 'lf-css'; link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link)
    const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setReady(true); document.head.appendChild(script)
  }, [])

  const drawRoute = useCallback(async (map: any, fromLat: number, fromLng: number, toLat: number, toLng: number, m: string) => {
    const L = window.L
    if (routeLayer.current) { map.removeLayer(routeLayer.current); routeLayer.current = null }
    const result = await getRoute(fromLat, fromLng, toLat, toLng, m)
    if (!result) return
    const colors: Record<string, string> = { driving: '#6366f1', cycling: '#f59e0b', walking: '#10b981', transit: '#8b5cf6' }
    const line = L.polyline(result.coordinates, { color: colors[m] || '#6366f1', weight: 4, opacity: 0.85, dashArray: m === 'walking' ? '8 6' : m === 'cycling' ? '12 4' : undefined }).addTo(map)
    routeLayer.current = line
    map.fitBounds(line.getBounds(), { padding: [30, 30] })
    setRouteInfo({ distance: result.distance, duration: result.duration, steps: result.steps })
  }, [])

  const initMap = useCallback(async () => {
    if (!ready || !mapRef.current || !currentTrip) return
    if (mapInst.current) { mapInst.current.remove(); mapInst.current = null }
    setLoading(true)
    const L = window.L
    const dest = await geocode(currentTrip.destination)
    if (!dest) { setLoading(false); return }
    setDestCoords([dest.lat, dest.lng])

    const map = L.map(mapRef.current, { center: [dest.lat, dest.lng], zoom: 13 })
    mapInst.current = map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map)

    const destIcon = L.divIcon({ className: '', html: '<div style="width:40px;height:40px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#f43f5e,#f59e0b);border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;transform:rotate(-45deg);font-size:16px;"><span style="transform:rotate(45deg)">🎯</span></div>', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -42] })
    L.marker([dest.lat, dest.lng], { icon: destIcon }).addTo(map).bindPopup('<strong>' + currentTrip.destination + '</strong><br/><em>' + currentTrip.tagline + '</em>').openPopup()

    if (currentTrip.origin && currentTrip.origin !== currentTrip.destination) {
      const orig = await geocode(currentTrip.origin)
      if (orig) {
        setOrigCoords([orig.lat, orig.lng])
        const origIcon = L.divIcon({ className: '', html: '<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#10b981,#06b6d4);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">🏠</div>', iconSize: [34, 34], iconAnchor: [17, 17] })
        L.marker([orig.lat, orig.lng], { icon: origIcon }).addTo(map).bindPopup('<strong>Starting Point</strong><br/>' + currentTrip.origin)
        map.fitBounds([[orig.lat, orig.lng], [dest.lat, dest.lng]], { padding: [40, 40] })
        drawRoute(map, orig.lat, orig.lng, dest.lat, dest.lng, 'driving')
      }
    }

    for (let i = 0; i < currentTrip.days.length; i++) {
      const day = currentTrip.days[i]
      const pinColor = DAY_PIN_COLORS[i % DAY_PIN_COLORS.length]
      const area = await geocode(day.area + ', ' + currentTrip.destination)
      if (!area) continue
      await new Promise(r => setTimeout(r, 300))
      const dayIcon = L.divIcon({ className: '', html: '<div style="width:28px;height:28px;border-radius:50%;background:' + pinColor + ';border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700;">D' + day.dayNum + '</div>', iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16] })
      const actsHtml = day.activities.slice(0, 3).map(a => '<div style="font-size:11px;color:#555;padding:1px 0">• ' + a.name + '</div>').join('')
      L.marker([area.lat, area.lng], { icon: dayIcon }).addTo(map).bindPopup('<div style="font-family:sans-serif;min-width:150px"><b style="color:' + pinColor + '">Day ' + day.dayNum + ': ' + day.title + '</b><br/><div style="color:#666;font-size:11px;margin:2px 0">' + day.area + '</div>' + actsHtml + '</div>')
    }

    setLoading(false)
    loadNearby(dest.lat, dest.lng, 'hotel')
  }, [ready, currentTrip, drawRoute])

  useEffect(() => { initMap() }, [initMap])

  async function loadNearby(lat: number, lng: number, type: string) {
    setNearbyLoading(true); setNearbyType(type)
    const places = await searchNearby(lat, lng, type)
    setNearby(places); setNearbyLoading(false)
    if (mapInst.current && places.length) {
      const L = window.L
      places.forEach(p => {
        const ic = L.divIcon({ className: '', html: '<div style="background:rgba(17,24,39,0.92);border:1px solid rgba(255,255,255,0.2);border-radius:8px;padding:3px 7px;font-size:10px;color:#f1f5ff;white-space:nowrap;font-family:sans-serif;">' + p.name.slice(0, 18) + '</div>', iconAnchor: [0, 0] })
        L.marker([p.lat, p.lng], { icon: ic }).addTo(mapInst.current).bindPopup('<div style="font-family:sans-serif;padding:4px;min-width:140px"><b>' + p.name + '</b><br/><div style="color:#666;font-size:11px">' + p.address + '</div><div style="color:#6366f1;font-size:11px;margin-top:3px">' + p.price + '</div></div>')
      })
    }
  }

  function startTracking() {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return }
    setTracking(true)
    watchId.current = navigator.geolocation.watchPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      setUserLocation({ lat, lng })
      const L = window.L
      if (!mapInst.current || !L) return
      if (userMark.current) mapInst.current.removeLayer(userMark.current)
      const ic = L.divIcon({ className: '', html: '<div style="width:16px;height:16px;border-radius:50%;background:#6366f1;border:3px solid white;box-shadow:0 0 0 8px rgba(99,102,241,0.25);"></div>', iconSize: [16, 16], iconAnchor: [8, 8] })
      userMark.current = L.marker([lat, lng], { icon: ic }).addTo(mapInst.current).bindPopup('📍 You are here')
      mapInst.current.setView([lat, lng], 15)
    }, () => {}, { enableHighAccuracy: true, maximumAge: 3000 })
  }

  function stopTracking() {
    if (watchId.current !== null) { navigator.geolocation.clearWatch(watchId.current); watchId.current = null }
    setTracking(false)
  }

  async function handleModeChange(m: TravelMode) {
    setMode(m)
    if (origCoords && destCoords && mapInst.current) drawRoute(mapInst.current, origCoords[0], origCoords[1], destCoords[0], destCoords[1], m)
  }

  if (!currentTrip) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeUp 0.4s ease' }}>
      {/* Route info bar */}
      <div className="card-glow" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>🟢 {currentTrip.origin}</span>
              <span style={{ color: 'var(--text3)' }}>→</span>
              <span style={{ color: '#f87171', fontWeight: 700 }}>🔴 {currentTrip.destination}</span>
            </div>
            {routeInfo && (
              <div style={{ display: 'flex', gap: 14, marginTop: 5 }}>
                <span style={{ fontSize: 12, color: '#818cf8' }}>📏 {routeInfo.distance}</span>
                <span style={{ fontSize: 12, color: '#fbbf24' }}>⏱️ {routeInfo.duration}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {([['driving','🚗','Car'],['cycling','🏍️','Bike'],['walking','🚶','Walk'],['transit','🚌','Bus']] as [TravelMode,string,string][]).map(([m, ic, lb]) => (
              <button key={m} onClick={() => handleModeChange(m)} style={{ padding: '6px 10px', borderRadius: 9, border: `1.5px solid ${mode === m ? '#6366f1' : 'var(--border)'}`, background: mode === m ? 'rgba(99,102,241,0.2)' : 'transparent', color: mode === m ? '#a5b4fc' : 'var(--text3)', fontSize: 10, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, transition: 'all 0.15s' }}>
                <span style={{ fontSize: 14 }}>{ic}</span><span>{lb}</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={tracking ? stopTracking : startTracking} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: tracking ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)', color: tracking ? '#fda4af' : '#34d399', fontSize: 11, fontWeight: 600, fontFamily: "'Outfit',sans-serif" }}>
              {tracking ? '⏹ Stop' : '📡 Live'}
            </button>
            <button onClick={() => setShowCabs(!showCabs)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: 11, fontWeight: 600, fontFamily: "'Outfit',sans-serif" }}>
              🚕 Cabs
            </button>
          </div>
        </div>
      </div>

      {/* Cabs panel */}
      {showCabs && (
        <div className="card" style={{ border: '1.5px solid rgba(245,158,11,0.3)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 10 }}>🚕 Cab Options (Estimated Fares)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CAB_OPTIONS.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--bg3)', borderRadius: 10, border: '1.5px solid var(--border)' }}>
                <span style={{ fontSize: 22 }}>{c.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.type} · {c.capacity} seats · {c.time}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#34d399' }}>{inrFull(c.fare)}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {[['Ola', '#34d399', 'https://www.olacabs.com'], ['Uber', '#818cf8', 'https://www.uber.com'], ['Rapido', '#fbbf24', 'https://rapido.bike']].map(([name, color, url]) => (
              <a key={name} href={url as string} target="_blank" rel="noreferrer" style={{ flex: 1, padding: 9, textAlign: 'center', borderRadius: 9, background: (color as string) + '22', color: color as string, textDecoration: 'none', fontSize: 12, fontWeight: 700, border: `1px solid ${color as string}44` }}>
                Book {name} ↗
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1.5px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1000, background: 'var(--bg2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div className="spinner" />
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>Loading map for {currentTrip.destination}...</div>
          </div>
        )}
        <div ref={mapRef} style={{ height: 380, width: '100%' }} />
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <a href={`https://www.google.com/maps/search/${encodeURIComponent(currentTrip.destination)}`} target="_blank" rel="noreferrer" style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(99,102,241,0.9)', color: 'white', fontSize: 11, textDecoration: 'none', fontFamily: "'Outfit',sans-serif", fontWeight: 600 }}>G Maps ↗</a>
        </div>
      </div>

      {/* Directions */}
      {routeInfo && routeInfo.steps.length > 0 && (
        <div className="card">
          <div className="section-label" style={{ marginBottom: 10 }}>🧭 Directions ({mode === 'cycling' ? '🏍️ Bike' : mode === 'walking' ? '🚶 Walk' : mode === 'transit' ? '🚌 Bus' : '🚗 Car'})</div>
          {routeInfo.steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '5px 0', borderBottom: i < routeInfo.steps.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: 11, color: '#818cf8', minWidth: 20, fontWeight: 700 }}>{i + 1}.</span>
              <span style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.4 }}>{s}</span>
            </div>
          ))}
        </div>
      )}

      {/* Nearby */}
      <div className="card">
        <div className="section-label" style={{ marginBottom: 10 }}>📍 Nearby Places</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {NEARBY_TABS.map(t => (
            <button key={t.id} onClick={() => destCoords && loadNearby(destCoords[0], destCoords[1], t.id)} className="btn-ghost" style={{ fontSize: 11, background: nearbyType === t.id ? 'rgba(245,158,11,0.15)' : 'transparent', borderColor: nearbyType === t.id ? '#f59e0b' : 'var(--border2)', color: nearbyType === t.id ? '#fbbf24' : 'var(--text3)' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        {nearbyLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}><div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} /></div>
        ) : nearby.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, padding: 16 }}>No results found nearby</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {nearby.map(p => (
              <div key={p.id} style={{ display: 'flex', gap: 12, padding: '10px 12px', background: 'var(--bg3)', borderRadius: 10, border: '1.5px solid var(--border)' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>
                  {nearbyType === 'hotel' ? '🏨' : nearbyType === 'restaurant' ? '🍜' : nearbyType === 'attraction' ? '🏛️' : nearbyType === 'hospital' ? '🏥' : '🏧'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{p.address}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: '#34d399' }}>📍 {p.distance}</span>
                    <span style={{ fontSize: 10, color: '#34d399' }}>💰 {p.price}</span>
                    {p.rating && <span style={{ fontSize: 10, color: '#fbbf24' }}>⭐ {p.rating.toFixed(1)}</span>}
                  </div>
                </div>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(p.name + ' ' + currentTrip.destination)}`} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: '#818cf8', textDecoration: 'none', alignSelf: 'center', padding: '4px 8px', borderRadius: 6, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', whiteSpace: 'nowrap' }}>
                  View ↗
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Day list */}
      <div>
        <div className="section-label">Daily Route</div>
        {currentTrip.days.map((day, i) => {
          const col = DAY_COLORS[i % DAY_COLORS.length]
          const pin = DAY_PIN_COLORS[i % DAY_PIN_COLORS.length]
          return (
            <div key={day.dayNum} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: col.bg, color: pin, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>D{day.dayNum}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{day.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{day.area}</div>
              </div>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(day.area + ', ' + currentTrip.destination)}`} target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontSize: 10, padding: '3px 8px' }}>
                Directions ↗
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
