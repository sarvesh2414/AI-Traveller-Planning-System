import type { TripFormData, Trip, ChatMessage } from '@/types'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

function getKey(): string {
  const key = import.meta.env.VITE_GROQ_API_KEY
  if (!key || key === 'your_groq_api_key_here') throw new Error('Missing VITE_GROQ_API_KEY. Get free key at https://console.groq.com/')
  return key
}

async function callGroq(messages: { role: string; content: string }[], system?: string, maxTokens = 4000): Promise<string> {
  const msgs = [...(system ? [{ role: 'system', content: system }] : []), ...messages]
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getKey()}` },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, temperature: 0.7, messages: msgs }),
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error((e as { error?: { message?: string } }).error?.message || `Groq error ${res.status}`)
  }
  const d = await res.json() as { choices: { message: { content: string } }[] }
  return d.choices[0]?.message?.content?.trim() ?? ''
}

export async function generateItinerary(form: TripFormData): Promise<Trip> {
  const inr = form.budget
  const usd = Math.round(form.budget / 84)
  const prompt = `You are JourneyMap AI, expert travel planner for Indian travellers.

Create a detailed ${form.duration}-day itinerary from ${form.origin} TO ${form.destination}.

Details:
- From: ${form.origin}
- To: ${form.destination}  
- Mode: ${form.travelMode}
- Travellers: ${form.travellers}
- Style: ${form.style}
- Budget: ₹${inr.toLocaleString('en-IN')} (~$${usd} USD)
- Stay: ${form.accommodation}
- Interests: ${form.interests.join(', ')}
- Special: ${form.specialRequests || 'None'}

ALL costs MUST be in INR integers. Be specific with real place names.

Return ONLY valid JSON, no markdown:
{
  "destination": "${form.destination}",
  "origin": "${form.origin}",
  "tagline": "short tagline",
  "days": [{"dayNum":1,"title":"theme","area":"area name","activities":[{"time":"9:00 AM","name":"name","description":"description","type":"visit","cost":500}]}],
  "essentials": {"mustPack":["item"],"localTips":["tip"],"warnings":["warn"],"transport":["tip"]},
  "budget": {"accommodation":20000,"food":8000,"activities":6000,"transport":5000,"shopping":11000,"total":50000},
  "stats": {"attractions":15,"restaurants":10,"neighborhoods":5,"walkingKm":25}
}`

  const raw = await callGroq([{ role: 'user', content: prompt }])
  const clean = raw.replace(/```json|```/g, '').trim()
  const data = JSON.parse(clean) as Omit<Trip, 'id' | 'createdAt'>
  return { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
}

export async function generatePackingList(destination: string, duration: number, interests: string[], weather: string): Promise<string> {
  const prompt = `Generate a detailed packing list for a ${duration}-day trip to ${destination}.
Interests: ${interests.join(', ')}
Weather: ${weather}

Return ONLY valid JSON:
{
  "Clothes": [{"name":"item","essential":true}],
  "Documents": [{"name":"item","essential":true}],
  "Medicine": [{"name":"item","essential":false}],
  "Electronics": [{"name":"item","essential":false}],
  "Toiletries": [{"name":"item","essential":false}],
  "Miscellaneous": [{"name":"item","essential":false}]
}`
  return callGroq([{ role: 'user', content: prompt }], undefined, 1000)
}

export async function chatWithAI(message: string, history: ChatMessage[], trip: Trip | null): Promise<string> {
  const system = trip
    ? `You are JourneyMap AI assistant for Indian travellers. Trip: ${trip.origin} → ${trip.destination} (${trip.days.length} days). Budget: ₹${trip.budget.total.toLocaleString('en-IN')}. Always use ₹ INR. Be concise (2-4 sentences).`
    : `You are JourneyMap AI for Indian travellers. Always use ₹ INR. Be concise.`
  const msgs = [...history.slice(-6).map(m => ({ role: m.role, content: m.content })), { role: 'user', content: message }]
  return callGroq(msgs, system, 400)
}
