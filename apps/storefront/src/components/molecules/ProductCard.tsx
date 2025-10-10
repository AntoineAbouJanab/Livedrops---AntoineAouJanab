import React from 'react'
import { Button } from '../atoms/Button'
import { formatCurrency } from '../../lib/format'
import { Link } from '../../lib/router'

type Props = { id: string; title: string; price: number; image: string; onAdd: () => void }
export const ProductCard: React.FC<Props> = ({ id, title, price, image, onAdd }) => (
  <div className="border border-slate-800 rounded-lg p-3 flex flex-col gap-2 bg-slate-900/60 backdrop-blur">
    <Link href={`/p/${id}`} className="block aspect-square overflow-hidden rounded bg-slate-800">
      <img src={image} alt={title} loading="lazy" className="w-full h-full object-contain" />
    </Link>
    <Link href={`/p/${id}`} className="font-medium line-clamp-2 min-h-[2.5rem] hover:text-cyan-400 transition">{title}</Link>
    <div className="flex items-center justify-between">
      <div className="font-semibold text-cyan-300">{formatCurrency(price)}</div>
      <Button onClick={onAdd} aria-label={`Add ${title} to cart`}>Add to Cart</Button>
    </div>
  </div>
)
