import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase-server', () => ({ createServerSupabase: vi.fn() }))

import { PATCH } from '@/app/api/partner/profile/route'
import { createServerSupabase } from '@/lib/supabase-server'

function buildSupabase({ user = { id: 'user-1' }, updateError = null as { message: string } | null } = {}) {
  const updateEq = vi.fn().mockResolvedValue({ error: updateError })
  const update = vi.fn().mockReturnValue({ eq: updateEq })

  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn().mockReturnValue({ update }),
    _update: update,
  }
}

function makeReq(body: unknown) {
  return new Request('http://localhost/api/partner/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => vi.clearAllMocks())

describe('PATCH /api/partner/profile', () => {
  it('retourne 401 si non authentifié', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(buildSupabase({ user: null as any }) as any)
    const res = await PATCH(makeReq({ first_name: 'Jean' }))
    expect(res.status).toBe(401)
  })

  it('met à jour les champs autorisés et retourne ok:true', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    const res = await PATCH(makeReq({ first_name: 'Jean', last_name: 'Dupont', phone: '0612345678' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(mock._update).toHaveBeenCalledWith(
      expect.objectContaining({ first_name: 'Jean', last_name: 'Dupont', phone: '0612345678' })
    )
  })

  it('ignore les champs non autorisés (whitelist)', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    await PATCH(makeReq({ first_name: 'Jean', is_verified: true, status: 'active' }))
    const updateArg = mock._update.mock.calls[0][0]
    expect(updateArg).not.toHaveProperty('is_verified')
    expect(updateArg).not.toHaveProperty('status')
    expect(updateArg).toHaveProperty('first_name', 'Jean')
  })

  it('inclut updated_at dans la mise à jour', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    await PATCH(makeReq({ first_name: 'Jean' }))
    expect(mock._update).toHaveBeenCalledWith(
      expect.objectContaining({ updated_at: expect.any(String) })
    )
  })

  it('retourne 500 si erreur base de données', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(
      buildSupabase({ updateError: { message: 'DB error' } }) as any
    )
    const res = await PATCH(makeReq({ first_name: 'Jean' }))
    expect(res.status).toBe(500)
  })
})
