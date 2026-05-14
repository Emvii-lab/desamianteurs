import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase-server', () => ({ createServerSupabase: vi.fn() }))

import { PATCH } from '@/app/api/partner/absence/route'
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
  return new Request('http://localhost/api/partner/absence', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => vi.clearAllMocks())

describe('PATCH /api/partner/absence', () => {
  it('retourne 401 si non authentifié', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(buildSupabase({ user: null as any }) as any)
    const res = await PATCH(makeReq({}))
    expect(res.status).toBe(401)
  })

  it('définit les dates d\'absence et retourne ok:true', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    const res = await PATCH(makeReq({ absence_start: '2026-07-01', absence_end: '2026-07-31' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(mock._update).toHaveBeenCalledWith({
      absence_start: '2026-07-01',
      absence_end: '2026-07-31',
    })
  })

  it('passe null si les dates sont vides (effacement de l\'absence)', async () => {
    const mock = buildSupabase()
    vi.mocked(createServerSupabase).mockResolvedValue(mock as any)
    await PATCH(makeReq({ absence_start: '', absence_end: '' }))
    expect(mock._update).toHaveBeenCalledWith({ absence_start: null, absence_end: null })
  })

  it('retourne 500 si erreur base de données', async () => {
    vi.mocked(createServerSupabase).mockResolvedValue(
      buildSupabase({ updateError: { message: 'DB error' } }) as any
    )
    const res = await PATCH(makeReq({ absence_start: '2026-07-01' }))
    expect(res.status).toBe(500)
  })
})
