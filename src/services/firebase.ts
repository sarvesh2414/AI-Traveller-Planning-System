import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import type { Trip } from '@/types'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Only init if config is provided
const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_firebase_api_key'

let app: ReturnType<typeof initializeApp> | null = null
let auth: ReturnType<typeof getAuth> | null = null
let db: ReturnType<typeof getFirestore> | null = null

if (isConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

export { auth, db, isConfigured }

// ── Auth ──────────────────────────────────────────────────
export async function signInWithGoogle(): Promise<User | null> {
  if (!auth) return null
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  return result.user
}

export async function signInEmail(email: string, password: string): Promise<User | null> {
  if (!auth) return null
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function signUpEmail(email: string, password: string): Promise<User | null> {
  if (!auth) return null
  const result = await createUserWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function logout(): Promise<void> {
  if (!auth) return
  await signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) { callback(null); return () => {} }
  return onAuthStateChanged(auth, callback)
}

// ── Firestore ─────────────────────────────────────────────
export async function saveTrip(trip: Trip, userId: string): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'trips', trip.id), { ...trip, userId })
}

export async function getUserTrips(userId: string): Promise<Trip[]> {
  if (!db) return []
  const q = query(collection(db, 'trips'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as Trip)
}

export async function deleteTripFromDB(tripId: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'trips', tripId))
}

export async function getTripById(tripId: string): Promise<Trip | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, 'trips', tripId))
  return snap.exists() ? (snap.data() as Trip) : null
}
