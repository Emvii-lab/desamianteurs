import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase-server', () => ({ createServerSupabase: vi.fn() }))

import { PATCH } from '@/app/api/admin/review/route'
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
  return new Request('http://localhost/api/admin/review', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => vi.clearAllMocks())

describe('PATCH /api/admin/review', () => {
  it('retourne 403 si non admin', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(buildSupabase({ isAdmin: false }) as any)
    const res = await PATCH(makeReq({ reviewId: 'r1', action: 'approved' }))
    expect(res.status).toBe(403)
  })

  it('retourne 400 si reviewId ou action est absent', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(buildSupabase() as any)
    const res = await PATCH(makeReq({ reviewId: 'r1' }))
    expect(res.status).toBe(400)
  })

  it('approuve un avis (action=approved)', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    const res = await PATCH(makeReq({ reviewId: 'r1', action: 'approved' }))
    expect(res.status).toBe(200)
    expect(mock._update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'approved' })
    )
  })

  it('rejette un avis avec raison (action=rejected)', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    const res = await PATCH(makeReq({ reviewId: 'r1', action: 'rejected', reason: 'Contenu inapproprié' }))
    expect(res.status).toBe(200)
    expect(mock._update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'rejected', rejection_reason: 'Contenu inapproprié' })
    )
  })
})
