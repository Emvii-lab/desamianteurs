import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase-server', () => ({ createServerSupabase: vi.fn() }))
vi.mock('@/lib/stripe', () => ({ getStripe: vi.fn() }))

import { POST } from '@/app/api/stripe/create-checkout/route'
import { createServerSupabase } from '@/lib/supabase-server'
import { getStripe } from '@/lib/stripe'

const mockSession = { id: 'cs_test_123', url: 'https://checkout.stripe.com/pay/cs_test_123' }

const mockStripe = {
  checkout: { sessions: { create: vi.fn().mockResolvedValue(mockSession) } },
}

function buildSupabase({ user = { id: 'user-1' }, partnerData = { id: 'partner-1' } } = {}) {
  const updateEq = vi.fn().mockResolvedValue({ error: null })
  const update = vi.fn().mockReturnValue({ eq: updateEq })
  const maybeSingle = vi.fn().mockResolvedValue({ data: partnerData, error: null })

  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn().mockImplementation((table: string) => ({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle }) }) }),
      update,
    })),
    _update: update,
  }
}

function makeReq(body: unknown, origin = 'http://localhost:3000') {
  return new Request('http://localhost/api/stripe/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.mocked(getStripe).mockReturnValue(mockStripe as any)
  mockStripe.checkout.sessions.create.mockReset()
  mockStripe.checkout.sessions.create.mockResolvedValue(mockSession)
})

describe('POST /api/stripe/create-checkout', () => {
  it('retourne 401 si non authentifié', async () => {
    const mock = buildSupabase({ user: null as any })
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    const res = await POST(makeReq({ partnerId: 'p1' }))
    expect(res.status).toBe(401)
  })

  it('retourne 403 si le partenaire n\'appartient pas à l\'utilisateur', async () => {
    const mock = buildSupabase({ partnerData: null as any })
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    const res = await POST(makeReq({ partnerId: 'p-other' }))
    expect(res.status).toBe(403)
  })

  it('retourne 400 pour un plan inconnu', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    const res = await POST(makeReq({ partnerId: 'p1', plan: 'inexistant' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/inconnu|non configuré/i)
  })

  it('crée une session freemium (mode payment) si aucun plan', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    const res = await POST(makeReq({ partnerId: 'p1' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.url).toBe(mockSession.url)
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'payment' })
    )
  })

  it('crée une session d\'abonnement (mode subscription) pour un plan payant', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    const res = await POST(makeReq({ partnerId: 'p1', plan: 'essentiel' }))
    expect(res.status).toBe(200)
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 'subscription' })
    )
  })

  it('stocke le session_id dans la table partners', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    await POST(makeReq({ partnerId: 'p1' }))
    expect(mock._update).toHaveBeenCalledWith(
      expect.objectContaining({ stripe_checkout_session_id: mockSession.id })
    )
  })

  it('retourne 500 si Stripe lève une erreur', async () => {
    mockStripe.checkout.sessions.create.mockRejectedValueOnce(new Error('Stripe down'))
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    const res = await POST(makeReq({ partnerId: 'p1' }))
    expect(res.status).toBe(500)
  })
})
