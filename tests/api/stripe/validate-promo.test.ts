import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/stripe', () => ({ getStripe: vi.fn() }))

import { GET } from '@/app/api/stripe/validate-promo/route'
import { getStripe } from '@/lib/stripe'

const mockStripe = { promotionCodes: { list: vi.fn() } }

beforeEach(() => {
  vi.mocked(getStripe).mockReturnValue(mockStripe as any)
  mockStripe.promotionCodes.list.mockReset()
})

function makeReq(code?: string) {
  const url = code
    ? `http://localhost/api/stripe/validate-promo?code=${code}`
    : 'http://localhost/api/stripe/validate-promo'
  return new Request(url)
}

describe('GET /api/stripe/validate-promo', () => {
  it('retourne valid:false si le paramètre code est absent', async () => {
    const res = await GET(makeReq())
    const json = await res.json()
    expect(json.valid).toBe(false)
    expect(json.error).toMatch(/requis/i)
  })

  it('retourne valid:false si le code est inconnu ou expiré', async () => {
    mockStripe.promotionCodes.list.mockResolvedValueOnce({ data: [] })
    const res = await GET(makeReq('INCONNU'))
    const json = await res.json()
    expect(json.valid).toBe(false)
    expect(json.error).toMatch(/invalide|expiré/i)
  })

  it('retourne valid:true avec percentOff pour un code valide', async () => {
    mockStripe.promotionCodes.list.mockResolvedValueOnce({
      data: [{ id: 'promo_1', coupon: { percent_off: 20, amount_off: null } }],
    })
    const res = await GET(makeReq('PROMO20'))
    const json = await res.json()
    expect(json.valid).toBe(true)
    expect(json.percentOff).toBe(20)
    expect(json.isFull).toBe(false)
    expect(json.label).toMatch(/20%/i)
  })

  it('retourne isFull:true et label approprié pour un code 100%', async () => {
    mockStripe.promotionCodes.list.mockResolvedValueOnce({
      data: [{ id: 'promo_full', coupon: { percent_off: 100, amount_off: null } }],
    })
    const res = await GET(makeReq('GRATUIT'))
    const json = await res.json()
    expect(json.isFull).toBe(true)
    expect(json.label).toMatch(/offerts|100%/i)
  })

  it('normalise le code en majuscules avant d\'interroger Stripe', async () => {
    mockStripe.promotionCodes.list.mockResolvedValueOnce({ data: [] })
    await GET(makeReq('promo20'))
    expect(mockStripe.promotionCodes.list).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'PROMO20' })
    )
  })
})
