import React, { useEffect, useRef, useState } from 'react'
import { askSupport } from '../../assistant/engine'
import { useUser } from '../../lib/user'
import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'

export const SupportPanel: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [a, setA] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [slow, setSlow] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const firstRef = useRef<HTMLInputElement>(null)
  const customer = useUser(s => s.customer)

  useEffect(() => { if (open) firstRef.current?.focus() }, [open])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    function onFocus(e: FocusEvent) {
      if (!open) return
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        e.stopPropagation(); panelRef.current.querySelector<HTMLElement>('[tabindex],button,input,textarea,select,a')?.focus()
      }
    }
    document.addEventListener('focusin', onFocus)
    return () => document.removeEventListener('focusin', onFocus)
  }, [open])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSlow(false)
    setA('…')
    const slowTimer = setTimeout(() => setSlow(true), 1500)
    try {
      const res = await askSupport(q, customer?.email || undefined)
      setA(res.text)
    } finally {
      clearTimeout(slowTimer)
      setLoading(false)
    }
  }

  return (
    <>
      <button className="fixed bottom-4 right-4 bg-cyan-600 text-white rounded-full px-4 py-2 shadow-[0_0_20px] shadow-cyan-500/30" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>Ask Support</button>
      {open && (
        <div className="fixed inset-0 z-20" role="dialog" aria-modal="true" aria-label="Ask Support Panel">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)}></div>
          <div ref={panelRef} className="absolute top-0 right-0 h-full w-full max-w-md bg-slate-900/90 backdrop-blur border-l border-slate-800 shadow-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Ask Support</h2>
              <button onClick={() => setOpen(false)} aria-label="Close support">✕</button>
            </div>
            <form onSubmit={onSubmit} className="flex gap-2 items-center">
              <Input ref={firstRef as any} value={q} onChange={e => setQ(e.target.value)} placeholder="Type your question or order id" aria-label="Support question" disabled={loading} />
              <Button type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send'}</Button>
              </form>
            <div className="text-sm whitespace-pre-wrap bg-slate-900/60 border border-slate-800 rounded p-3 min-h-[6rem]" aria-live="polite">
              {a}
              {slow && loading && '\nTaking a bit longer than usual…'}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
