import React, { useEffect, useMemo, useState } from 'react'
import { listProducts } from '../lib/api'
import { useCart } from '../lib/store'
import { ProductCard } from '../components/molecules/ProductCard'

export const CatalogPage: React.FC = () => {
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [sort, setSort] = useState<'price-asc'|'price-desc'>('price-asc')
  const [products, setProducts] = useState<any[]>([])
  const add = useCart(s => s.add)

  useEffect(() => { listProducts().then(setProducts) }, [])

  const tags = useMemo(() => Array.from(new Set(products.flatMap(p => p.tags))), [products])
  const filtered = useMemo(() => {
    const tokens = q.toLowerCase().split(/\s+/).filter(Boolean)
    let out = products.filter(p => {
      const hay = (p.title + ' ' + p.tags.join(' ')).toLowerCase()
      const okQ = tokens.every(t => hay.includes(t))
      const okTag = tag ? p.tags.includes(tag) : true
      return okQ && okTag
    })
    out.sort((a,b) => sort === 'price-asc' ? a.price - b.price : b.price - a.price)
    return out
  }, [products, q, tag, sort])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-center">
        <input className="border border-slate-800 bg-slate-900/60 rounded px-3 py-2" placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} aria-label="Search products" />
        <select className="border border-slate-800 bg-slate-900/60 rounded px-3 py-2" value={sort} onChange={e=>setSort(e.target.value as any)} aria-label="Sort">
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
        </select>
        <select className="border border-slate-800 bg-slate-900/60 rounded px-3 py-2" value={tag} onChange={e=>setTag(e.target.value)} aria-label="Tag filter">
          <option value="">All tags</option>
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map(p => (
          <ProductCard key={p.id} id={p.id} title={p.title} price={p.price} image={p.image} onAdd={() => add({ id: p.id, title: p.title, price: p.price, image: p.image })} />
        ))}
      </div>
    </div>
  )
}
