import type { WeatherData, WeatherDay } from '@/types'

const BASE = 'https://api.openweathermap.org/data/2.5'

function getKey(): string {
  return import.meta.env.VITE_WEATHER_API_KEY || ''
}

const WEATHER_ICONS: Record<string, string> = {
  '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '⛅',
  '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
  '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
  '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
  '50d': '🌫️', '50n': '🌫️',
}

export async function getWeatherForecast(city: string): Promise<WeatherData | null> {
  const key = getKey()
  if (!key || key === 'your_openweathermap_key') return getMockWeather(city)

  try {
    const res = await fetch(`${BASE}/forecast?q=${encodeURIComponent(city)}&appid=${key}&units=metric&cnt=40`)
    if (!res.ok) return getMockWeather(city)
    const data = await res.json() as {
      city: { name: string }
      list: {
        dt_txt: string
        main: { temp: number; temp_min: number; temp_max: number; humidity: number }
        weather: { description: string; icon: string }[]
        wind: { speed: number }
        rain?: { '3h': number }
      }[]
    }

    // Group by day
    const byDay: Record<string, typeof data.list> = {}
    data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0]
      if (!byDay[date]) byDay[date] = []
      byDay[date].push(item)
    })

    const forecast: WeatherDay[] = Object.entries(byDay).slice(0, 7).map(([date, items]) => {
      const temps = items.map(i => i.main.temp)
      const midday = items.find(i => i.dt_txt.includes('12:00')) || items[0]
      return {
        date,
        temp: { min: Math.round(Math.min(...temps)), max: Math.round(Math.max(...temps)) },
        description: midday.weather[0].description,
        icon: WEATHER_ICONS[midday.weather[0].icon] || '🌤️',
        humidity: Math.round(midday.main.humidity),
        windSpeed: Math.round(midday.wind.speed * 3.6),
        rain: Math.round((midday.rain?.['3h'] || 0) * 8),
      }
    })

    const hasRain = forecast.some(d => d.rain > 2)
    const highHumidity = forecast.some(d => d.humidity > 80)

    return {
      city: data.city.name,
      forecast,
      alert: hasRain ? '🌧️ Rain expected — pack an umbrella!' : highHumidity ? '💧 High humidity — pack light breathable clothes' : undefined,
    }
  } catch {
    return getMockWeather(city)
  }
}

function getMockWeather(city: string): WeatherData {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const icons = ['☀️', '⛅', '🌦️', '☀️', '☁️', '☀️', '⛅']
  const descs = ['Clear sky', 'Partly cloudy', 'Light rain', 'Sunny', 'Overcast', 'Clear sky', 'Few clouds']
  const today = new Date()

  return {
    city,
    forecast: Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      return {
        date: d.toISOString().split('T')[0],
        temp: { min: 22 + Math.floor(Math.random() * 4), max: 32 + Math.floor(Math.random() * 6) },
        description: descs[i],
        icon: icons[i],
        humidity: 55 + Math.floor(Math.random() * 30),
        windSpeed: 10 + Math.floor(Math.random() * 20),
        rain: i === 2 ? 8 : 0,
      }
    }),
    alert: '⚠️ Using demo weather data — add OpenWeatherMap API key for live data',
  }
}

export function getPackingWeatherHint(forecast: WeatherDay[]): string {
  const avgTemp = forecast.reduce((a, d) => a + d.temp.max, 0) / forecast.length
  const hasRain = forecast.some(d => d.rain > 2)
  if (avgTemp > 35) return 'Very hot — pack light cotton clothes, sunscreen, water bottle'
  if (avgTemp > 28) return 'Warm — pack light clothes, sunscreen, hat'
  if (avgTemp > 20) return 'Pleasant — pack light layers'
  if (hasRain) return 'Rainy season — pack waterproof jacket, umbrella'
  return 'Mild weather — pack comfortable layers'
}
