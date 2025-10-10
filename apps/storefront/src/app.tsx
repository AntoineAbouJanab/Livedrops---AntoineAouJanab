import React from 'react'
import { Router, Link, Route, useNavigate } from './lib/router'
import { CatalogPage } from './pages/catalog'
import { ProductPage } from './pages/product'
import { CartPage } from './pages/cart'
import { CheckoutPage } from './pages/checkout'
import { OrderStatusPage } from './pages/order-status'
import { useCart } from './lib/store'
import { SupportPanel } from './components/organisms/SupportPanel'

export const App: React.FC = () => {
  return (
    <Router>
      <Shell />
    </Router>
  )
}

const Shell: React.FC = () => {
  const cartCount = useCart((s) => s.items.reduce((a, it) => a + it.qty, 0))
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-slate-900/60 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="font-semibold hover:text-cyan-400 transition">Storefront</Link>
          <nav className="ml-auto flex items-center gap-4">
            <Link href="/" className="hover:text-cyan-400 transition">Catalog</Link>
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
      </main>
      <SupportPanel />
      <footer className="border-t border-slate-800 text-sm text-slate-400 py-4 text-center">Storefront v1</footer>
    </div>
  )
}
