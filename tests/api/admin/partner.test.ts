import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase-server', () => ({ createServerSupabase: vi.fn() }))

import { PATCH } from '@/app/api/admin/partner/route'
import { createServerSupabase } from '@/lib/supabase-server'

function buildSupabase({ isAdmin = true, updateError = null as { message: string } | null } = {}) {
  const updateEq = vi.fn().mockResolvedValue({ error: updateError })
  const update = vi.fn().mockReturnValue({ eq: updateEq })

  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
    from: vi.fn().mockImplementation((table: string) => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: table === 'admins' && isAdmin ? { id: 'admin-1' } : null,
          }),
        }),
      }),
      update,
    })),
    _update: update,
  }
}

function makeReq(body: unknown) {
  return new Request('http://localhost/api/admin/partner', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => vi.clearAllMocks())

describe('PATCH /api/admin/partner', () => {
  it('retourne 403 si l\'utilisateur n\'est pas admin', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(buildSupabase({ isAdmin: false }) as any)
    const res = await PATCH(makeReq({ partnerId: 'p1', action: 'verify' }))
    expect(res.status).toBe(403)
  })

  it('retourne 400 si les paramètres sont manquants', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(buildSupabase() as any)
    const res = await PATCH(makeReq({ partnerId: 'p1' }))
    expect(res.status).toBe(400)
  })

  it('vérifie un partenaire (action=verify) et retourne ok:true', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    const res = await PATCH(makeReq({ partnerId: 'p1', action: 'verify' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(mock._update).toHaveBeenCalledWith(
      expect.objectContaining({ is_verified: true, status: 'active' })
    )
  })

  it('rejette un partenaire (action=reject) avec raison', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    const res = await PATCH(makeReq({ partnerId: 'p1', action: 'reject', reason: 'Documents manquants' }))
    expect(res.status).toBe(200)
    expect(mock._update).toHaveBeenCalledWith(
      expect.objectContaining({ is_verified: false, status: 'rejected', rejection_reason: 'Documents manquants' })
    )
  })

  it('retourne 500 si la base de données renvoie une erreur', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(
      buildSupabase({ updateError: { message: 'DB error' } }) as any
    )
    const res = await PATCH(makeReq({ partnerId: 'p1', action: 'verify' }))
    expect(res.status).toBe(500)
  })
})
