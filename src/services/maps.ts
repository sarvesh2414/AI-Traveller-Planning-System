import type { LatLng, NearbyPlace } from '@/types'

const NOMINATIM = 'https://nominatim.openstreetmap.org'
const OVERPASS = 'https://overpass-api.de/api/interpreter'

export async function geocode(query: string): Promise<LatLng | null> {
  try {
    const res = await fetch(`${NOMINATIM}/search?q=${encodeURIComponent(query)}&format=json&limit=1`)
    const data = await res.json() as { lat: string; lon: string }[]
    if (!data.length) return null
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch { return null }
}

export async function searchNearby(lat: number, lng: number, type: string): Promise<NearbyPlace[]> {
  const tagMap: Record<string, string> = {
    hotel: 'tourism=hotel', restaurant: 'amenity=restaurant',
    attraction: 'tourism=attraction', hospital: 'amenity=hospital',
    atm: 'amenity=atm', pharmacy: 'amenity=pharmacy',
  }
  const tag = tagMap[type] || 'amenity=restaurant'
  const q = `[out:json][timeout:10];node[${tag}](around:2000,${lat},${lng});out 8;`
  try {
    const res = await fetch(OVERPASS, { method: 'POST', body: `data=${encodeURIComponent(q)}` })
    const data = await res.json() as { elements: { id: number; lat: number; lon: number; tags: Record<string, string> }[] }
    return data.elements.slice(0, 8).map((el, i) => {
      const dist = haversine(lat, lng, el.lat, el.lon)
      return {
        id: String(el.id),
        name: el.tags.name || `${type} ${i + 1}`,
        type,
        address: el.tags['addr:street'] || 'See on map',
        distance: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`,
        rating: 3 + Math.random() * 2,
        price: getPriceRange(type),
        lat: el.lat, lng: el.lon,
      }
    })
  } catch { return [] }
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getPriceRange(type: string): string {
  const r: Record<string, string[]> = {
    hotel: ['₹1,200/night', '₹2,500/night', '₹4,000/night'],
    restaurant: ['₹150/person', '₹400/person', '₹250/person'],
    attraction: ['Free', '₹50 entry', '₹200 entry'],
    hospital: ['Emergency 24/7'], atm: ['Free withdrawal'], pharmacy: ['Open 24/7'],
  }
  const opts = r[type] || ['Available']
  return opts[Math.floor(Math.random() * opts.length)]
}

export async function getRoute(fromLat: number, fromLng: number, toLat: number, toLng: number, mode: string) {
  const profile = mode === 'cycling' ? 'bike' : mode === 'walking' ? 'foot' : 'car'
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/${profile}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`)
    const data = await res.json() as { routes: { distance: number; duration: number; geometry: { coordinates: [number, number][] }; legs: { steps: { maneuver: { instruction?: string }; name: string }[] }[] }[] }
    if (!data.routes?.length) return null
    const route = data.routes[0]
    return {
      distance: (route.distance / 1000).toFixed(1) + ' km',
      duration: Math.round(route.duration / 60) + ' min',
      coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
      steps: route.legs[0]?.steps.map(s => s.maneuver.instruction || s.name).filter(Boolean).slice(0, 8) || [],
    }
  } catch { return null }
}
