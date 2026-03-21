import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react'
import type { Trip, ChatMessage, NavTab, ViewTab, TripFormData, AppUser, LatLng, PackingItem, JournalEntry, SplitMember, SplitExpense } from '@/types'
import { generateItinerary, chatWithAI } from '@/services/groq'
import { onAuthChange, saveTrip as saveTripDB, getUserTrips, deleteTripFromDB, isConfigured } from '@/services/firebase'

interface State {
  currentTrip: Trip | null
  savedTrips: Trip[]
  chatMessages: ChatMessage[]
  isGenerating: boolean
  isChatting: boolean
  error: string | null
  navTab: NavTab
  viewTab: ViewTab
  userLocation: LatLng | null
  user: AppUser | null
  authLoading: boolean
  packingItems: PackingItem[]
  journalEntries: JournalEntry[]
  splitMembers: SplitMember[]
  splitExpenses: SplitExpense[]
}

type Action =
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_CHATTING'; payload: boolean }
  | { type: 'SET_TRIP'; payload: Trip }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_CHAT'; payload: ChatMessage }
  | { type: 'CLEAR_CHAT' }
  | { type: 'SET_SAVED'; payload: Trip[] }
  | { type: 'ADD_SAVED'; payload: Trip }
  | { type: 'REMOVE_SAVED'; payload: string }
  | { type: 'SET_NAV'; payload: NavTab }
  | { type: 'SET_VIEW'; payload: ViewTab }
  | { type: 'SET_LOCATION'; payload: LatLng }
  | { type: 'SET_USER'; payload: AppUser | null }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_PACKING'; payload: PackingItem[] }
  | { type: 'TOGGLE_PACKING'; payload: string }
  | { type: 'SET_JOURNAL'; payload: JournalEntry[] }
  | { type: 'UPSERT_JOURNAL'; payload: JournalEntry }
  | { type: 'SET_SPLIT_MEMBERS'; payload: SplitMember[] }
  | { type: 'SET_SPLIT_EXPENSES'; payload: SplitExpense[] }
  | { type: 'ADD_EXPENSE'; payload: SplitExpense }
  | { type: 'REMOVE_EXPENSE'; payload: string }

const LS = (k: string, d: unknown) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d } catch { return d } }

const initialState: State = {
  currentTrip: null,
  savedTrips: LS('jm3_trips', []) as Trip[],
  chatMessages: [],
  isGenerating: false,
  isChatting: false,
  error: null,
  navTab: 'plan',
  viewTab: 'itinerary',
  userLocation: null,
  user: null,
  authLoading: true,
  packingItems: LS('jm3_packing', []) as PackingItem[],
  journalEntries: LS('jm3_journal', []) as JournalEntry[],
  splitMembers: LS('jm3_members', []) as SplitMember[],
  splitExpenses: LS('jm3_expenses', []) as SplitExpense[],
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_GENERATING': return { ...state, isGenerating: action.payload }
    case 'SET_CHATTING': return { ...state, isChatting: action.payload }
    case 'SET_TRIP': return { ...state, currentTrip: action.payload, error: null, chatMessages: [], viewTab: 'itinerary' }
    case 'SET_ERROR': return { ...state, error: action.payload, isGenerating: false }
    case 'ADD_CHAT': return { ...state, chatMessages: [...state.chatMessages, action.payload] }
    case 'CLEAR_CHAT': return { ...state, chatMessages: [] }
    case 'SET_SAVED': return { ...state, savedTrips: action.payload }
    case 'ADD_SAVED': {
      const trips = [action.payload, ...state.savedTrips.filter(t => t.id !== action.payload.id)]
      localStorage.setItem('jm3_trips', JSON.stringify(trips))
      return { ...state, savedTrips: trips }
    }
    case 'REMOVE_SAVED': {
      const trips = state.savedTrips.filter(t => t.id !== action.payload)
      localStorage.setItem('jm3_trips', JSON.stringify(trips))
      return { ...state, savedTrips: trips }
    }
    case 'SET_NAV': return { ...state, navTab: action.payload }
    case 'SET_VIEW': return { ...state, viewTab: action.payload }
    case 'SET_LOCATION': return { ...state, userLocation: action.payload }
    case 'SET_USER': return { ...state, user: action.payload, authLoading: false }
    case 'SET_AUTH_LOADING': return { ...state, authLoading: action.payload }
    case 'SET_PACKING': {
      localStorage.setItem('jm3_packing', JSON.stringify(action.payload))
      return { ...state, packingItems: action.payload }
    }
    case 'TOGGLE_PACKING': {
      const items = state.packingItems.map(i => i.id === action.payload ? { ...i, checked: !i.checked } : i)
      localStorage.setItem('jm3_packing', JSON.stringify(items))
      return { ...state, packingItems: items }
    }
    case 'SET_JOURNAL': {
      localStorage.setItem('jm3_journal', JSON.stringify(action.payload))
      return { ...state, journalEntries: action.payload }
    }
    case 'UPSERT_JOURNAL': {
      const entries = state.journalEntries.filter(e => e.id !== action.payload.id)
      const updated = [action.payload, ...entries]
      localStorage.setItem('jm3_journal', JSON.stringify(updated))
      return { ...state, journalEntries: updated }
    }
    case 'SET_SPLIT_MEMBERS': {
      localStorage.setItem('jm3_members', JSON.stringify(action.payload))
      return { ...state, splitMembers: action.payload }
    }
    case 'SET_SPLIT_EXPENSES': {
      localStorage.setItem('jm3_expenses', JSON.stringify(action.payload))
      return { ...state, splitExpenses: action.payload }
    }
    case 'ADD_EXPENSE': {
      const exps = [...state.splitExpenses, action.payload]
      localStorage.setItem('jm3_expenses', JSON.stringify(exps))
      return { ...state, splitExpenses: exps }
    }
    case 'REMOVE_EXPENSE': {
      const exps = state.splitExpenses.filter(e => e.id !== action.payload)
      localStorage.setItem('jm3_expenses', JSON.stringify(exps))
      return { ...state, splitExpenses: exps }
    }
    default: return state
  }
}

interface Ctx extends State {
  generate: (form: TripFormData) => Promise<void>
  sendChat: (msg: string) => Promise<void>
  saveTrip: (trip: Trip) => void
  deleteTrip: (id: string) => void
  loadTrip: (trip: Trip) => void
  setNavTab: (tab: NavTab) => void
  setViewTab: (tab: ViewTab) => void
  clearError: () => void
  setUserLocation: (loc: LatLng) => void
  setPackingItems: (items: PackingItem[]) => void
  togglePackingItem: (id: string) => void
  upsertJournal: (entry: JournalEntry) => void
  setSplitMembers: (members: SplitMember[]) => void
  addExpense: (exp: SplitExpense) => void
  removeExpense: (id: string) => void
}

const TripContext = createContext<Ctx | null>(null)

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const unsub = onAuthChange(user => {
      if (user) {
        dispatch({ type: 'SET_USER', payload: { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL } })
        if (isConfigured) {
          getUserTrips(user.uid).then(trips => { if (trips.length) dispatch({ type: 'SET_SAVED', payload: trips }) })
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null })
      }
    })
    return unsub
  }, [])

  const generate = useCallback(async (form: TripFormData) => {
    dispatch({ type: 'SET_GENERATING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })
    try {
      const trip = await generateItinerary(form)
      dispatch({ type: 'SET_TRIP', payload: trip })
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: (e as Error).message })
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false })
    }
  }, [])

  const sendChat = useCallback(async (msg: string) => {
    dispatch({ type: 'ADD_CHAT', payload: { id: crypto.randomUUID(), role: 'user', content: msg, timestamp: new Date().toISOString() } })
    dispatch({ type: 'SET_CHATTING', payload: true })
    try {
      const reply = await chatWithAI(msg, state.chatMessages, state.currentTrip)
      dispatch({ type: 'ADD_CHAT', payload: { id: crypto.randomUUID(), role: 'assistant', content: reply, timestamp: new Date().toISOString() } })
    } catch (e) {
      dispatch({ type: 'ADD_CHAT', payload: { id: crypto.randomUUID(), role: 'assistant', content: `Error: ${(e as Error).message}`, timestamp: new Date().toISOString() } })
    } finally {
      dispatch({ type: 'SET_CHATTING', payload: false })
    }
  }, [state.chatMessages, state.currentTrip])

  const saveTrip = useCallback((trip: Trip) => {
    dispatch({ type: 'ADD_SAVED', payload: trip })
    if (state.user && isConfigured) saveTripDB(trip, state.user.uid).catch(console.error)
  }, [state.user])

  const deleteTrip = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_SAVED', payload: id })
    if (state.user && isConfigured) deleteTripFromDB(id).catch(console.error)
  }, [state.user])

  const loadTrip = useCallback((trip: Trip) => {
    dispatch({ type: 'SET_TRIP', payload: trip })
    dispatch({ type: 'SET_NAV', payload: 'plan' })
  }, [])

  return (
    <TripContext.Provider value={{
      ...state,
      generate,
      sendChat,
      saveTrip,
      deleteTrip,
      loadTrip,
      setNavTab: (tab) => dispatch({ type: 'SET_NAV', payload: tab }),
      setViewTab: (tab) => dispatch({ type: 'SET_VIEW', payload: tab }),
      clearError: () => dispatch({ type: 'SET_ERROR', payload: null }),
      setUserLocation: (loc) => dispatch({ type: 'SET_LOCATION', payload: loc }),
      setPackingItems: (items) => dispatch({ type: 'SET_PACKING', payload: items }),
      togglePackingItem: (id) => dispatch({ type: 'TOGGLE_PACKING', payload: id }),
      upsertJournal: (entry) => dispatch({ type: 'UPSERT_JOURNAL', payload: entry }),
      setSplitMembers: (members) => dispatch({ type: 'SET_SPLIT_MEMBERS', payload: members }),
      addExpense: (exp) => dispatch({ type: 'ADD_EXPENSE', payload: exp }),
      removeExpense: (id) => dispatch({ type: 'REMOVE_EXPENSE', payload: id }),
    }}>
      {children}
    </TripContext.Provider>
  )
}

export function useTrip(): Ctx {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip must be inside TripProvider')
  return ctx
}
