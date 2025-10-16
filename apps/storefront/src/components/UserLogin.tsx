import React, { useState } from 'react'

type Props = { onIdentified: (customer: any) => void }

export default function UserLogin({ onIdentified }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL

  async function lookup() {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/customers?email=${encodeURIComponent(email)}`)
      if (!res.ok) throw new Error('Not found')
      const customer = await res.json()
      onIdentified(customer)
    } catch {
      setError('Customer not found')
    } finally {
      setLoading(false)
    }
  }

  if (!API_BASE) return <div className="p-3 text-sm text-amber-700">Set VITE_API_BASE_URL to enable login.</div>

  return (
    <div className="flex items-center gap-2">
      <input
        aria-label="Email"
        className="border rounded px-2 py-1"
        placeholder="you@example.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <button className="bg-black text-white px-3 py-1 rounded" onClick={lookup} disabled={loading || !email}>
        {loading ? 'Checking...' : 'Continue'}
      </button>
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </div>
  )
}

