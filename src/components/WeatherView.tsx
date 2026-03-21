import { useEffect, useState } from 'react'
import { useTrip } from '@/context/TripContext'
import { getWeatherForecast, getPackingWeatherHint } from '@/services/weather'
import type { WeatherData } from '@/types'

export function WeatherView() {
  const { currentTrip } = useTrip()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentTrip) return
    setLoading(true)
    getWeatherForecast(currentTrip.destination).then(data => {
      setWeather(data)
      setLoading(false)
    })
  }, [currentTrip?.destination])

  if (!currentTrip) return null

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 14 }}>
        <div className="spinner" />
        <div style={{ color: 'var(--text3)', fontSize: 13 }}>Fetching weather for {currentTrip.destination}...</div>
      </div>
    )
  }

  if (!weather) return <div style={{ padding: 30, color: 'var(--text3)', textAlign: 'center' }}>Weather data unavailable</div>

  const hint = getPackingWeatherHint(weather.forecast)
  const avgHigh = Math.round(weather.forecast.reduce((a, d) => a + d.temp.max, 0) / weather.forecast.length)
  const avgLow = Math.round(weather.forecast.reduce((a, d) => a + d.temp.min, 0) / weather.forecast.length)
  const rainyDays = weather.forecast.filter(d => d.rain > 2).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeUp 0.4s ease' }}>

      <div className="section-label">🌤️ Weather Forecast — {weather.city}</div>

      {/* Alert */}
      {weather.alert && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1.5px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#fcd34d', lineHeight: 1.5 }}>
          {weather.alert}
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          { label: 'Avg High', value: `${avgHigh}°C`, icon: '🌡️', color: '#f87171' },
          { label: 'Avg Low', value: `${avgLow}°C`, icon: '❄️', color: '#93c5fd' },
          { label: 'Rainy Days', value: `${rainyDays}`, icon: '🌧️', color: '#818cf8' },
          { label: 'Best Wear', value: avgHigh > 30 ? 'Light' : 'Layers', icon: '👕', color: '#6ee7b7' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
            <div className="stat-val" style={{ color: s.color, fontSize: 20 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Packing hint */}
      <div style={{ background: 'rgba(16,185,129,0.08)', border: '1.5px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🎒</span>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399', marginBottom: 2 }}>Packing Tip</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{hint}</div>
        </div>
      </div>

      {/* 7-day forecast */}
      <div>
        <div className="section-label">7-Day Forecast</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {weather.forecast.map((day, i) => {
            const date = new Date(day.date)
            const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
            return (
              <div key={day.date} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'var(--bg3)', borderRadius: 12, border: '1.5px solid var(--border)', transition: 'border-color 0.15s' }}>
                <div style={{ width: 90, fontSize: 13, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? 'var(--text1)' : 'var(--text2)' }}>{dayName}</div>
                <div style={{ fontSize: 26, flexShrink: 0 }}>{day.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text2)', textTransform: 'capitalize' }}>{day.description}</div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 3 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>💧 {day.humidity}%</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>💨 {day.windSpeed} km/h</span>
                    {day.rain > 0 && <span style={{ fontSize: 11, color: '#93c5fd' }}>🌧️ {day.rain}mm</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f87171' }}>{day.temp.max}°</div>
                  <div style={{ fontSize: 12, color: '#93c5fd' }}>{day.temp.min}°</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weather advisory */}
      <div style={{ background: 'var(--bg3)', border: '1.5px solid var(--border)', borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>🌍 Travel Advisory</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            { icon: '☀️', tip: `Average temperature: ${avgLow}°C – ${avgHigh}°C` },
            { icon: '🌧️', tip: rainyDays > 0 ? `${rainyDays} rainy day${rainyDays > 1 ? 's' : ''} expected — carry umbrella` : 'Mostly dry weather expected' },
            { icon: '👗', tip: avgHigh > 35 ? 'Very hot — cotton/linen clothes recommended' : avgHigh > 28 ? 'Warm — light comfortable clothes' : 'Pleasant — light layers work well' },
            { icon: '🕐', tip: 'Best outdoor time: 7–10 AM and 4–7 PM' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
              <span style={{ flexShrink: 0 }}>{a.icon}</span>{a.tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
