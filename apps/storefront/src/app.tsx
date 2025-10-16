import React from 'react'
import { Router, Link, Route, useNavigate } from './lib/router'
import { CatalogPage } from './pages/catalog'
import { ProductPage } from './pages/product'
import { CartPage } from './pages/cart'
import { CheckoutPage } from './pages/checkout'
import { OrderStatusPage } from './pages/order-status'
import { useCart } from './lib/store'
import { SupportPanel } from './components/organisms/SupportPanel'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/login'
import { useUser } from './lib/user'

export const App: React.FC = () => {
  // Expose API base globally for libs that read at runtime
  ;(window as any).__API_BASE__ = (import.meta as any).env?.VITE_API_BASE_URL
  console.log('VITE_API_BASE_URL=', (import.meta as any).env?.VITE_API_BASE_URL)
  return (
    <Router>
      <Shell />
    </Router>
  )
}

const Shell: React.FC = () => {
  const cartCount = useCart((s) => s.items.reduce((a, it) => a + it.qty, 0))
  const navigate = useNavigate()
  console.log('VITE_API_BASE_URL=', (import.meta as any).env?.VITE_API_BASE_URL)
  const customer = useUser(s => s.customer)
  const setCustomer = useUser(s => s.setCustomer)
  const logout = () => { setCustomer(null); navigate('/login') }
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-slate-900/60 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="font-semibold hover:text-cyan-400 transition">Storefront</Link>
          <nav className="ml-auto flex items-center gap-4">
            <Link href="/" className="hover:text-cyan-400 transition">Catalog</Link>
            <Link href="/admin" className="hover:text-cyan-400 transition">Admin</Link>
            {!customer && (<Link href="/login" className="hover:text-cyan-400 transition">Login</Link>)}
            {customer && (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="hidden sm:inline">Logged in as</span>
                <span className="font-medium text-white">{customer.email}</span>
                <button className="ml-2 px-2 py-0.5 border border-slate-600 rounded hover:bg-slate-800" onClick={logout}>Logout</button>
              </div>
            )}
            <button className="relative hover:text-cyan-400 transition" onClick={() => navigate('/cart')} aria-label="Open cart">
              Cart
              {cartCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center text-xs bg-cyan-600 text-white rounded-full px-2">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Route path="/" component={<CatalogPage />} />
        <Route path="/p/:id" component={<ProductPage />} />
        <Route path="/cart" component={<CartPage />} />
        <Route path="/checkout" component={<CheckoutPage />} />
        <Route path="/order/:id" component={<OrderStatusPage />} />
        <Route path="/admin" component={<AdminDashboard />} />
        <Route path="/login" component={<LoginPage />} />
      </main>
      <SupportPanel />
      <footer className="border-t border-slate-800 text-sm text-slate-400 py-4 text-center">Storefront v1</footer>
    </div>
  )
}
