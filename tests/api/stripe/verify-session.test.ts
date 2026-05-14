import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase-server', () => ({ createServerSupabase: vi.fn() }))
vi.mock('@/lib/stripe', () => ({ getStripe: vi.fn() }))

import { GET } from '@/app/api/stripe/verify-session/route'
import { createServerSupabase } from '@/lib/supabase-server'
import { getStripe } from '@/lib/stripe'

const mockStripe = {
  checkout: {
    sessions: {
      retrieve: vi.fn().mockResolvedValue({ payment_status: 'paid', customer_details: { email: 'test@example.com' } }),
    },
  },
}

function buildSupabase({ user = { id: 'user-1' }, partnerData = { id: 'partner-1' } } = {}) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: partnerData, error: null }),
          }),
        }),
      }),
    }),
  }
}

function makeReq(sessionId?: string) {
  const url = sessionId
    ? `http://localhost/api/stripe/verify-session?session_id=${sessionId}`
    : 'http://localhost/api/stripe/verify-session'
  return new Request(url)
}

beforeEach(() => {
  vi.mocked(getStripe).mockReturnValue(mockStripe as any)
  mockStripe.checkout.sessions.retrieve.mockReset()
  mockStripe.checkout.sessions.retrieve.mockResolvedValue({
    payment_status: 'paid',
    customer_details: { email: 'test@example.com' },
  })
})

describe('GET /api/stripe/verify-session', () => {
  it('retourne 401 si non authentifié', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(buildSupabase({ user: null as any }) as any)
    const res = await GET(makeReq('cs_test_123'))
    expect(res.status).toBe(401)
  })

  it('retourne 400 si session_id absent', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(buildSupabase() as any)
    const res = await GET(makeReq())
    expect(res.status).toBe(400)
  })

  it('retourne 404 si la session n\'appartient pas à l\'utilisateur', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(buildSupabase({ partnerData: null as any }) as any)
    const res = await GET(makeReq('cs_other_user'))
    expect(res.status).toBe(404)
  })

  it('retourne paid:true et l\'email si le paiement est validé', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(buildSupabase() as any)
    const res = await GET(makeReq('cs_test_123'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.paid).toBe(true)
    expect(json.email).toBe('test@example.com')
    expect(json.status).toBe('paid')
  })

  it('retourne paid:false si le paiement est en attente', async () => {
    mockStripe.checkout.sessions.retrieve.mockResolvedValueOnce({
      payment_status: 'unpaid',
      customer_details: { email: 'test@example.com' },
    })
    vi.mocked(createServerSupabase).mockResolvedValue(buildSupabase() as any)
    const res = await GET(makeReq('cs_test_123'))
    const json = await res.json()
    expect(json.paid).toBe(false)
  })
})
