import React from 'react'
import { useCart, total } from '../lib/store'
import { formatCurrency } from '../lib/format'
import { placeOrder } from '../lib/api'
import { useNavigate } from '../lib/router'

export const CheckoutPage: React.FC = () => {
  const { items, clear } = useCart()
  const navigate = useNavigate()
  async function onPlace() {
    const cart = items.map(it => ({ id: it.id, qty: it.qty }))
    const { orderId } = await placeOrder(cart)
    clear()
    navigate(`/order/${orderId}`)
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Checkout</h1>
      <div className="border border-slate-800 rounded p-3 bg-slate-900/60">
        {items.map(it => (
          <div key={it.id} className="flex justify-between py-1">
            <span>{it.title} × {it.qty}</span>
            <span>{formatCurrency(it.price * it.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t mt-2 pt-2 font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total(items))}</span>
        </div>
      </div>
      <button className="bg-cyan-600 text-white rounded px-4 py-2 w-fit shadow-[0_0_20px] shadow-cyan-500/20 disabled:opacity-50" onClick={onPlace} disabled={items.length===0}>Place order</button>
    </div>
  )
}
