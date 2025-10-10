import React from 'react'
import { useCart, total } from '../lib/store'
import { formatCurrency } from '../lib/format'
import { useNavigate } from '../lib/router'

export const CartPage: React.FC = () => {
  const { items, setQty, remove } = useCart()
  const navigate = useNavigate()
  const sum = total(items)
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Your Cart</h1>
      {items.length === 0 && <div>Your cart is empty.</div>}
      {items.map(it => (
        <div key={it.id} className="flex items-center gap-3 border border-slate-800 rounded p-3 bg-slate-900/60">
          <img src={it.image} alt={it.title} className="w-16 h-16 object-contain bg-slate-800 rounded" />
          <div className="flex-1">
            <div className="font-medium">{it.title}</div>
            <div className="text-slate-600">{formatCurrency(it.price)}</div>
          </div>
          <label className="flex items-center gap-2">Qty
            <input aria-label={`Quantity for ${it.title}`} className="border border-slate-800 bg-slate-900/60 rounded px-2 py-1 w-16" type="number" min={1} value={it.qty} onChange={e => setQty(it.id, Number(e.target.value))} />
          </label>
          <button className="text-rose-400 hover:text-rose-300" onClick={() => remove(it.id)} aria-label={`Remove ${it.title}`}>Remove</button>
        </div>
      ))}
      {items.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Total: {formatCurrency(sum)}</div>
          <button className="bg-cyan-600 text-white rounded px-4 py-2 shadow-[0_0_20px] shadow-cyan-500/20" onClick={() => navigate('/checkout')}>Checkout</button>
        </div>
      )}
    </div>
  )
}
