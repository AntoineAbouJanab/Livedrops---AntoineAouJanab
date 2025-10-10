import { describe, it, expect, vi } from 'vitest'
import * as api from '../lib/api'
import { askSupport } from './engine'

describe('Ask Support', () => {
  it('answers known policy with citation', async () => {
    const res = await askSupport('How do I create a Shoplite account and verify my email?')
    expect(res.text).toMatch(/\[Q01\]/)
  })

  it('refuses out-of-scope', async () => {
    const res = await askSupport('Tell me about quantum physics')
    expect(res.text.toLowerCase()).toMatch(/sorry/i)
  })

  it('includes order status and citation', async () => {
    vi.spyOn(api, 'getOrderStatus').mockResolvedValue({ id: 'ABCDEFGHIJ', status: 'Shipped', carrier: 'UPS', etaDays: 3 })
    const res = await askSupport('Where is my order ABCDEFGHIJ?')
    expect(res.text).toMatch(/status: Shipped/)
    expect(res.text).toMatch(/\[Q03\]/)
  })
})
