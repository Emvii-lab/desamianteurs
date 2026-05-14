import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  headers: vi.fn(),
  cookies: vi.fn().mockResolvedValue({ getAll: vi.fn().mockReturnValue([]) }),
}))
vi.mock('@/lib/stripe', () => ({ getStripe: vi.fn() }))
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn() }))

import { POST } from '@/app/api/stripe/webhook/route'
import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const mockUpdateEq = vi.fn().mockResolvedValue({ error: null })
const mockAdmin = {
  from: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnValue({ eq: mockUpdateEq }),
  }),
}

const mockStripe = {
  webhooks: { constructEvent: vi.fn() },
}

function buildHeaders(sig: string | null) {
  return { get: vi.fn((key: string) => (key === 'stripe-signature' ? sig : null)) }
}

function makeReq(body = '{}') {
  return new Request('http://localhost/api/stripe/webhook', { method: 'POST', body })
}

function makeEvent(type: string, data: object) {
  return { type, data: { object: data } }
}

beforeEach(() => {
  vi.mocked(getStripe).mockReturnValue(mockStripe as any)
  vi.mocked(createClient).mockReturnValue(mockAdmin as any)
  mockStripe.webhooks.constructEvent.mockReset()
  mockUpdateEq.mockReset()
  mockUpdateEq.mockResolvedValue({ error: null })
  mockAdmin.from.mockReset()
  mockAdmin.from.mockReturnValue({ update: vi.fn().mockReturnValue({ eq: mockUpdateEq }) })
})

describe('POST /api/stripe/webhook', () => {
  it('retourne 400 si la signature Stripe est absente', async () => {
    vi.mocked(headers).mockResolvedValue(buildHeaders(null) as any)
    const res = await POST(makeReq())
    expect(res.status).toBe(400)
  })

  it('retourne 400 si la signature Stripe est invalide', async () => {
    vi.mocked(headers).mockResolvedValue(buildHeaders('bad-sig') as any)
    mockStripe.webhooks.constructEvent.mockImplementationOnce(() => {
      throw new Error('Invalid signature')
    })
    const res = await POST(makeReq())
    expect(res.status).toBe(400)
  })

  it('met à jour le partenaire sur checkout.session.completed', async () => {
    vi.mocked(headers).mockResolvedValue(buildHeaders('valid-sig') as any)
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(
      makeEvent('checkout.session.completed', {
        client_reference_id: 'user-1',
        customer: 'cus_123',
        metadata: { plan: 'premium' },
      })
    )
    const res = await POST(makeReq())
    expect(res.status).toBe(200)
    expect(mockAdmin.from).toHaveBeenCalledWith('partners')
    expect(mockUpdateEq).toHaveBeenCalledWith('user_id', 'user-1')
  })

  it('note le plan d\'abonnement si présent dans les métadonnées', async () => {
    vi.mocked(headers).mockResolvedValue(buildHeaders('valid-sig') as any)
    const updateMock = vi.fn().mockReturnValue({ eq: mockUpdateEq })
    mockAdmin.from.mockReturnValue({ update: updateMock })

    mockStripe.webhooks.constructEvent.mockReturnValueOnce(
      makeEvent('checkout.session.completed', {
        client_reference_id: 'user-1',
        customer: 'cus_123',
        metadata: { plan: 'essentiel' },
      })
    )
    await POST(makeReq())
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ subscription: 'essentiel', validation_fee_paid: true })
    )
  })

  it('retourne 200 et ignore les événements inconnus', async () => {
    vi.mocked(headers).mockResolvedValue(buildHeaders('valid-sig') as any)
    mockStripe.webhooks.constructEvent.mockReturnValueOnce(
      makeEvent('customer.created', { id: 'cus_new' })
    )
    const res = await POST(makeReq())
    expect(res.status).toBe(200)
    expect(mockAdmin.from).not.toHaveBeenCalled()
  })
})
