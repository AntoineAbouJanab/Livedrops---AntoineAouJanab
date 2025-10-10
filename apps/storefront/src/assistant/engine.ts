import qa from './ground-truth.json'
import { getOrderStatus } from '../lib/api'

type Answer = { text: string }

const ORDER_RE = /\b[A-Z0-9]{10,}\b/g
const ORDER_QID = qa.find((item) => item.category.toLowerCase() === 'order')?.qid ?? 'Q05'

function score(query: string, text: string) {
  const q = query.toLowerCase().split(/\W+/).filter(Boolean)
  const t = text.toLowerCase()
  let s = 0
  for (const tok of q) if (t.includes(tok)) s += 1
  return s / Math.max(1, q.length)
}

function cite(qid: string) {
  return `[${qid}]`
}

function maskId(id: string) {
  return '••••' + id.slice(-4)
}

export async function askSupport(query: string): Promise<Answer> {
  const orderIds = query.toUpperCase().match(ORDER_RE) || []
  if (orderIds.length) {
    const orderId = orderIds[0]!
    const info = await getOrderStatus(orderId)
    if (info) {
      const base = `Order ${maskId(orderId)} status: ${info.status}.`
      const extra = (info.status === 'Shipped' || info.status === 'Delivered') ? ` Carrier: ${info.carrier ?? 'TBD'}. ETA: ${info.etaDays ?? 'TBD'} days.` : ''
      return { text: base + extra + ' ' + cite(ORDER_QID) }
    }
  }

  const ranked = qa
    .map(item => ({ item, s: Math.max(score(query, item.question), score(query, item.answer)) }))
    .sort((a,b) => b.s - a.s)
  const best = ranked[0]
  if (!best || best.s < 0.35) {
    return { text: "Sorry, I can't help with that. I can answer store policies and order status questions." }
  }
  return { text: `${best.item.answer} ${cite(best.item.qid)}` }
}
