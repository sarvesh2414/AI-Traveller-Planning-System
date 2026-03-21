import type { TripFormData } from '@/types'

export const INTERESTS = [
  { label: '🏛️ Culture', value: 'Culture' },
  { label: '🍜 Food & Dining', value: 'Food & Dining' },
  { label: '🏔️ Adventure', value: 'Adventure' },
  { label: '📸 Photography', value: 'Photography' },
  { label: '🏖️ Beaches', value: 'Beaches' },
  { label: '🌿 Nature', value: 'Nature' },
  { label: '🛍️ Shopping', value: 'Shopping' },
  { label: '🎭 Nightlife', value: 'Nightlife' },
  { label: '🧘 Wellness', value: 'Wellness' },
  { label: '🎨 Art', value: 'Art' },
  { label: '🏺 Heritage', value: 'Heritage' },
  { label: '🎪 Festivals', value: 'Festivals' },
]

export const TRAVEL_MODES = [
  { value: 'driving', label: 'Car', icon: '🚗' },
  { value: 'cycling', label: 'Bike', icon: '🏍️' },
  { value: 'walking', label: 'Walk', icon: '🚶' },
  { value: 'transit', label: 'Transit', icon: '🚌' },
]

export const ACTIVITY_COLORS: Record<string, string> = {
  visit: '#6366f1', eat: '#f59e0b', stay: '#10b981', move: '#ef4444', leisure: '#8b5cf6',
}

export const ACTIVITY_LABELS: Record<string, string> = {
  visit: '🏛️ Visit', eat: '🍽️ Eat', stay: '🏨 Stay', move: '🚇 Move', leisure: '🌿 Leisure',
}

export const DAY_COLORS = [
  { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
  { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  { bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
  { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
  { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa' },
  { bg: 'rgba(236,72,153,0.15)', text: '#f472b6' },
  { bg: 'rgba(20,184,166,0.15)', text: '#2dd4bf' },
]

export const DAY_PIN_COLORS = ['#818cf8', '#fbbf24', '#34d399', '#f87171', '#a78bfa', '#f472b6', '#2dd4bf']

export const MEMBER_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export const EXPENSE_CATEGORIES = ['🍜 Food', '🏨 Hotel', '🚗 Transport', '🎟️ Activity', '🛍️ Shopping', '💊 Medical', '📱 Other']

export const DEFAULT_FORM: TripFormData = {
  origin: 'Chennai, India',
  destination: 'Mumbai, India',
  startDate: new Date().toISOString().split('T')[0],
  duration: 5,
  travellers: 'couple',
  style: 'mid-range',
  budget: 50000,
  interests: ['Culture', 'Food & Dining', 'Photography'],
  accommodation: 'hotel',
  travelMode: 'driving',
  specialRequests: '',
}

export const QUICK_CHAT_PROMPTS = [
  { label: '🍜 Local food', prompt: 'Best local food to try with prices in ₹?' },
  { label: '💰 Budget tips', prompt: 'How to save money on this trip in ₹ INR?' },
  { label: '🎒 What to pack', prompt: 'Complete packing list for this trip?' },
  { label: '🚗 Getting around', prompt: 'Best transport options with ₹ costs?' },
]
