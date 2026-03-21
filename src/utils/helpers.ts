export const USD_TO_INR = 84
export function inrFull(n: number): string { return '₹' + n.toLocaleString('en-IN') }
export function inrShort(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}
export function percentOf(v: number, t: number): number { return t ? Math.round((v / t) * 100) : 0 }
export function formatDate(s: string): string {
  return new Date(s).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
}
export function generateId(): string { return crypto.randomUUID() }
