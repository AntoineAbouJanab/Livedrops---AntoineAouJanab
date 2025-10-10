import React, { useEffect, useState } from 'react'
import { useParams } from '../lib/router'
import { getOrderStatus } from '../lib/api'

export const OrderStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [status, setStatus] = useState<any>()
  useEffect(() => { getOrderStatus(id).then(setStatus) }, [id])
  if (!status) return <div>Looking up order...</div>
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-semibold">Order {maskId(id)}</h1>
      <div>Status: <span className="font-medium text-cyan-300">{status.status}</span></div>
      {(status.status === 'Shipped' || status.status === 'Delivered') && (
        <div className="text-slate-300">Carrier: {status.carrier} · ETA: {status.etaDays} days</div>
      )}
    </div>
  )
}

function maskId(id: string) {
  if (!id) return ''
  return '••••' + id.slice(-4)
}
