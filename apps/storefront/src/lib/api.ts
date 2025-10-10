export type Product = { id: string; title: string; price: number; image: string; tags: string[]; stockQty: number; description?: string }

const ORDERS_KEY = 'sf_orders_v1'
type OrderInfo = { id: string; status: 'Placed'|'Packed'|'Shipped'|'Delivered'; carrier?: string; etaDays?: number }

function loadOrders(): Record<string, OrderInfo> { try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '{}') } catch { return {} } }
function saveOrders(map: Record<string, OrderInfo>) { localStorage.setItem(ORDERS_KEY, JSON.stringify(map)) }

export async function listProducts(): Promise<Product[]> {
  const res = await fetch('/mock-catalog.json')
  const data: Product[] = await res.json()
  return data
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const list = await listProducts()
  return list.find(p => p.id === id)
}

export async function placeOrder(cart: { id: string; qty: number }[]) {
  const orderId = randomId(12)
  const map = loadOrders()
  map[orderId] = { id: orderId, status: 'Placed' }
  saveOrders(map)
  return { orderId }
}

export async function getOrderStatus(id: string): Promise<OrderInfo | undefined> {
  const map = loadOrders()
  let info = map[id]
  if (!info) return undefined
  // Simulate simple progression on access
  const steps: OrderInfo['status'][] = ['Placed','Packed','Shipped','Delivered']
  const idx = steps.indexOf(info.status)
  if (idx >= 0 && idx < steps.length - 1) {
    // 30% chance to move to next state
    if (Math.random() < 0.3) {
      info = { ...info, status: steps[idx + 1] }
      if (info.status === 'Shipped') info = { ...info, carrier: 'UPS', etaDays: 3 }
      saveOrders({ ...map, [id]: info })
    }
  }
  return info
}

function randomId(len: number) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let s = ''
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random()*chars.length)]
  return s
}

