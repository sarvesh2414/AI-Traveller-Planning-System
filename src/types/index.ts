export type ActivityType = 'visit' | 'eat' | 'stay' | 'move' | 'leisure'
export type TravelMode = 'driving' | 'walking' | 'cycling' | 'transit'
export type TravellerType = 'solo' | 'couple' | 'family' | 'group'
export type TravelStyle = 'backpacker' | 'mid-range' | 'luxury' | 'business'
export type AccommodationType = 'hotel' | 'airbnb' | 'hostel' | 'ryokan' | 'resort'
export type NavTab = 'plan' | 'saved' | 'insights'
export type ViewTab = 'itinerary' | 'map' | 'weather' | 'budget' | 'splitter' | 'packing' | 'journal'

export interface LatLng { lat: number; lng: number }

export interface Activity {
  time: string
  name: string
  description: string
  type: ActivityType
  cost?: number
}

export interface TripDay {
  dayNum: number
  title: string
  area: string
  activities: Activity[]
}

export interface TripEssentials {
  mustPack: string[]
  localTips: string[]
  warnings: string[]
  transport: string[]
}

export interface TripBudget {
  accommodation: number
  food: number
  activities: number
  transport: number
  shopping: number
  total: number
}

export interface TripStats {
  attractions: number
  restaurants: number
  neighborhoods: number
  walkingKm: number
}

export interface Trip {
  id: string
  origin: string
  destination: string
  tagline: string
  days: TripDay[]
  essentials: TripEssentials
  budget: TripBudget
  stats: TripStats
  createdAt: string
  userId?: string
}

export interface TripFormData {
  origin: string
  destination: string
  startDate: string
  duration: number
  travellers: TravellerType
  style: TravelStyle
  budget: number
  interests: string[]
  accommodation: AccommodationType
  travelMode: TravelMode
  specialRequests: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface WeatherDay {
  date: string
  temp: { min: number; max: number }
  description: string
  icon: string
  humidity: number
  windSpeed: number
  rain: number
}

export interface WeatherData {
  city: string
  forecast: WeatherDay[]
  alert?: string
}

export interface SplitMember {
  id: string
  name: string
  color: string
}

export interface SplitExpense {
  id: string
  title: string
  amount: number
  paidBy: string
  splitAmong: string[]
  category: string
  date: string
}

export interface PackingItem {
  id: string
  name: string
  category: string
  checked: boolean
  essential: boolean
}

export interface JournalEntry {
  id: string
  dayNum: number
  date: string
  mood: string
  notes: string
  rating: number
  activities: { name: string; done: boolean }[]
}

export interface AppUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface NearbyPlace {
  id: string
  name: string
  type: string
  address: string
  distance: string
  rating?: number
  price?: string
  lat: number
  lng: number
}
